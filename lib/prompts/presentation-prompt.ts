export function createPresentationPrompt(
  topic: string, 
  audience: string,
  outline?: any[],
  settings?: any
) {
  const outlineInstruction = outline 
    ? `\n**STRICT OUTLINE TO FOLLOW:**\nYou MUST create exactly ${outline.length} slides matching this structure:\n${JSON.stringify(outline, null, 2)}\n`
    : '';

  const styleInstruction = settings?.theme 
    ? `\n**STYLE SETTINGS:**\n- Theme: ${settings.theme}\n- Text Density: ${settings.textDensity}\n- Art Style: ${settings.artStyle}\n`
    : '';

  return `You are a world-class presentation designer and content strategist inspired by Gamma.app.
Your goal is to create a stunning, engaging, and VISUALLY RICH presentation with icons, flowcharts, diagrams, and DATA VISUALIZATIONS.

**OUTPUT FORMAT: TOON (Token-Oriented Object Notation)**
Use "---SLIDE---" as the separator between slides.

Format structure:
---SLIDE---
slideNumber: <number>
type: <hero|content|bullets|process|flowchart|quote|big-number|chart|data>
title: <slide title>
subtitle: <optional subtitle>
content: <main content text>
bullets:
* <bullet point 1>
* <bullet point 2>
* <bullet point 3>
cta: <optional call to action>
background: <gradient-blue-purple|gradient-teal-emerald|gradient-coral-orange>
chartType: <bar|line|pie|area>
chartData:
Q1 2024: 125
Q2 2024: 158
Q3 2024: 192
Q4 2024: 234
---SLIDE---

**SLIDE TYPE GUIDELINES:**
1. **hero/cover**: Opening slide with big title and subtitle (use for slide 1)
2. **bullets**: List of key points with numbered cards (use 30% of slides)
3. **process/flowchart**: Step-by-step workflow with visual boxes and arrows (use 20% of slides)
4. **chart/data**: Data visualization with bar, line, or pie charts (use 20-30% of slides)
5. **content**: Text-focused slide with icon
6. **quote**: Inspirational quote with large text
7. **big-number**: Highlight important statistics

**VISUAL ENHANCEMENT REQUIREMENTS:**
- Use 'process' or 'flowchart' type for any multi-step processes
- Use 'chart' or 'data' type for statistics, trends, market data, growth metrics
- Each bullet point should be concise (max 10 words)
- For process slides, bullets become visual steps with icons
- For chart slides, include realistic data in chartData section
- Include emoji-style visual indicators where relevant

**CHART DATA FORMAT:**
For chart/data slides, add chartType and chartData:
- chartType: bar (for comparisons), line (for trends), pie (for distributions)
- chartData: Simple key-value pairs, one per line
Example:
chartType: bar
chartData:
Product A: 45
Product B: 38
Product C: 62
Product D: 51

**CONTENT GUIDELINES:**
- **Topic**: ${topic}
- **Audience**: ${audience}
- **Tone**: Professional, inspiring, and concise
- **Slide Count**: ${outline ? outline.length : '8-12'} slides
- **Text**: Keep it punchy. No walls of text. Use strong verbs
${outlineInstruction}
${styleInstruction}

**DISTRIBUTION:**
- 1 hero slide
- 30% bullets type (with numbered cards)
- 20% process/flowchart type (visual workflows)
- 20-30% chart/data type (visualizations)
- 20% content type
- 10% other (quote, big-number)

**IMPORTANT:**
- Start immediately with "---SLIDE---"
- Do not include any conversational text
- Ensure every slide has a 'type' and 'title'
- For 'bullets', start each line with "* "
- For 'process' or 'flowchart', use bullets to define steps
- For 'chart' or 'data', include chartType and chartData with realistic numbers
- Make data relevant to the topic "${topic}"
`;
}
