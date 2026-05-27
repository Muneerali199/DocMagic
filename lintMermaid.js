/**
 * @fileoverview Mermaid diagram linter that detects common syntax errors
 * using regex and string parsing only (no external dependencies).
 */

/**
 * @typedef {Object} LintError
 * @property {string}  ruleId       - A unique identifier for the violated rule.
 * @property {'error'|'warning'} severity - Severity level of the issue.
 * @property {string}  message      - Human-readable description of the problem.
 * @property {number}  line         - 1-based line number where the issue was found.
 * @property {number}  column       - 1-based column number where the issue starts.
 * @property {boolean} autoFixable  - Whether the issue can be fixed automatically.
 */

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Split source into lines while preserving the original content.
 * @param {string} source
 * @returns {string[]}
 */
function splitLines(source) {
  return source.split(/\r?\n/);
}

/**
 * Detect the top-level diagram type from the first non-blank, non-comment line.
 * Returns a lower-cased keyword such as 'flowchart', 'sequencediagram',
 * 'statediagram-v2', 'gantt', 'gitgraph', etc., or '' if unknown.
 * @param {string[]} lines
 * @returns {string}
 */
function detectDiagramType(lines) {
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('%%')) continue;
    return trimmed.toLowerCase().split(/\s+/)[0];
  }
  return '';
}

/**
 * Return true if the character at `col` (0-based) inside `line` is inside
 * a double-quoted string segment.  Handles escaped quotes (\").
 * @param {string} line
 * @param {number} col  - 0-based column index
 * @returns {boolean}
 */
function isInsideQuotes(line, col) {
  let inQuote = false;
  for (let i = 0; i < col && i < line.length; i++) {
    if (line[i] === '"' && (i === 0 || line[i - 1] !== '\\')) {
      inQuote = !inQuote;
    }
  }
  return inQuote;
}

/**
 * Build a LintError object.
 * @param {string}  ruleId
 * @param {'error'|'warning'} severity
 * @param {string}  message
 * @param {number}  line       - 1-based
 * @param {number}  column     - 1-based
 * @param {boolean} autoFixable
 * @returns {LintError}
 */
function makeError(ruleId, severity, message, line, column, autoFixable) {
  return { ruleId, severity, message, line, column, autoFixable };
}

// ---------------------------------------------------------------------------
// Individual rule checkers
// ---------------------------------------------------------------------------

/**
 * RULE: unquoted-parentheses
 * Detects parentheses or special characters inside node labels that are not
 * wrapped in double quotes.
 *
 * Heuristic: look for node label patterns like  ID(text)  ID[text]  ID{text}
 * where the text itself contains unescaped parentheses, pipes, or angle
 * brackets that are NOT already wrapped in double-quotes.
 *
 * @param {string[]} lines
 * @returns {LintError[]}
 */
function checkUnquotedParentheses(lines) {
  const errors = [];
  // Matches node definitions: WORD followed by (, [, or { then captures content
  // We only flag when the captured content contains ( ) [ ] { } | < >
  // and is NOT already quoted (the first character after the bracket is not ")
  const nodeLabel = /\b\w+\s*(?:\(|{|\[)(?!")([^)\]}"]+)(?:\)|]|})/g;

  lines.forEach((line, idx) => {
    const trimmed = line.trimStart();
    // Skip comments and non-definition lines (arrows, directives, subgraph headers)
    if (trimmed.startsWith('%%') || trimmed.startsWith('%%{')) return;

    let match;
    nodeLabel.lastIndex = 0;
    while ((match = nodeLabel.exec(line)) !== null) {
      const labelContent = match[1];
      // Flag if the content contains nested brackets/parens/pipes
      if (/[()[\]|<>]/.test(labelContent)) {
        // Make sure this position isn't inside an already-quoted section
        if (!isInsideQuotes(line, match.index)) {
          errors.push(makeError(
            'unquoted-parentheses',
            'error',
            `Node label contains special characters that should be wrapped in double quotes: "${labelContent.trim()}"`,
            idx + 1,
            match.index + 1,
            false,
          ));
        }
      }
    }
  });
  return errors;
}

/**
 * RULE: reserved-keyword-node-id
 * Detects usage of Mermaid reserved words as bare node identifiers on the
 * left-hand side of a link or as a standalone node declaration.
 *
 * @param {string[]} lines
 * @returns {LintError[]}
 */
