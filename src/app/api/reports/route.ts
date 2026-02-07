import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { CreateReportSchema } from "@/lib/validation";
import { sanitizeText } from "@/lib/sanitize";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const rl = checkRateLimit(`report:${ip}`, {
    limit: 10,
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

  const result = CreateReportSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Validation failed", details: result.error.flatten() },
      { status: 400 }
    );
  }

  const data = result.data;

  if (!data.buildId && !data.commentId) {
    return NextResponse.json(
      { error: "Must specify buildId or commentId" },
      { status: 400 }
    );
  }

  await prisma.report.create({
    data: {
      buildId: data.buildId || null,
      commentId: data.commentId || null,
      reason: data.reason,
      details: sanitizeText(data.details || "", 1000),
    },
  });

  return NextResponse.json(
    { message: "Report submitted. Thank you." },
    { status: 201 }
  );
}
