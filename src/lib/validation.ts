import { z } from "zod";

// --- Tags ---
export const BUILD_TAGS = [
  "PvE",
  "PvP",
  "Solo",
  "Group",
  "Beginner",
  "Advanced",
  "Meta",
  "Fun",
  "Tank",
  "DPS",
  "Support",
  "Healer",
] as const;

export type BuildTag = (typeof BUILD_TAGS)[number];

// --- Rotation Action ---
export const RotationActionSchema = z.object({
  id: z.string().min(1).max(50),
  skillName: z.string().min(1).max(100),
  castTime: z.number().min(0).max(300),
  cooldown: z.number().min(0).max(600),
  buffDuration: z.number().min(0).max(600).optional(),
  notes: z.string().max(500).optional(),
  color: z.string().max(20).optional(),
});

export type RotationAction = z.infer<typeof RotationActionSchema>;

// --- Stat Priority ---
export const StatPrioritySchema = z.object({
  stat: z.string().min(1).max(50),
  priority: z.number().int().min(1).max(20),
});

export type StatPriority = z.infer<typeof StatPrioritySchema>;

// --- Build Creation ---
export const CreateBuildSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be under 100 characters"),
  description: z.string().max(2000).optional().default(""),
  tags: z
    .array(z.enum(BUILD_TAGS))
    .max(5, "Maximum 5 tags")
    .optional()
    .default([]),
  patchVersion: z.string().max(20).optional().default(""),
  weaponStyle: z.string().max(50).optional().default(""),
  skills: z.array(z.string().max(100)).max(20).optional().default([]),
  traits: z.array(z.string().max(100)).max(20).optional().default([]),
  statPriorities: z
    .array(StatPrioritySchema)
    .max(10)
    .optional()
    .default([]),
  pros: z.string().max(2000).optional().default(""),
  cons: z.string().max(2000).optional().default(""),
  howToPlay: z.string().max(5000).optional().default(""),
  variants: z.string().max(2000).optional().default(""),
  rotation: z
    .array(RotationActionSchema)
    .max(50, "Maximum 50 rotation actions")
    .optional()
    .default([]),
});

export type CreateBuildInput = z.infer<typeof CreateBuildSchema>;

// --- Build Update (same but partial) ---
export const UpdateBuildSchema = CreateBuildSchema.partial();

export type UpdateBuildInput = z.infer<typeof UpdateBuildSchema>;

// --- Comment ---
export const CreateCommentSchema = z.object({
  buildId: z.string().min(1),
  author: z
    .string()
    .max(50)
    .optional()
    .default("Anonymous")
    .transform((v) => v || "Anonymous"),
  content: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(2000, "Comment must be under 2000 characters"),
});

export type CreateCommentInput = z.infer<typeof CreateCommentSchema>;

// --- Report ---
export const CreateReportSchema = z.object({
  buildId: z.string().optional(),
  commentId: z.string().optional(),
  reason: z.enum([
    "spam",
    "inappropriate",
    "misinformation",
    "harassment",
    "other",
  ]),
  details: z.string().max(1000).optional().default(""),
});

export type CreateReportInput = z.infer<typeof CreateReportSchema>;

// --- Vote ---
export const VoteSchema = z.object({
  buildId: z.string().min(1),
  value: z.union([z.literal(1), z.literal(-1)]),
});

export type VoteInput = z.infer<typeof VoteSchema>;

// --- Skill Submission ---
export const CreateSkillSchema = z.object({
  name: z.string().min(1).max(100),
  category: z.string().max(50).optional().default(""),
  description: z.string().max(2000).optional().default(""),
  cooldown: z.number().min(0).max(600).optional().default(0),
  castTime: z.number().min(0).max(300).optional().default(0),
  tags: z.array(z.string().max(50)).max(10).optional().default([]),
});

export type CreateSkillInput = z.infer<typeof CreateSkillSchema>;
