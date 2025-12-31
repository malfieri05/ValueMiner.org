import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { user, response } = await requireUser(request);
  if (!user) return response;

  const categories = await prisma.category.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ categories });
}

const createSchema = z.object({
  name: z.string().min(2),
});

export async function POST(request: NextRequest) {
  const { user, response } = await requireUser(request);
  if (!user) return response;

  const json = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const name = parsed.data.name.trim();
  const slug = slugify(name);

  const existing = await prisma.category.findFirst({
    where: { userId: user.id, slug },
  });
  if (existing) {
    return NextResponse.json({ error: "Category already exists" }, { status: 409 });
  }

  const category = await prisma.category.create({
    data: { name, slug, userId: user.id },
  });

  return NextResponse.json({ category }, { status: 201 });
}

