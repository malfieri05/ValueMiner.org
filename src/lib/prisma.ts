import { PrismaClient } from "@prisma/client";

// Ensure we always target the app schema in Postgres, even if the env var omits it.
const normalizeDatabaseUrl = (url?: string) => {
  if (!url) return url;
  let current = url.trim();
  if (!current) return current;

  // If someone left a pooled port (6543), force direct port 5432 to avoid connectivity issues.
  current = current.replace(":6543/", ":5432/");

  // If a schema is already provided, leave it alone. Otherwise append schema=app.
  if (/[\?&]schema=/i.test(current)) return current;
  const separator = current.includes("?") ? "&" : "?";
  return `${current}${separator}schema=app`;
};

const databaseUrl = normalizeDatabaseUrl(process.env.DATABASE_URL);

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

