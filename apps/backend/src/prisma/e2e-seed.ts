import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

if (process.env.NODE_ENV === 'production') {
  console.error("Safety check failed: Refusing to run E2E seed in production environment.");
  process.exit(1);
}

const prisma = new PrismaClient();

async function main() {
  const testEmail = "e2e_user@example.com";
  const testPassword = "SuperSecurePassword123!";
  const passwordHash = await argon2.hash(testPassword);
  
  await prisma.user.upsert({
    where: { email: testEmail },
    update: {
      passwordHash,
      emailVerified: true,
    },
    create: {
      email: testEmail,
      passwordHash,
      name: "E2E Test User",
      emailVerified: true,
    },
  });
  console.log("Seeded E2E user");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