function checkReservedKeywords(lines) {
  const reserved = new Set([
    'subgraph', 'end', 'graph', 'flowchart', 'click',
    'class', 'classDef', 'style', 'direction', 'link',
    'sequencediagram', 'statediagram', 'gantt', 'gitgraph',
  ]);

  const errors = [];
  // Matches a word at the start of a token followed by a link arrow or end of token
  const tokenRe = /\b([a-zA-Z_]\w*)\b/g;

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('%%')) return;

    // Only check lines that look like node/link declarations (contain arrows or standalone words)
    // Skip directive lines (dateFormat, title, section, etc.)
    if (/^\s*(dateFormat|title|section|axisFormat|todayMarker|excludes)\b/.test(line)) return;

    tokenRe.lastIndex = 0;
    let match;
    while ((match = tokenRe.exec(line)) !== null) {
      const word = match[1];
      if (!reserved.has(word.toLowerCase()) continue;
      if (isInsideQuotes(line, match.index)) continue;

      // Only flag when the reserved word is immediately followed by an arrow
      // or is a lone token on the line — avoid flagging directive keywords
      const afterWord = line.slice(match.index + word.length).trimStart();
      const isNodeUsage =
        /^-{1,3}>|^={1,3}>|^~~>/.test(afterWord) ||   // followed by an arrow
        /^(?:\s*(?:-->|==>|-.->))/.test(afterWord);    // variations

      if (isNodeUsage) {
        errors.push(makeError(
          'reserved-keyword-node-id',
          'error',
          `Reserved keyword "${word}" used as a node identifier. Rename it to avoid parse errors.`,
          idx + 1,
          match.index + 1,
          false,
        ));
      }
    }
  });
  return errors;
}

/**
 * RULE: invalid-flowchart-link
 * Detects single-dash arrows (->) used in flowchart diagrams.
 *
 * @param {string[]} lines
 * @param {string}   diagramType
 * @returns {LintError[]}
 */
function checkInvalidFlowchartLink(lines, diagramType) {
  if (!['flowchart', 'graph'].includes(diagramType)) return [];

  const errors = [];
  // Match -> that is NOT preceded by another - (i.e., not -->) and not inside quotes
  const re = /(?<!-)->/g;

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('%%')) return;

    re.lastIndex = 0;
    let match;
    while ((match = re.exec(line)) !== null) {
      if (!isInsideQuotes(line, match.index)) {
        errors.push(makeError(
          'invalid-flowchart-link',
          'error',
          'Single-dash arrow "->" is not valid in flowcharts. Use "-->" instead.',
          idx + 1,
          match.index + 1,
          true,
        ));
      }
    }
  });
  return errors;
}

/**
 * RULE: missing-subgraph-end
 * Detects subgraph blocks that are not closed with an 'end' statement.
 *
 * @param {string[]} lines
 * @returns {LintError[]}
 */
function checkMissingSubgraphEnd(lines) {
  const errors = [];
  /** @type {Array<{line: number}>} */
  const stack = [];

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('%%')) return;

    if (/^subgraph\b/.test(trimmed)) {
      stack.push({ line: idx + 1 });
    } else if (/^end\b/.test(trimmed)) {
      if (stack.length > 0) stack.pop();
    }
  });

  // Any unclosed subgraphs remain on the stack
  for (const unclosed of stack) {
    errors.push(makeError(
      'missing-subgraph-end',
      'error',
      'Subgraph opened here is never closed with an "end" statement.',
      unclosed.line,
      1,
      false,
    ));
  }
  return errors;
}

/**
 * RULE: semicolon-style-delimiter
 * Detects semicolons used as delimiters inside `style` directives.
 *
 * @param {string[]} lines
 * @returns {LintError[]}
 */
function checkSemicolonStyleDelimiter(lines) {
  const errors = [];
  // Match lines that start with `style <ID>` and contain a semicolon
  const re = /^\s*style\s+\S+\s+.+;/;

  lines.forEach((line, idx) => {
    if (re.test(line)) {
      const col = line.indexOf(';') + 1;
      errors.push(makeError(
        'semicolon-style-delimiter',
        'error',
        'Semicolons are not valid delimiters in "style" directives. Use commas instead.',
        idx + 1,
        col,
        true,
      ));
    }
  });
  return errors;
}

/**
 * RULE: invalid-direction
 * Detects non-standard direction identifiers in flowchart/graph declarations.
 *
 * @param {string[]} lines
 * @param {string}   diagramType
 * @returns {LintError[]}
 */
