import { PrismaClient } from "@prisma/client";

const email = process.argv[2];
if (!email) {
  console.error("Usage: node scripts/check-user-email.mjs <email>");
  process.exit(1);
}

const prisma = new PrismaClient();
try {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      firstName: true,
      lastName: true,
      phone: true,
      isActive: true,
      role: true,
      erpCustomerNumber: true,
      createdAt: true,
    },
  });
  console.log(JSON.stringify(user, null, 2));
} finally {
  await prisma.$disconnect();
}
