import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { categorizeTranscript, summarizeTranscript } from "@/lib/ai";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  fetchVideoMetadata,
  getTranscriptWithFallback,
  parseYouTubeId,
} from "@/lib/transcript";
import { slugify } from "@/lib/utils";

export const runtime = "nodejs";

const bodySchema = z.object({
  youtubeUrl: z.string().url(),
  categoryId: z.string().optional(),
  autoCategorize: z.boolean().optional(),
});

const parseActionSteps = (value: unknown) => {
  if (!value || typeof value !== "string") return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

export async function POST(request: NextRequest) {
  const { user, response } = await requireUser(request);
  if (!user) return response;

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const youtubeId = parseYouTubeId(parsed.data.youtubeUrl);
  if (!youtubeId) {
    return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });
  }

  let transcript: string;
  try {
    transcript = await getTranscriptWithFallback(youtubeId);
  } catch (error) {
    console.error("Transcript retrieval failed", error);
    return NextResponse.json(
      { error: "Could not fetch transcript. Make sure the video has captions enabled." },
      { status: 502 },
    );
  }

  const summary = await summarizeTranscript(transcript);
  const metadata = await fetchVideoMetadata(youtubeId);

  const categories = await prisma.category.findMany({
    where: { userId: user.id },
  });

  let categoryId = parsed.data.categoryId ?? null;

  if (!categoryId && parsed.data.autoCategorize) {
    const picked = await categorizeTranscript(
      transcript,
      categories.map((c: { name: string }) => c.name),
    );

    if (picked) {
      const existing = categories.find(
        (c: { name: string }) => c.name.toLowerCase() === picked.toLowerCase(),
      );
      if (existing) {
        categoryId = existing.id;
      } else {
        const created = await prisma.category.create({
          data: { name: picked, slug: slugify(picked), userId: user.id },
        });
        categoryId = created.id;
      }
    }
  }

  const clip = await prisma.clip.upsert({
    where: {
      youtubeId_userId: {
        youtubeId,
        userId: user.id,
      },
    },
    create: {
      youtubeId,
      youtubeUrl: parsed.data.youtubeUrl,
      transcript,
      summary: summary.summary,
      actionSteps: JSON.stringify(summary.action_steps),
      status: "PROCESSED",
      categoryId: categoryId ?? undefined,
      userId: user.id,
      title: metadata.title ?? undefined,
      thumbnailUrl: metadata.thumbnailUrl ?? undefined,
    },
    update: {
      transcript,
      summary: summary.summary,
      actionSteps: JSON.stringify(summary.action_steps),
      status: "PROCESSED",
      categoryId: categoryId ?? undefined,
      title: metadata.title ?? undefined,
      thumbnailUrl: metadata.thumbnailUrl ?? undefined,
    },
    include: { category: true },
  });

  const clipWithParsed = {
    ...clip,
    actionSteps: parseActionSteps(clip.actionSteps),
  };

  return NextResponse.json({ clip: clipWithParsed });
}

