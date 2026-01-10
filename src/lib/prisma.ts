import { PrismaClient } from "@prisma/client";

// Ensure we always target the app schema in Postgres, even if the env var omits it.
const normalizeDatabaseUrl = (url?: string) => {
  if (!url) return url;
  let current = url.trim();
  if (!current) return current;

  // If a schema is already provided, leave it alone. Otherwise append schema=app.
  if (!/[\?&]schema=/i.test(current)) {
    const separator = current.includes("?") ? "&" : "?";
    current = `${current}${separator}schema=app`;
  }
  return current;
};

// Prefer an explicit pooled URL if provided, otherwise use DATABASE_URL.
const rawUrl = process.env.DATABASE_POOL_URL || process.env.DATABASE_URL;
const databaseUrl = normalizeDatabaseUrl(rawUrl);

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

