import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@fileforge.com";
  const password = "fileforge2026";
  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      role: "ADMIN",
      hashedPassword: hashedPassword,
    },
    create: {
      email,
      name: "FileForge Admin",
      hashedPassword: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("Admin account created/updated:", admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
