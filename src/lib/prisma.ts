import { PrismaClient } from "@prisma/client";

// Ensure we always target the app schema in Postgres, even if the env var omits it.
const ensureAppSchema = (url?: string) => {
  if (!url) return url;
  // If a schema is already provided, leave it alone.
  if (/[\?&]schema=/i.test(url)) return url;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}schema=app`;
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