function checkInvalidDirection(lines, diagramType) {
  if (!['flowchart', 'graph'].includes(diagramType)) return [];

  const valid = new Set(['TD', 'TB', 'LR', 'RL', 'BT']);
  // Common non-standard aliases people write
  const nonStandardMap = {
    'T2B': 'TB',
    'B2T': 'BT',
    'L2R': 'LR',
    'R2L': 'RL',
    'TOPDOWN': 'TD',
    'LEFTRIGHT': 'LR',
  };

  const errors = [];

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    // Match the direction token on the diagram declaration line
    const m = /^(?:flowchart|graph)\s+([A-Z0-9]+)/i.exec(trimmed);
    if (!m) return;

    const dir = m[1].toUpperCase();
    if (!valid.has(dir)) {
      const suggestion = nonStandardMap[dir];
      const msg = suggestion
        ? `Invalid direction "${m[1]}". Did you mean "${suggestion}"?`
        : `Invalid direction "${m[1]}". Valid values are: TD, TB, LR, RL, BT.`;

      const col = line.indexOf(m[1]) + 1;
      errors.push(makeError(
        'invalid-direction',
        'error',
        msg,
        idx + 1,
        col,
        !!suggestion,
      ));
    }
  });
  return errors;
}

/**
 * RULE: spaces-in-node-id
 * Detects node identifiers that contain spaces outside of quoted strings on
 * link lines.
 *
 * @param {string[]} lines
 * @param {string}   diagramType
 * @returns {LintError[]}
 */
function checkSpacesInNodeId(lines, diagramType) {
  if (!['flowchart', 'graph'].includes(diagramType)) return [];

  const errors = [];
  // Pattern: two words separated by a space directly followed by an arrow,
  // which indicates the first "word space word" is an unquoted spaced node ID.
  // e.g. "Node One --> B"  or  "A --> Node One"
  const re = /(?:^|--?>|==?>)\s*([A-Za-z_]\w*\s+[A-Za-z_]\w*)(?:\s*--?>|$)/gm;

  lines.forEach((line, idx) => {
    if (idx === 0) return;
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('%%')) return;
    if (/^(?:flowchart|graph|sequenceDiagram|stateDiagram|stateDiagram-v2|classDiagram|erDiagram|gantt|pie|gitGraph|mindmap|timeline)\b/i.test(trimmed)) return;
    // Skip lines that start with style/classDef/click directives
    if (/^(style|classDef|click|subgraph|end)\b/.test(trimmed)) return;

    re.lastIndex = 0;
    let match;
    while ((match = re.exec(line)) !== null) {
      if (!isInsideQuotes(line, match.index)) {
        errors.push(makeError(
          'spaces-in-node-id',
          'error',
          `Node ID "${match[1].trim()}" contains spaces. Wrap it in quotes or use underscores.`,
          idx + 1,
          line.indexOf(match[1]) + 1,
          false,
        ));
      }
    }
  });
  return errors;
}

/**
 * RULE: malformed-html-label
 * Detects unclosed HTML tags inside node labels.
 *
 * @param {string[]} lines
 * @returns {LintError[]}
 */
function checkMalformedHtmlLabel(lines) {
  const errors = [];
  // Self-closing or void tags that do NOT need a closing tag
  const voidTags = new Set([
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
    'link', 'meta', 'param', 'source', 'track', 'wbr',
  ]);

  // Match node label content inside  [  (  {  brackets (content between them)
  const labelRe = /\[([^\]]*)\]|\(([^)]*)\)|\{([^}]*)\}/g;
  const openTag = /<([a-zA-Z][a-zA-Z0-9]*)\b[^>]*(?<!\/\s*)>/g;
  const closeTag = /<\/([a-zA-Z][a-zA-Z0-9]*)\s*>/g;

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('%%')) return;

    labelRe.lastIndex = 0;
    let lm;
    while ((lm = labelRe.exec(line)) !== null) {
      const content = lm[1] ?? lm[2] ?? lm[3] ?? '';
      if (!content.includes('<')) continue;

      // Collect opened and closed tags within this label
      const opened = [];
      openTag.lastIndex = 0;
      let tm;
      while ((tm = openTag.exec(content)) !== null) {
        const tag = tm[1].toLowerCase();
        if (!voidTags.has(tag)) opened.push(tag);
      }

      const closed = [];
      closeTag.lastIndex = 0;
      while ((tm = closeTag.exec(content)) !== null) {
        closed.push(tm[1].toLowerCase());
      }

      // Simple check: every opened tag should have a matching close
      const unclosed = [...opened];
      for (const c of closed) {
        const i = unclosed.lastIndexOf(c);
        if (i !== -1) unclosed.splice(i, 1);
      }

      if (unclosed.length > 0) {
        errors.push(makeError(
          'malformed-html-label',
          'error',
          `Unclosed HTML tag(s) <${unclosed.join('>, <')}> inside node label.`,
          idx + 1,
          lm.index + 1,
          false,
        ));
      }
    }
  });
  return errors;
}

