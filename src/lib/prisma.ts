import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

/** Models added after initial deploy — stale cached clients in dev omit these delegates */
const REQUIRED_DELEGATES = [
  "pageVisit",
  "newsletterSubscriber",
  "downloadResource",
  "galleryImage",
  "companyHistory",
  "teamMember",
] as const;

function isClientStale(client: PrismaClient): boolean {
  const c = client as unknown as Record<string, { findMany?: unknown } | undefined>;
  return REQUIRED_DELEGATES.some((key) => typeof c[key]?.findMany !== "function");
}

let prisma = globalForPrisma.prisma ?? createPrismaClient();

// Dev hot-reload can keep an old PrismaClient without newer models (e.g. PageVisit)
if (process.env.NODE_ENV !== "production" && isClientStale(prisma)) {
  prisma = createPrismaClient();
}

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export { prisma };
