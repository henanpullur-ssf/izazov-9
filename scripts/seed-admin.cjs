/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("ERROR: DATABASE_URL is not set in the environment.");
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString: dbUrl });
const prisma = new PrismaClient({ adapter });

async function seedAdmin() {
  const adminEmail = "admin@izazov9.com";
  const rawPassword = "Admin@12345";
  const passwordHash = await bcrypt.hash(rawPassword, 10);

  try {
    const user = await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        role: "SUPER_ADMIN",
        passwordHash: passwordHash,
      },
      create: {
        name: "Super Administrator",
        email: adminEmail,
        role: "SUPER_ADMIN",
        passwordHash: passwordHash,
      },
    });

    console.log(`[SUCCESS] Admin user verified in database:`);
    console.log(`- Email: ${user.email}`);
    console.log(`- Role: ${user.role}`);
    console.log(`- ID: ${user.id}`);
  } catch (error) {
    console.error("[ERROR] Failed to create admin user:", error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedAdmin();
