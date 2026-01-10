import { PrismaClient } from "@prisma/client";

// Ensure we always target the app schema in Postgres, even if the env var omits it.
const ensureAppSchema = (url?: string) => {
  if (!url) return url;
  // Trim accidental whitespace from env values
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  // If a schema is already provided, leave it alone.
  if (/[\?&]schema=/i.test(trimmed)) return trimmed;
  const separator = trimmed.includes("?") ? "&" : "?";
  return `${trimmed}${separator}schema=app`;
};

const databaseUrl = ensureAppSchema(process.env.DATABASE_URL);

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: databaseUrl
      ? {
          db: { url: databaseUrl },
        }
      : undefined,
    log: ["warn", "error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

