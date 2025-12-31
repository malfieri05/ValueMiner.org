import OpenAI from "openai";
import { z } from "zod";
import { truncate } from "./utils";

const model = "gpt-4o-mini";

const getClient = () => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is missing");
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
};

const SummarySchema = z.object({
  summary: z.string(),
  action_steps: z.array(z.string()).min(1).max(5),
});

export type SummaryResult = z.infer<typeof SummarySchema>;

export const summarizeTranscript = async (
  transcript: string,
): Promise<SummaryResult> => {
  const client = getClient();
  const prompt = truncate(transcript, 5000);

  const completion = await client.chat.completions.create({
    model,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You are a concise note-taker. Produce a JSON object with keys `summary` (3 sentences max) and `action_steps` (array of exactly 3 short, imperative steps).",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  const parsed = SummarySchema.safeParse(JSON.parse(raw));

  if (!parsed.success) {
    throw new Error("Failed to parse summary");
  }

  // Ensure only 3 steps to keep UI tight.
  const steps = parsed.data.action_steps.slice(0, 3);
  return { summary: parsed.data.summary, action_steps: steps };
};

export const categorizeTranscript = async (
  transcript: string,
  categories: string[],
): Promise<string | null> => {
  if (!categories.length) return null;
  const client = getClient();
  const completion = await client.chat.completions.create({
    model,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "Choose the single best category from the provided list for this content. Respond as JSON: {\"category\": \"name\"}. If nothing fits, set category to null.",
      },
      {
        role: "user",
        content: `Categories: ${categories.join(", ")}.\nContent: ${truncate(transcript, 2000)}`,
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  const parsed = z
    .object({ category: z.string().nullable() })
    .safeParse(JSON.parse(raw));
  if (!parsed.success) return null;
  return parsed.data.category;
};

