const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: { contains: 'testuser' } }
  });
  console.log("User:", user);
  if (user) {
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() }
    });
    console.log("Verified user!");
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