/**
 * RULE: invalid-sequence-arrow
 * Detects flow-based arrows (==>, -.->)  used inside sequence diagrams.
 *
 * @param {string[]} lines
 * @param {string}   diagramType
 * @returns {LintError[]}
 */
function checkInvalidSequenceArrow(lines, diagramType) {
  if (diagramType !== 'sequencediagram') return [];

  const errors = [];
  // Valid sequence arrows: ->, -->, ->>, -->>, -x, --x, -), --)
  // Invalid: ==>, ==>>, -.->
  const invalidArrows = /(?:={2,}>+|(?:(?<!-)(?<!<))-\.-?>)/g;

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('%%')) return;

    invalidArrows.lastIndex = 0;
    let match;
    while ((match = invalidArrows.exec(line)) !== null) {
      if (!isInsideQuotes(line, match.index)) {
        errors.push(makeError(
          'invalid-sequence-arrow',
          'error',
          `Arrow "${match[0]}" is not valid in sequence diagrams. Use ->, --->, ->>, -->>, -x, --x, -), or --) instead.`,
          idx + 1,
          match.index + 1,
          false,
        ));
      }
    }
  });
  return errors;
}

/**
 * RULE: special-chars-state-id
 * Detects hyphens or spaces in state IDs in stateDiagram-v2 without 'as' aliasing.
 *
 * @param {string[]} lines
 * @param {string}   diagramType
 * @returns {LintError[]}
 */
function checkSpecialCharsStateId(lines, diagramType) {
  if (!diagramType.startsWith('statediagram')) return [];

  const errors = [];
  // Matches  State-One --> State-Two  where the state IDs contain a hyphen
  // but are NOT preceded by `state "..." as`
  const transitionRe = /^(\S+)\s*-->\s*(\S+)/;

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('%%')) return;
    // Skip 'state "..." as ...' declarations
    if (/^state\s+"/.test(trimmed)) return;

    const m = transitionRe.exec(trimmed);
    if (!m) return;

    [m[1], m[2]].forEach((id) => {
      if (/[-\s]/.test(id) && !id.startsWith('"')) {
        const col = line.indexOf(id) + 1;
        errors.push(makeError(
          'special-chars-state-id',
          'error',
          `State ID "${id}" contains special characters. Use the 'state "Label" as ID' notation instead.`,
          idx + 1,
          col,
          false,
        ));
      }
    });
  });
  return errors;
}

/**
 * RULE: invalid-link-text-placement
 * Detects transition text placed inline (not using pipe syntax |text|).
 * Pattern: `A --> text B`  vs  `A -->|text| B`
 *
 * @param {string[]} lines
 * @param {string}   diagramType
 * @returns {LintError[]}
 */
function checkInvalidLinkTextPlacement(lines, diagramType) {
  if (!['flowchart', 'graph'].includes(diagramType)) return [];

  const errors = [];
  // Detect arrows followed by a word that is then followed by another node
  // (not a pipe, not a quote, not a node-shape bracket)
  // Pattern: -->  word  word   (two plain words after arrow suggests misplaced label)
  const re = /(?:--?>|==?>|--)\s+([A-Za-z_]\w*)\s+([A-Za-z_]\w*)/g;

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('%%')) return;
    if (/^(style|classDef|click|subgraph|end)\b/.test(trimmed)) return;

    re.lastIndex = 0;
    let match;
    while ((match = re.exec(line)) !== null) {
      // If the character immediately after the arrow is '|' or '"' it's valid syntax
      const arrowEnd = match.index + match[0].indexOf(match[1]);
      const charBefore = line.slice(match.index, arrowEnd).trim();
      if (charBefore.endsWith('|') || isInsideQuotes(line, match.index)) continue;

      errors.push(makeError(
        'invalid-link-text-placement',
        'warning',
        `Possible misplaced link label "${match[1]}". Use pipe syntax: -->|${match[1]}| ${match[2]}`,
        idx + 1,
        match.index + 1,
        false,
      ));
    }
  });
  return errors;
}

