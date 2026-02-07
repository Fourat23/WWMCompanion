import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { CreateSkillSchema } from "@/lib/validation";
import { sanitizeText } from "@/lib/sanitize";
import { generateSlug } from "@/lib/slug";
import { checkRateLimit } from "@/lib/rate-limit";

// GET /api/skills — list approved skills
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || undefined;

  const where: Record<string, unknown> = { approved: true };
  if (category) {
    where.category = category;
  }

  const skills = await prisma.skill.findMany({
    where,
    orderBy: { name: "asc" },
    select: {
      id: true,
      slug: true,
      name: true,
      category: true,
      description: true,
      cooldown: true,
      castTime: true,
      tags: true,
    },
  });

  return NextResponse.json(
    skills.map((s) => ({ ...s, tags: JSON.parse(s.tags) }))
  );
}

// POST /api/skills — submit a skill for approval
export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const rl = checkRateLimit(`create-skill:${ip}`, {
    limit: 20,
    windowSeconds: 3600,
  });

  if (!rl.success) {
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = CreateSkillSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Validation failed", details: result.error.flatten() },
      { status: 400 }
    );
  }

  const data = result.data;
  const slug = generateSlug(data.name);

  const skill = await prisma.skill.create({
    data: {
      slug,
      name: sanitizeText(data.name, 100),
      category: sanitizeText(data.category || "", 50),
      description: sanitizeText(data.description || "", 2000),
      cooldown: data.cooldown ?? 0,
      castTime: data.castTime ?? 0,
      tags: JSON.stringify(data.tags),
      approved: false, // Requires moderation
    },
  });

  return NextResponse.json(
    {
      slug: skill.slug,
      message: "Skill submitted for review.",
    },
    { status: 201 }
  );
}
