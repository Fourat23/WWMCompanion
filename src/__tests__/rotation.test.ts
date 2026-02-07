import {
  computeTimeline,
  computeRepeatedTimeline,
  formatDuration,
} from "@/lib/rotation";
import type { RotationAction } from "@/lib/validation";

function makeAction(
  overrides: Partial<RotationAction> & { skillName: string }
): RotationAction {
  return {
    id: overrides.id ?? overrides.skillName,
    skillName: overrides.skillName,
    castTime: overrides.castTime ?? 1,
    cooldown: overrides.cooldown ?? 0,
    buffDuration: overrides.buffDuration,
    notes: overrides.notes,
    color: overrides.color,
  };
}

describe("computeTimeline", () => {
  it("returns empty timeline for no actions", () => {
    const result = computeTimeline([]);
    expect(result.entries).toHaveLength(0);
    expect(result.totalDuration).toBe(0);
    expect(result.totalCastTime).toBe(0);
    expect(result.totalDowntime).toBe(0);
    expect(result.warnings).toHaveLength(0);
  });

  it("computes a single action correctly", () => {
    const actions = [makeAction({ skillName: "Slash", castTime: 1.5 })];
    const result = computeTimeline(actions);

    expect(result.entries).toHaveLength(1);
    expect(result.entries[0].startTime).toBe(0);
    expect(result.entries[0].endTime).toBe(1.5);
    expect(result.entries[0].isAvailable).toBe(true);
    expect(result.totalDuration).toBe(1.5);
    expect(result.totalCastTime).toBe(1.5);
    expect(result.totalDowntime).toBe(0);
  });

  it("sequences multiple actions without cooldowns", () => {
    const actions = [
      makeAction({ skillName: "Slash", castTime: 1 }),
      makeAction({ skillName: "Stab", castTime: 0.5 }),
      makeAction({ skillName: "Spin", castTime: 2 }),
    ];
    const result = computeTimeline(actions);

    expect(result.entries).toHaveLength(3);
    expect(result.entries[0].startTime).toBe(0);
    expect(result.entries[0].endTime).toBe(1);
    expect(result.entries[1].startTime).toBe(1);
    expect(result.entries[1].endTime).toBe(1.5);
    expect(result.entries[2].startTime).toBe(1.5);
    expect(result.entries[2].endTime).toBe(3.5);
    expect(result.totalDuration).toBe(3.5);
    expect(result.totalCastTime).toBe(3.5);
    expect(result.totalDowntime).toBe(0);
  });

  it("detects cooldown conflicts and adds downtime", () => {
    const actions = [
      makeAction({
        id: "slash-1",
        skillName: "Slash",
        castTime: 1,
        cooldown: 5,
      }),
      makeAction({ skillName: "Stab", castTime: 0.5 }),
      makeAction({
        id: "slash-2",
        skillName: "Slash",
        castTime: 1,
        cooldown: 5,
      }),
    ];
    const result = computeTimeline(actions);

    expect(result.entries).toHaveLength(3);
    // Slash at 0-1, Stab at 1-1.5, then Slash CD ready at 5
    expect(result.entries[2].startTime).toBe(5); // Waited for cooldown
    expect(result.entries[2].endTime).toBe(6);
    expect(result.entries[2].isAvailable).toBe(false);

    expect(result.totalDowntime).toBeCloseTo(3.5); // 5 - 1.5 = 3.5s waiting
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0]).toContain("Slash");
  });

  it("tracks skill usage counts", () => {
    const actions = [
      makeAction({ id: "s1", skillName: "Slash", castTime: 1 }),
      makeAction({ id: "s2", skillName: "Stab", castTime: 1 }),
      makeAction({ id: "s3", skillName: "Slash", castTime: 1 }),
      makeAction({ id: "s4", skillName: "Slash", castTime: 1 }),
    ];
    const result = computeTimeline(actions);

    expect(result.skillUsageCounts["Slash"]).toBe(3);
    expect(result.skillUsageCounts["Stab"]).toBe(1);
  });

  it("handles zero cast time actions", () => {
    const actions = [
      makeAction({ skillName: "Buff", castTime: 0 }),
      makeAction({ skillName: "Slash", castTime: 1 }),
    ];
    const result = computeTimeline(actions);

    expect(result.entries[0].startTime).toBe(0);
    expect(result.entries[0].endTime).toBe(0);
    expect(result.entries[1].startTime).toBe(0);
    expect(result.entries[1].endTime).toBe(1);
    expect(result.totalDuration).toBe(1);
  });

  it("tracks multiple skill cooldowns independently", () => {
    const actions = [
      makeAction({
        id: "s1",
        skillName: "Slash",
        castTime: 1,
        cooldown: 3,
      }),
      makeAction({
        id: "h1",
        skillName: "Heal",
        castTime: 1,
        cooldown: 5,
      }),
      makeAction({
        id: "s2",
        skillName: "Slash",
        castTime: 1,
        cooldown: 3,
      }),
      makeAction({
        id: "h2",
        skillName: "Heal",
        castTime: 1,
        cooldown: 5,
      }),
    ];
    const result = computeTimeline(actions);

    // Slash at 0-1 (CD ready at 3), Heal at 1-2 (CD ready at 6)
    // Slash again: current=2, CDready=3 -> wait to 3, cast 3-4
    expect(result.entries[2].startTime).toBe(3);
    expect(result.entries[2].endTime).toBe(4);
    // Heal again: current=4, CDready=6 -> wait to 6, cast 6-7
    expect(result.entries[3].startTime).toBe(6);
    expect(result.entries[3].endTime).toBe(7);
  });

  it("computes downtime windows correctly", () => {
    const actions = [
      makeAction({
        id: "a1",
        skillName: "A",
        castTime: 1,
        cooldown: 4,
      }),
      makeAction({
        id: "a2",
        skillName: "A",
        castTime: 1,
        cooldown: 4,
      }),
    ];
    const result = computeTimeline(actions);

    expect(result.downtimeWindows).toHaveLength(1);
    expect(result.downtimeWindows[0].start).toBe(1);
    expect(result.downtimeWindows[0].end).toBe(4);
    expect(result.downtimeWindows[0].duration).toBe(3);
  });
});

describe("computeRepeatedTimeline", () => {
  it("repeats a rotation N times", () => {
    const actions = [
      makeAction({ skillName: "Slash", castTime: 1 }),
      makeAction({ skillName: "Stab", castTime: 0.5 }),
    ];
    const result = computeRepeatedTimeline(actions, 3);

    expect(result.entries).toHaveLength(6);
    expect(result.totalDuration).toBe(4.5); // 3 * 1.5
  });

  it("clamps repetitions to max 10", () => {
    const actions = [makeAction({ skillName: "Slash", castTime: 1 })];
    const result = computeRepeatedTimeline(actions, 100);
    expect(result.entries).toHaveLength(10);
  });

  it("clamps repetitions to min 1", () => {
    const actions = [makeAction({ skillName: "Slash", castTime: 1 })];
    const result = computeRepeatedTimeline(actions, 0);
    expect(result.entries).toHaveLength(1);
  });
});

describe("formatDuration", () => {
  it("formats seconds under 60", () => {
    expect(formatDuration(0)).toBe("0.0s");
    expect(formatDuration(5.5)).toBe("5.5s");
    expect(formatDuration(59.9)).toBe("59.9s");
  });

  it("formats durations over 60 seconds as minutes", () => {
    expect(formatDuration(60)).toBe("1m 0.0s");
    expect(formatDuration(90.5)).toBe("1m 30.5s");
    expect(formatDuration(125)).toBe("2m 5.0s");
  });
});