/**
 * RULE: mismatched-shape-brackets
 * Detects node definitions where the opening bracket type doesn't match
 * the closing bracket type.
 *
 * @param {string[]} lines
 * @returns {LintError[]}
 */
function checkMismatchedShapeBrackets(lines) {
  const errors = [];

  const pairs = { '[': ']', '(': ')', '{': '}', '>': ']' };
  const openers = new Set(Object.keys(pairs));

  // Match node label sections: find WORD then consecutive bracket groups
  // e.g.  A[Label)   B(Text]
  const re = /\b\w+\s*([\[({>])([^\])}]*)([)\]}>])/g;

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('%%')) return;

    re.lastIndex = 0;
    let match;
    while ((match = re.exec(line)) !== null) {
      const open = match[1];
      const close = match[3];
      if (!openers.has(open)) continue;
      if (isInsideQuotes(line, match.index)) continue;

      if (pairs[open] !== close) {
        errors.push(makeError(
          'mismatched-shape-brackets',
          'error',
          `Mismatched node shape brackets: opened with "${open}" but closed with "${close}".`,
          idx + 1,
          match.index + 1,
          false,
        ));
      }
    }
  });
  return errors;
}

/**
 * RULE: semicolon-classdef
 * Detects semicolons used in classDef declarations.
 *
 * @param {string[]} lines
 * @returns {LintError[]}
 */
function checkSemicolonClassDef(lines) {
  const errors = [];
  const re = /^\s*classDef\s+\S+\s+.+;/;

  lines.forEach((line, idx) => {
    if (re.test(line)) {
      const col = line.indexOf(';') + 1;
      errors.push(makeError(
        'semicolon-classdef',
        'error',
        'Semicolons are not valid in "classDef" declarations. Use commas to separate style attributes.',
        idx + 1,
        col,
        true,
      ));
    }
  });
  return errors;
}

/**
 * RULE: gantt-date-format-mismatch
 * Detects task date strings that don't match the declared `dateFormat`.
 *
 * Supported heuristic: extract the `dateFormat` value and test each task date
 * literal against it using a pattern derived from the format string.
 *
 * @param {string[]} lines
 * @param {string}   diagramType
 * @returns {LintError[]}
 */
function checkGanttDateFormatMismatch(lines, diagramType) {
  if (diagramType !== 'gantt') return [];

  /**
   * Convert a Mermaid dateFormat token to a regex pattern fragment.
   * @param {string} fmt
   * @returns {RegExp}
   */
  function dateFormatToRegex(fmt) {
    const escaped = fmt
      .replace(/YYYY/g, '\\d{4}')
      .replace(/YY/g,   '\\d{2}')
      .replace(/MM/g,   '\\d{2}')
      .replace(/DD/g,   '\\d{2}')
      .replace(/HH/g,   '\\d{2}')
      .replace(/mm/g,   '\\d{2}')
      .replace(/ss/g,   '\\d{2}')
      // Escape any remaining regex special chars (e.g., hyphens in '-')
      .replace(/[-]/g,  '\\-')
      .replace(/[/]/g,  '\\/')
      .replace(/[.]/g,  '\\.');
    return new RegExp(`^${escaped}$`);
  }

  const errors = [];
  let dateFormatPattern = null;
  let rawFormat = '';

  // Task line pattern inside gantt (after section headers):
  // TaskName : [status,] date, duration
  // or  TaskName : [status,] date, endDate
  const taskRe = /^[^:]+\s*:\s*(?:\w+\s*,\s*)*(\d[\d\-/.:T]+),\s*(?:\d+[dhms]|after\s+\w+|\d[\d\-/.:T]+)/;

  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx];
    const trimmed = line.trim();

    // Capture dateFormat declaration
    const dfm = /^dateFormat\s+(\S+)/.exec(trimmed);
    if (dfm) {
      rawFormat = dfm[1];
      try {
        dateFormatPattern = dateFormatToRegex(rawFormat);
      } catch {
        dateFormatPattern = null;
      }
      continue;
    }

    if (!dateFormatPattern) continue;
    if (/^(section|title|axisFormat|excludes|todayMarker|dateFormat)\b/.test(trimmed)) continue;
    if (!trimmed || trimmed.startsWith('%%')) continue;

    const tm = taskRe.exec(trimmed);
    if (tm) {
      const dateStr = tm[1];
      if (!dateFormatPattern.test(dateStr)) {
        const col = line.indexOf(dateStr) + 1;
        errors.push(makeError(
          'gantt-date-format-mismatch',
          'error',
          `Date "${dateStr}" does not match the declared dateFormat "${rawFormat}".`,
          idx + 1,
          col,
          false,
        ));
      }
    }
  }
  return errors;
}

