import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim() || "admin@dentium.in";
  const passwordPlain = process.env.ADMIN_PASSWORD || "admin123";
  const password = await bcrypt.hash(passwordPlain, 12);

  await prisma.user.upsert({
    where: { email },
    update: {
      password,
      role: "SUPER_ADMIN",
      name: "Root Admin",
      isActive: true,
    },
    create: {
      email,
      password,
      name: "Root Admin",
      role: "SUPER_ADMIN",
      isActive: true,
    },
  });

  console.log(`Admin account ready: ${email}`);
}

main()
  .catch((error) => {
    console.error("Failed to ensure admin account:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
