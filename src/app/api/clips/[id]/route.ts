import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const patchSchema = z.object({
  categoryId: z.string().nullable().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const { user, response } = await requireUser(request);
  if (!user) return response;

  const id = params.id;
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const json = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const clip = await prisma.clip.findUnique({
    where: { id },
    select: { id: true, userId: true },
  });

  if (!clip || clip.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.clip.update({
    where: { id },
    data: { categoryId: parsed.data.categoryId ?? null },
    include: { category: true },
  });

  return NextResponse.json({ clip: updated });
}