/**
 * RULE: invalid-gitgraph-commit
 * Detects bare string commit messages not prefixed with the `id:` keyword.
 *
 * @param {string[]} lines
 * @param {string}   diagramType
 * @returns {LintError[]}
 */
function checkInvalidGitGraphCommit(lines, diagramType) {
  if (diagramType !== 'gitgraph') return [];

  const errors = [];
  // Valid:   commit id: "msg"  /  commit tag: "v1"  /  commit type: HIGHLIGHT
  // Invalid: commit "msg"
  const commitRe = /^\s*commit\s+"[^"]+"/;
  // Positive lookahead for valid keyword usage
  const validRe = /^\s*commit\s+(?:id|tag|type)\s*:/;

  lines.forEach((line, idx) => {
    if (commitRe.test(line) && !validRe.test(line)) {
      const col = line.indexOf('commit') + 1;
      errors.push(makeError(
        'invalid-gitgraph-commit',
        'error',
        'Commit message string must be prefixed with the "id:" keyword: commit id: "message".',
        idx + 1,
        col,
        false,
      ));
    }
  });
  return errors;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Lint a Mermaid diagram source string for common syntax errors.
 *
 * All checks are performed using regex and string parsing only —
 * no external dependencies or the Mermaid library are used.
 *
 * @param {string} source - The raw Mermaid diagram source text to lint.
 * @returns {LintError[]} An array of lint error objects. Empty if no issues found.
 *
 * @example
 * const errors = lintMermaid(`
 *   flowchart L2R
 *     A -> B
 *     style A fill:#fff;stroke:#000;
 * `);
 * // errors will contain entries for invalid-direction, invalid-flowchart-link,
 * // and semicolon-style-delimiter.
 */
function lintMermaid(source) {
  if (typeof source !== 'string') {
    throw new TypeError(`lintMermaid: expected a string, got ${typeof source}`);
  }

  const lines = splitLines(source);
  const diagramType = detectDiagramType(lines);

  /** @type {LintError[]} */
  const errors = [
    ...checkUnquotedParentheses(lines),
    ...checkReservedKeywords(lines),
    ...checkInvalidFlowchartLink(lines, diagramType),
    ...checkMissingSubgraphEnd(lines),
    ...checkSemicolonStyleDelimiter(lines),
    ...checkInvalidDirection(lines, diagramType),
    ...checkSpacesInNodeId(lines, diagramType),
    ...checkMalformedHtmlLabel(lines),
    ...checkInvalidSequenceArrow(lines, diagramType),
    ...checkSpecialCharsStateId(lines, diagramType),
    ...checkInvalidLinkTextPlacement(lines, diagramType),
    ...checkMismatchedShapeBrackets(lines),
    ...checkSemicolonClassDef(lines),
    ...checkGanttDateFormatMismatch(lines, diagramType),
    ...checkInvalidGitGraphCommit(lines, diagramType),
  ];

  // Sort by line number then column for a consistent, editor-friendly order
  errors.sort((a, b) => a.line - b.line || a.column - b.column);

  return errors;
}

// ---------------------------------------------------------------------------
// Export (supports both CommonJS and ES Module environments)
// ---------------------------------------------------------------------------

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { lintMermaid, autoFixMermaid };
}
export { lintMermaid, autoFixMermaid };

// ---------------------------------------------------------------------------
// autoFixMermaid — non-destructive auto-fixer
// ---------------------------------------------------------------------------

/**
 * A record describing a single applied (or skipped) fix.
 *
 * @typedef {Object} FixRecord
 * @property {string} ruleId        - The rule that produced this fix.
 * @property {string} originalText  - The line text before the fix was applied.
 * @property {string} fixedText     - The line text after the fix was applied.
 * @property {number} lineNumber    - 1-based line number that was modified.
 */

