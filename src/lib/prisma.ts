import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

function isClientStale(client: PrismaClient): boolean {
  return typeof (client as { pageVisit?: { count?: unknown } }).pageVisit?.count !== "function";
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
