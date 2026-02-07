import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { CreateBuildSchema } from "@/lib/validation";
import { generateSlug } from "@/lib/slug";
import { generateEditToken } from "@/lib/tokens";
import { sanitizeText } from "@/lib/sanitize";
import { checkRateLimit } from "@/lib/rate-limit";

// GET /api/builds — list published builds
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
  const sort = searchParams.get("sort") === "top" ? "top" : "new";
  const tag = searchParams.get("tag") || undefined;

  const where: Record<string, unknown> = {
    published: true,
    flagged: false,
  };

  if (tag) {
    where.tags = { contains: `"${tag}"` };
  }

  const [builds, total] = await Promise.all([
    prisma.build.findMany({
      where,
      orderBy: sort === "top" ? { upvotes: "desc" } : { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        tags: true,
        patchVersion: true,
        weaponStyle: true,
        upvotes: true,
        views: true,
        createdAt: true,
      },
    }),
    prisma.build.count({ where }),
  ]);

  const parsed = builds.map((b) => ({
    ...b,
    tags: JSON.parse(b.tags),
  }));

  return NextResponse.json({
    builds: parsed,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
}

// POST /api/builds — create a new build
export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const rl = checkRateLimit(`create-build:${ip}`, {
    limit: 10,
    windowSeconds: 3600,
  });

  if (!rl.success) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again later." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = CreateBuildSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Validation failed", details: result.error.flatten() },
      { status: 400 }
    );
  }

  const data = result.data;
  const slug = generateSlug(data.title);
  const editToken = generateEditToken();

  const build = await prisma.build.create({
    data: {
      slug,
      editToken,
      title: sanitizeText(data.title, 100),
      description: sanitizeText(data.description || "", 2000),
      tags: JSON.stringify(data.tags),
      patchVersion: sanitizeText(data.patchVersion || "", 20),
      weaponStyle: sanitizeText(data.weaponStyle || "", 50),
      skills: JSON.stringify(data.skills),
      traits: JSON.stringify(data.traits),
      statPriorities: JSON.stringify(data.statPriorities),
      pros: sanitizeText(data.pros || "", 2000),
      cons: sanitizeText(data.cons || "", 2000),
      howToPlay: sanitizeText(data.howToPlay || "", 5000),
      variants: sanitizeText(data.variants || "", 2000),
      rotation: JSON.stringify(data.rotation),
    },
  });

  return NextResponse.json(
    {
      slug: build.slug,
      editToken: build.editToken,
      message:
        "Build created. Save your edit token — it's the only way to edit this build.",
    },
    { status: 201 }
  );
}
