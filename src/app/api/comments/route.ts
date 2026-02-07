import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { CreateCommentSchema } from "@/lib/validation";
import { sanitizeText } from "@/lib/sanitize";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const rl = checkRateLimit(`comment:${ip}`, {
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

  const result = CreateCommentSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Validation failed", details: result.error.flatten() },
      { status: 400 }
    );
  }

  const data = result.data;

  // Check build exists
  const build = await prisma.build.findUnique({
    where: { id: data.buildId },
  });
  if (!build) {
    return NextResponse.json({ error: "Build not found" }, { status: 404 });
  }

  const comment = await prisma.comment.create({
    data: {
      buildId: data.buildId,
      author: sanitizeText(data.author, 50),
      content: sanitizeText(data.content, 2000),
    },
  });

  return NextResponse.json(comment, { status: 201 });
}
