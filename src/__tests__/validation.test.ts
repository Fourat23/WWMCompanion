import {
  CreateBuildSchema,
  CreateCommentSchema,
  CreateReportSchema,
  VoteSchema,
  RotationActionSchema,
  CreateSkillSchema,
} from "@/lib/validation";

describe("CreateBuildSchema", () => {
  it("accepts a valid build", () => {
    const result = CreateBuildSchema.safeParse({
      title: "My Test Build",
      description: "A great build",
      tags: ["PvE", "Solo"],
      patchVersion: "1.0",
      weaponStyle: "Sword",
    });
    expect(result.success).toBe(true);
  });

  it("rejects title too short", () => {
    const result = CreateBuildSchema.safeParse({ title: "ab" });
    expect(result.success).toBe(false);
  });

  it("rejects title too long", () => {
    const result = CreateBuildSchema.safeParse({ title: "a".repeat(101) });
    expect(result.success).toBe(false);
  });

  it("rejects more than 5 tags", () => {
    const result = CreateBuildSchema.safeParse({
      title: "Test",
      tags: ["PvE", "PvP", "Solo", "Group", "Beginner", "Advanced"],
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid tag values", () => {
    const result = CreateBuildSchema.safeParse({
      title: "Test Build",
      tags: ["InvalidTag"],
    });
    expect(result.success).toBe(false);
  });

  it("applies defaults for optional fields", () => {
    const result = CreateBuildSchema.safeParse({ title: "Minimal Build" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).toBe("");
      expect(result.data.tags).toEqual([]);
      expect(result.data.rotation).toEqual([]);
    }
  });

  it("validates rotation actions within build", () => {
    const result = CreateBuildSchema.safeParse({
      title: "Build with Rotation",
      rotation: [
        {
          id: "1",
          skillName: "Slash",
          castTime: 1.5,
          cooldown: 5,
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("rejects too many rotation actions", () => {
    const rotation = Array.from({ length: 51 }, (_, i) => ({
      id: `${i}`,
      skillName: `Skill ${i}`,
      castTime: 1,
      cooldown: 0,
    }));
    const result = CreateBuildSchema.safeParse({
      title: "Too many actions",
      rotation,
    });
    expect(result.success).toBe(false);
  });
});

describe("RotationActionSchema", () => {
  it("accepts valid action", () => {
    const result = RotationActionSchema.safeParse({
      id: "abc",
      skillName: "Slash",
      castTime: 1.5,
      cooldown: 5,
      buffDuration: 10,
      notes: "Use after dodge",
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative cast time", () => {
    const result = RotationActionSchema.safeParse({
      id: "abc",
      skillName: "Slash",
      castTime: -1,
      cooldown: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing skill name", () => {
    const result = RotationActionSchema.safeParse({
      id: "abc",
      skillName: "",
      castTime: 1,
      cooldown: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects excessive cooldown", () => {
    const result = RotationActionSchema.safeParse({
      id: "abc",
      skillName: "Slash",
      castTime: 1,
      cooldown: 601,
    });
    expect(result.success).toBe(false);
  });
});

describe("CreateCommentSchema", () => {
  it("accepts valid comment", () => {
    const result = CreateCommentSchema.safeParse({
      buildId: "abc123",
      content: "Great build!",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.author).toBe("Anonymous");
    }
  });

  it("rejects empty content", () => {
    const result = CreateCommentSchema.safeParse({
      buildId: "abc123",
      content: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects content over 2000 chars", () => {
    const result = CreateCommentSchema.safeParse({
      buildId: "abc123",
      content: "a".repeat(2001),
    });
    expect(result.success).toBe(false);
  });

  it("defaults empty author to Anonymous", () => {
    const result = CreateCommentSchema.safeParse({
      buildId: "abc123",
      content: "Nice",
      author: "",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.author).toBe("Anonymous");
    }
  });
});

describe("VoteSchema", () => {
  it("accepts upvote", () => {
    const result = VoteSchema.safeParse({ buildId: "abc", value: 1 });
    expect(result.success).toBe(true);
  });

  it("accepts downvote", () => {
    const result = VoteSchema.safeParse({ buildId: "abc", value: -1 });
    expect(result.success).toBe(true);
  });

  it("rejects invalid vote value", () => {
    const result = VoteSchema.safeParse({ buildId: "abc", value: 2 });
    expect(result.success).toBe(false);
  });

  it("rejects missing buildId", () => {
    const result = VoteSchema.safeParse({ value: 1 });
    expect(result.success).toBe(false);
  });
});

describe("CreateReportSchema", () => {
  it("accepts valid report", () => {
    const result = CreateReportSchema.safeParse({
      buildId: "abc",
      reason: "spam",
      details: "This is spam",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid reason", () => {
    const result = CreateReportSchema.safeParse({
      buildId: "abc",
      reason: "invalid_reason",
    });
    expect(result.success).toBe(false);
  });
});

describe("CreateSkillSchema", () => {
  it("accepts valid skill", () => {
    const result = CreateSkillSchema.safeParse({
      name: "Dragon Strike",
      category: "Sword",
      cooldown: 8,
      castTime: 1.5,
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = CreateSkillSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });
});
