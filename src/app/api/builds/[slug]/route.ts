import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { UpdateBuildSchema } from "@/lib/validation";
import { sanitizeText } from "@/lib/sanitize";
import { checkRateLimit } from "@/lib/rate-limit";

// GET /api/builds/[slug] — get a single build
export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const build = await prisma.build.findUnique({
    where: { slug: params.slug },
    include: {
      comments: {
        where: { flagged: false },
        orderBy: { createdAt: "desc" },
        take: 50,
      },
    },
  });

  if (!build || !build.published) {
    return NextResponse.json({ error: "Build not found" }, { status: 404 });
  }

  // Increment view count (fire and forget)
  prisma.build
    .update({
      where: { id: build.id },
      data: { views: { increment: 1 } },
    })
    .catch(() => {
      /* non-critical */
    });

  // Strip editToken from response
  const { editToken: _editToken, ...publicBuild } = build;

  return NextResponse.json({
    ...publicBuild,
    tags: JSON.parse(publicBuild.tags),
    skills: JSON.parse(publicBuild.skills),
    traits: JSON.parse(publicBuild.traits),
    statPriorities: JSON.parse(publicBuild.statPriorities),
    rotation: JSON.parse(publicBuild.rotation),
    comments: publicBuild.comments,
  });
}

// PUT /api/builds/[slug] — update a build (requires editToken)
export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const rl = checkRateLimit(`update-build:${ip}`, {
    limit: 30,
    windowSeconds: 3600,
  });

  if (!rl.success) {
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      { status: 429 }
    );
  }

  const editToken = request.headers.get("x-edit-token");
  if (!editToken) {
    return NextResponse.json(
      { error: "Edit token required" },
      { status: 401 }
    );
  }

  const build = await prisma.build.findUnique({
    where: { slug: params.slug },
  });

  if (!build) {
    return NextResponse.json({ error: "Build not found" }, { status: 404 });
  }

  // Constant-time comparison would be ideal here; for MVP this is acceptable
  // since editTokens are long random strings (not passwords)
  if (build.editToken !== editToken) {
    return NextResponse.json({ error: "Invalid edit token" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = UpdateBuildSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Validation failed", details: result.error.flatten() },
      { status: 400 }
    );
  }

  const data = result.data;
  const updateData: Record<string, unknown> = {};

  if (data.title !== undefined)
    updateData.title = sanitizeText(data.title, 100);
  if (data.description !== undefined)
    updateData.description = sanitizeText(data.description, 2000);
  if (data.tags !== undefined) updateData.tags = JSON.stringify(data.tags);
  if (data.patchVersion !== undefined)
    updateData.patchVersion = sanitizeText(data.patchVersion, 20);
  if (data.weaponStyle !== undefined)
    updateData.weaponStyle = sanitizeText(data.weaponStyle, 50);
  if (data.skills !== undefined)
    updateData.skills = JSON.stringify(data.skills);
  if (data.traits !== undefined)
    updateData.traits = JSON.stringify(data.traits);
  if (data.statPriorities !== undefined)
    updateData.statPriorities = JSON.stringify(data.statPriorities);
  if (data.pros !== undefined) updateData.pros = sanitizeText(data.pros, 2000);
  if (data.cons !== undefined) updateData.cons = sanitizeText(data.cons, 2000);
  if (data.howToPlay !== undefined)
    updateData.howToPlay = sanitizeText(data.howToPlay, 5000);
  if (data.variants !== undefined)
    updateData.variants = sanitizeText(data.variants, 2000);
  if (data.rotation !== undefined)
    updateData.rotation = JSON.stringify(data.rotation);

  await prisma.build.update({
    where: { id: build.id },
    data: updateData,
  });

  return NextResponse.json({ message: "Build updated" });
}

// DELETE /api/builds/[slug] — delete a build (requires editToken)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const editToken = request.headers.get("x-edit-token");
  if (!editToken) {
    return NextResponse.json(
      { error: "Edit token required" },
      { status: 401 }
    );
  }

  const build = await prisma.build.findUnique({
    where: { slug: params.slug },
  });

  if (!build) {
    return NextResponse.json({ error: "Build not found" }, { status: 404 });
  }

  if (build.editToken !== editToken) {
    return NextResponse.json({ error: "Invalid edit token" }, { status: 403 });
  }

  await prisma.build.delete({ where: { id: build.id } });

  return NextResponse.json({ message: "Build deleted" });
}
