import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({ log: [] });

try {
  await prisma.$queryRaw`SELECT 1`;
  console.log("Database connection OK");
  process.exit(0);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error("Database connection failed.");
  if (message.includes("P1000") || message.includes("Authentication failed")) {
    console.error("");
    console.error("Invalid PostgreSQL credentials in .env");
    console.error("Run:  npm run db:setup");
    console.error("Or set DATABASE_URL manually, e.g.:");
    console.error('  DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/dentium_india?schema=public"');
  } else if (message.includes("P1001") || message.includes("Can't reach")) {
    console.error("PostgreSQL is not running or the port in DATABASE_URL is wrong.");
    console.error("This machine has PostgreSQL on ports 5432 (v17), 5433 (v18), 5434 (v16).");
  } else {
    console.error(message);
  }
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