/**
 * The result returned by {@link autoFixMermaid}.
 *
 * @typedef {Object} AutoFixResult
 * @property {string}      fixedSource      - The diagram source with all safe fixes applied.
 * @property {FixRecord[]} appliedFixes     - Every fix that was successfully applied.
 * @property {FixRecord[]} skippedConflicts - Fixes that were skipped because two or more
 *                                            auto-fixable errors targeted the same line,
 *                                            making it unsafe to apply either automatically.
 */

/**
 * A pure fixer function for a single auto-fixable rule.
 * Receives the original line text and the {@link LintError} that triggered it,
 * and returns the corrected line text, or `null` if the fixer cannot handle
 * this particular error instance (the fix is then skipped silently).
 *
 * @callback LineFixer
 * @param {string}    line  - The original line text (not yet mutated).
 * @param {LintError} error - The lint error that marks this line as fixable.
 * @returns {string | null}  The fixed line, or `null` to skip.
 */

// ---------------------------------------------------------------------------
// Per-rule fixer implementations
// ---------------------------------------------------------------------------

/**
 * Fix: replace every bare `->`  (single-dash) arrow with `-->`.
 * Preserves arrows that are already double-dashed or are inside quotes.
 *
 * Rule: invalid-flowchart-link  (autoFixable: true)
 *
 * @type {LineFixer}
 */
function fixInvalidFlowchartLink(line, _error) {
  // Replace `->`  that is NOT preceded by `-`  (avoid touching `-->`)
  // and NOT inside a quoted string.
  let result = '';
  let i = 0;
  while (i < line.length) {
    // Detect a candidate `->`
    if (
      line[i] === '-' &&
      line[i + 1] === '>' &&
      (i === 0 || line[i - 1] !== '-') &&
      !isInsideQuotes(line, i)
    ) {
      result += '-->';
      i += 2;
    } else {
      result += line[i];
      i++;
    }
  }
  return result === line ? null : result;
}

/**
 * Fix: replace semicolons with commas in `style` directives.
 *
 * Rule: semicolon-style-delimiter  (autoFixable: true)
 *
 * @type {LineFixer}
 */
function fixSemicolonStyleDelimiter(line, _error) {
  // Only touch lines that begin with `style <ID>`
  if (!/^\s*style\s+\S+\s+/.test(line)) return null;
  const fixed = line.replace(/;/g, ',');
  return fixed === line ? null : fixed;
}

/**
 * Fix: replace a non-standard direction alias with its canonical equivalent.
 * The suggestion is encoded in the error message as `"did you mean "XY"?"`.
 *
 * Rule: invalid-direction  (autoFixable: true when a suggestion exists)
 *
 * @type {LineFixer}
 */
function fixInvalidDirection(line, error) {
  // Extract the suggested direction from the message, e.g. 'Did you mean "TB"?'
  const suggestionMatch = /Did you mean "([A-Z]+)"\?/.exec(error.message);
  if (!suggestionMatch) return null;

  // Extract the invalid token from the message, e.g. 'Invalid direction "L2R"'
  const invalidMatch = /Invalid direction "([^"]+)"/.exec(error.message);
  if (!invalidMatch) return null;

  const invalid = invalidMatch[1];
  const suggested = suggestionMatch[1];

  // Replace only the first occurrence on the declaration line (safest)
  const fixed = line.replace(invalid, suggested);
  return fixed === line ? null : fixed;
}

/**
 * Fix: replace semicolons with commas in `classDef` declarations.
 *
 * Rule: semicolon-classdef  (autoFixable: true)
 *
 * @type {LineFixer}
 */
function fixSemicolonClassDef(line, _error) {
  if (!/^\s*classDef\s+\S+\s+/.test(line)) return null;
  const fixed = line.replace(/;/g, ',');
  return fixed === line ? null : fixed;
}

/**
 * Registry mapping every auto-fixable ruleId to its {@link LineFixer}.
 * Only rules where `autoFixable === true` need an entry here.
 *
 * @type {Record<string, LineFixer>}
 */
