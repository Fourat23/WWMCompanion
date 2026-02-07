import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { VoteSchema } from "@/lib/validation";
import { hashIp } from "@/lib/hash";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const rl = checkRateLimit(`vote:${ip}`, { limit: 60, windowSeconds: 3600 });

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

  const result = VoteSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Validation failed", details: result.error.flatten() },
      { status: 400 }
    );
  }

  const { buildId, value } = result.data;
  const voterIp = hashIp(ip);

  // Check build exists
  const build = await prisma.build.findUnique({ where: { id: buildId } });
  if (!build) {
    return NextResponse.json({ error: "Build not found" }, { status: 404 });
  }

  // Upsert vote
  const existing = await prisma.vote.findUnique({
    where: { buildId_voterIp: { buildId, voterIp } },
  });

  if (existing) {
    if (existing.value === value) {
      // Remove vote (toggle off)
      await prisma.vote.delete({ where: { id: existing.id } });
      await prisma.build.update({
        where: { id: buildId },
        data: { upvotes: { decrement: value } },
      });
      return NextResponse.json({ message: "Vote removed", currentVote: 0 });
    } else {
      // Change vote
      await prisma.vote.update({
        where: { id: existing.id },
        data: { value },
      });
      // Swing by 2 (remove old, add new)
      await prisma.build.update({
        where: { id: buildId },
        data: { upvotes: { increment: value * 2 } },
      });
      return NextResponse.json({
        message: "Vote changed",
        currentVote: value,
      });
    }
  }

  // New vote
  await prisma.vote.create({ data: { buildId, voterIp, value } });
  await prisma.build.update({
    where: { id: buildId },
    data: { upvotes: { increment: value } },
  });

  return NextResponse.json(
    { message: "Vote recorded", currentVote: value },
    { status: 201 }
  );
}
