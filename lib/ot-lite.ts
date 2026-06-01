/**
 * OT-lite: last-writer-wins per JSON path with version ordering.
 * Suitable for shallow document objects (resume/presentation content).
 */

export interface OtChange {
  path: string;
  change_type: "insert" | "delete" | "update" | "format";
  old_value?: unknown;
  new_value?: unknown;
  version: number;
  user_id: string;
  timestamp: string;
}

export interface OtDocumentState {
  content: Record<string, unknown>;
  version: number;
}

function getAtPath(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.split(".").filter(Boolean);
  let current: unknown = obj;
  for (const part of parts) {
    if (current == null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

function setAtPath(
  obj: Record<string, unknown>,
  path: string,
  value: unknown,
): void {
  const parts = path.split(".").filter(Boolean);
  if (parts.length === 0) return;
  let current: Record<string, unknown> = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i];
    if (current[key] == null || typeof current[key] !== "object") {
      current[key] = {};
    }
    current = current[key] as Record<string, unknown>;
  }
  const last = parts[parts.length - 1];
  if (value === undefined) {
    delete current[last];
  } else {
    current[last] = value;
  }
}

/** Apply a single remote change if it is newer than the local version for that path. */
export function applyOtChange(
  state: OtDocumentState,
  change: OtChange,
): OtDocumentState {
  const next = {
    content: { ...state.content },
    version: Math.max(state.version, change.version),
  };

  if (change.change_type === "delete") {
    setAtPath(next.content, change.path, undefined);
    return next;
  }

  if (change.new_value !== undefined) {
    setAtPath(next.content, change.path, change.new_value);
  }

  return next;
}

/** Merge pending local changes with incoming remote (remote wins on same path if newer). */
export function mergeOtChanges(
  state: OtDocumentState,
  changes: OtChange[],
): OtDocumentState {
  const sorted = [...changes].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );
  return sorted.reduce(applyOtChange, state);
}

/** Build a change payload from a local edit. */
export function createOtChange(
  path: string,
  changeType: OtChange["change_type"],
  oldValue: unknown,
  newValue: unknown,
  userId: string,
  version: number,
): OtChange {
  return {
    path,
    change_type: changeType,
    old_value: oldValue,
    new_value: newValue,
    version,
    user_id: userId,
    timestamp: new Date().toISOString(),
  };
}

export function diffPath(
  before: Record<string, unknown>,
  after: Record<string, unknown>,
  prefix = "",
): Array<{ path: string; old_value: unknown; new_value: unknown }> {
  const diffs: Array<{ path: string; old_value: unknown; new_value: unknown }> =
    [];
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);

  for (const key of keys) {
    const path = prefix ? `${prefix}.${key}` : key;
    const oldVal = before[key];
    const newVal = after[key];

    if (
      oldVal &&
      newVal &&
      typeof oldVal === "object" &&
      typeof newVal === "object" &&
      !Array.isArray(oldVal) &&
      !Array.isArray(newVal)
    ) {
      diffs.push(
        ...diffPath(
          oldVal as Record<string, unknown>,
          newVal as Record<string, unknown>,
          path,
        ),
      );
    } else if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      diffs.push({ path, old_value: oldVal, new_value: newVal });
    }
  }

  return diffs;
}

export { getAtPath };
