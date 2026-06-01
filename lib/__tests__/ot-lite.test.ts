import { applyOtChange, createOtChange, mergeOtChanges } from "../ot-lite";

describe("ot-lite", () => {
  it("applies update at path", () => {
    const state = { content: { title: "A" }, version: 1 };
    const change = createOtChange("title", "update", "A", "B", "user-1", 2);
    const next = applyOtChange(state, change);
    expect(next.content.title).toBe("B");
    expect(next.version).toBe(2);
  });

  it("merges changes in timestamp order", () => {
    const state = { content: {}, version: 0 };
    const changes = [
      createOtChange("a", "update", undefined, 1, "u1", 1),
      createOtChange("b", "update", undefined, 2, "u2", 2),
    ];
    changes[0].timestamp = "2026-01-01T00:00:00Z";
    changes[1].timestamp = "2026-01-02T00:00:00Z";
    const merged = mergeOtChanges(state, changes);
    expect(merged.content).toEqual({ a: 1, b: 2 });
  });
});
