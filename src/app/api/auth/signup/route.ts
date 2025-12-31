import { NextResponse } from "next/server";
import { z } from "zod";

import { attachSession, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export const runtime = "nodejs";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().optional(),
});

const defaultCategories = ["Business", "Relationships", "Philosophy"];

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { email, password, name } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Account already exists" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
      categories: {
        create: defaultCategories.map((cat) => ({
          name: cat,
          slug: slugify(cat),
        })),
      },
    },
    include: { categories: true },
  });

  const response = NextResponse.json(
    {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        categories: user.categories,
      },
    },
    { status: 201 },
  );

  await attachSession(response, { userId: user.id, email: user.email });
  return response;
}

