import { NextRequest, NextResponse } from "next/server";

import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const parseActionSteps = (value: unknown) => {
  if (!value || typeof value !== "string") return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

export async function GET(request: NextRequest) {
  const { user, response } = await requireUser(request);
  if (!user) return response;

  const categoryId = request.nextUrl.searchParams.get("categoryId") ?? undefined;

  const clips = await prisma.clip.findMany({
    where: {
      userId: user.id,
      ...(categoryId ? { categoryId } : {}),
    },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  const parsed = clips.map((clip) => ({
    ...clip,
    actionSteps: parseActionSteps(clip.actionSteps),
  }));

  return NextResponse.json({ clips: parsed });
}

