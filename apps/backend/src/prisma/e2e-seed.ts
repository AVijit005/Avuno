let argon2Module: any;
try {
  argon2Module = require('argon2');
} catch {
  try {
    argon2Module = require('../../node_modules/argon2');
  } catch {
    argon2Module = null;
  }
}

if (process.env.NODE_ENV === 'production') {
  console.error('Safety check failed: Refusing to run E2E seed in production environment.');
  process.exit(1);
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://chronicle:chronicle@postgres:5432/chronicle?schema=public',
    },
  },
});

async function main() {
  console.log('Starting E2E seed script...');
  const testEmail = 'e2e_user@example.com';
  const testPassword = 'SuperSecurePassword123!';
  const passwordHash = argon2Module
    ? await argon2Module.hash(testPassword)
    : '$argon2id$v=19$m=65536,t=3,p=4$c29tZXNhbHQ$qU70zUu6L+1bWn4h0f4zZ3XQ+R609wM8aV3g4L4';

  const user = await prisma.user.upsert({
    where: { email: testEmail },
    update: {
      passwordHash,
      emailVerified: true,
    },
    create: {
      email: testEmail,
      passwordHash,
      name: 'E2E Test User',
      emailVerified: true,
    },
  });
  console.log('Seeded E2E user');

  // Clean library for deterministic E2E test
  await prisma.userMovie.deleteMany({
    where: { userId: user.id },
  });
  console.log('Cleaned E2E user library');

  // Seed deterministic catalog item
  await prisma.movie.upsert({
    where: { slug: 'e2e-deterministic-movie' },
    update: {},
    create: {
      slug: 'e2e-deterministic-movie',
      title: 'E2E Deterministic Movie',
      overview: 'A movie created specifically for deterministic E2E testing.',
      releaseYear: 2026,
      status: 'PUBLISHED',
    },
  });
  console.log('Seeded E2E catalog items');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