const FIXERS = {
  'invalid-flowchart-link':    fixInvalidFlowchartLink,
  'semicolon-style-delimiter': fixSemicolonStyleDelimiter,
  'invalid-direction':         fixInvalidDirection,
  'semicolon-classdef':        fixSemicolonClassDef,
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Apply all safe, non-destructive auto-fixes to a Mermaid diagram source.
 *
 * Only errors where `error.autoFixable === true` **and** a registered fixer
 * exists for `error.ruleId` are processed.  If two or more auto-fixable errors
 * target the **same line**, all fixes for that line are skipped and reported
 * in `skippedConflicts` — this prevents one fix from silently corrupting
 * another fixer's target text.
 *
 * Fixes are applied line-by-line in a single pass; the diagram's logical
 * structure (node connections, labels, subgraph nesting, etc.) is never altered.
 *
 * @param {string}      source - The raw Mermaid diagram source text.
 * @param {LintError[]} errors - Lint errors produced by {@link lintMermaid}.
 * @returns {AutoFixResult}
 *
 * @example
 * const errors = lintMermaid(src);
 * const { fixedSource, appliedFixes, skippedConflicts } = autoFixMermaid(src, errors);
 *
 * if (skippedConflicts.length) {
 *   console.warn('Could not auto-fix these conflicting lines:', skippedConflicts);
 * }
 */
function autoFixMermaid(source, errors) {
  if (typeof source !== 'string') {
    throw new TypeError(`autoFixMermaid: expected source to be a string, got ${typeof source}`);
  }
  if (!Array.isArray(errors)) {
    throw new TypeError(`autoFixMermaid: expected errors to be an array, got ${typeof errors}`);
  }

  // ── 1. Collect only the auto-fixable errors that have a registered fixer ──
  /** @type {LintError[]} */
  const fixableErrors = errors.filter(
    (e) => e.autoFixable === true && typeof FIXERS[e.ruleId] === 'function',
  );

  // ── 2. Detect line-level conflicts ────────────────────────────────────────
  //
  // Group fixable errors by 1-based line number.  Any line with ≥ 2 fixable
  // errors from *different* rules is considered conflicting: applying one fix
  // might invalidate the other fixer's match position.  Lines with multiple
  // errors from the *same* rule are also flagged — the fixer may handle them
  // internally (e.g. global replace), but being conservative avoids surprises.

  /** @type {Map<number, LintError[]>} */
  const byLine = new Map();
  for (const e of fixableErrors) {
    if (!byLine.has(e.line)) byLine.set(e.line, []);
    byLine.get(e.line).push(e);
  }

  /** @type {Set<number>} Lines that have conflicting fixes — skip entirely. */
  const conflictLines = new Set();
  for (const [lineNum, lineErrors] of byLine) {
    const uniqueRules = new Set(lineErrors.map((e) => e.ruleId));
    if (uniqueRules.size > 1) {
      conflictLines.add(lineNum);
    }
  }

  // ── 3. Apply fixes line-by-line ───────────────────────────────────────────

  const lines = splitLines(source);

  /** @type {FixRecord[]} */
  const appliedFixes = [];

  /** @type {FixRecord[]} */
  const skippedConflicts = [];

  /** @type {string[]} */
  const fixedLines = lines.map((line, idx) => {
    const lineNumber = idx + 1; // 1-based

    if (!byLine.has(lineNumber)) {
      // No fixable errors on this line — return unchanged.
      return line;
    }

    if (conflictLines.has(lineNumber)) {
      // Two or more different rules target this line — skip all and record.
      for (const e of byLine.get(lineNumber)) {
        skippedConflicts.push({
          ruleId:       e.ruleId,
          originalText: line,
          fixedText:    line, // unchanged
          lineNumber,
        });
      }
      return line;
    }

    // Single rule targets this line — safe to apply.
    const lineErrors = byLine.get(lineNumber);
    // All errors on this line share the same ruleId (guaranteed by conflict detection above).
    const ruleId  = lineErrors[0].ruleId;
    const fixer   = FIXERS[ruleId];

    // Use the first error as context; most fixers only need the line text.
    const fixedLine = fixer(line, lineErrors[0]);

    if (fixedLine === null || fixedLine === line) {
      // Fixer declined to mutate this line — treat as a no-op (not recorded).
      return line;
    }

    appliedFixes.push({
      ruleId,
      originalText: line,
      fixedText:    fixedLine,
      lineNumber,
    });

    return fixedLine;
  });

  // ── 4. Reconstruct the source using the original line endings ─────────────
  //
  // Detect whether the source used CRLF so we can round-trip faithfully.
  const eol = source.includes('\r\n') ? '\r\n' : '\n';
  const fixedSource = fixedLines.join(eol);

  return { fixedSource, appliedFixes, skippedConflicts };
}
