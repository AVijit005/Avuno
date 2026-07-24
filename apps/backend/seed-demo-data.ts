import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: 'chronicle-tester@example.com' },
  });

  if (!user) {
    console.error('User chronicle-tester@example.com not found');
    return;
  }

  const userId = user.id;
  console.log(`Seeding rich analytics demo data for user: ${userId}`);

  // 1. Interstellar (Movie - Completed)
  const movie1 = await prisma.movie.upsert({
    where: { slug: 'interstellar-2014' },
    update: {},
    create: {
      slug: 'interstellar-2014',
      title: 'Interstellar',
      releaseYear: 2014,
      description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
      posterUrl: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
      runtime: 169,
      genres: ['Sci-Fi', 'Drama', 'Adventure'],
    },
  });

  await prisma.userMovie.upsert({
    where: { userId_movieId: { userId, movieId: movie1.id } },
    update: { status: 'COMPLETED', hoursSpent: 3, rating: 5, favorite: true },
    create: {
      userId,
      movieId: movie1.id,
      status: 'COMPLETED',
      rating: 5,
      favorite: true,
      rewatchCount: 3,
      hoursSpent: 3,
      progressPercentage: 100,
      metadata: { review: 'Mind-bending masterpiece with Hans Zimmer\'s best score.' },
    },
  });

  // 2. The Dark Knight (Movie - Completed)
  const movie2 = await prisma.movie.upsert({
    where: { slug: 'the-dark-knight-2008' },
    update: {},
    create: {
      slug: 'the-dark-knight-2008',
      title: 'The Dark Knight',
      releaseYear: 2008,
      description: 'When the menace known as the Joker wreaks havoc and chaos on Gotham.',
      posterUrl: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
      runtime: 152,
      genres: ['Action', 'Crime', 'Drama'],
    },
  });

  await prisma.userMovie.upsert({
    where: { userId_movieId: { userId, movieId: movie2.id } },
    update: { status: 'COMPLETED', hoursSpent: 3, rating: 5, favorite: true },
    create: {
      userId,
      movieId: movie2.id,
      status: 'COMPLETED',
      rating: 5,
      favorite: true,
      hoursSpent: 3,
      progressPercentage: 100,
      metadata: { review: 'Heath Ledger performance remains unmatched in cinema history.' },
    },
  });

  // 3. Succession (TV Show - Watching)
  const show = await prisma.tvShow.upsert({
    where: { slug: 'succession-2018' },
    update: {},
    create: {
      slug: 'succession-2018',
      title: 'Succession',
      releaseYear: 2018,
      description: 'The Roy family is known for controlling the biggest media and entertainment company in the world.',
      posterUrl: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/7bMGiBXwaqcKU9XWdNKtbP8z3T4.jpg',
      totalSeasons: 4,
      totalEpisodes: 39,
      genres: ['Drama'],
    },
  });

  await prisma.userTvShow.upsert({
    where: { userId_tvShowId: { userId, tvShowId: show.id } },
    update: { status: 'WATCHING', hoursSpent: 28, currentEpisode: 28, progressPercentage: 70 },
    create: {
      userId,
      tvShowId: show.id,
      status: 'WATCHING',
      rating: 5,
      favorite: true,
      currentSeason: 3,
      currentEpisode: 8,
      hoursSpent: 28,
      progressPercentage: 70,
    },
  });

  // 4. Dune (Book - Reading)
  const book1 = await prisma.book.upsert({
    where: { slug: 'dune-1965' },
    update: {},
    create: {
      slug: 'dune-1965',
      title: 'Dune',
      releaseYear: 1965,
      author: 'Frank Herbert',
      description: 'Set on the desert planet Arrakis, Dune is the story of Paul Atreides.',
      posterUrl: 'https://covers.openlibrary.org/b/id/10521270-L.jpg',
      pageCount: 688,
      genres: ['Sci-Fi', 'Classic'],
    },
  });

  await prisma.userBook.upsert({
    where: { userId_bookId: { userId, bookId: book1.id } },
    update: { status: 'READING', hoursSpent: 18, currentPage: 412, progressPercentage: 60 },
    create: {
      userId,
      bookId: book1.id,
      status: 'READING',
      rating: 5,
      favorite: true,
      currentPage: 412,
      hoursSpent: 18,
      progressPercentage: 60,
    },
  });

  // 5. Project Hail Mary (Book - Completed)
  const book2 = await prisma.book.upsert({
    where: { slug: 'project-hail-mary-2021' },
    update: {},
    create: {
      slug: 'project-hail-mary-2021',
      title: 'Project Hail Mary',
      releaseYear: 2021,
      author: 'Andy Weir',
      description: 'Ryland Grace is the sole survivor on a desperate, last-chance mission.',
      posterUrl: 'https://covers.openlibrary.org/b/id/12838380-L.jpg',
      pageCount: 496,
      genres: ['Sci-Fi', 'Adventure'],
    },
  });

  await prisma.userBook.upsert({
    where: { userId_bookId: { userId, bookId: book2.id } },
    update: { status: 'COMPLETED', hoursSpent: 14, currentPage: 496, progressPercentage: 100 },
    create: {
      userId,
      bookId: book2.id,
      status: 'COMPLETED',
      rating: 5,
      favorite: true,
      currentPage: 496,
      hoursSpent: 14,
      progressPercentage: 100,
    },
  });

  // 6. Elden Ring (Game - Completed)
  const game1 = await prisma.game.upsert({
    where: { slug: 'elden-ring-2022' },
    update: {},
    create: {
      slug: 'elden-ring-2022',
      title: 'Elden Ring',
      releaseYear: 2022,
      developer: 'FromSoftware',
      description: 'THE NEW FANTASY ACTION RPG.',
      posterUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co4jni.png',
      genres: ['Action RPG', 'Open World'],
    },
  });

  await prisma.userGame.upsert({
    where: { userId_gameId: { userId, gameId: game1.id } },
    update: { status: 'COMPLETED', hoursSpent: 120, rating: 5, favorite: true, progressPercentage: 100 },
    create: {
      userId,
      gameId: game1.id,
      status: 'COMPLETED',
      rating: 5,
      favorite: true,
      hoursSpent: 120,
      progressPercentage: 100,
    },
  });

  // 7. Full-Stack Web Development (Course - Completed)
  const course = await prisma.course.upsert({
    where: { slug: 'full-stack-web-dev-2024' },
    update: {},
    create: {
      slug: 'full-stack-web-dev-2024',
      title: 'Full-Stack Web Development Masterclass',
      releaseYear: 2024,
      instructor: 'Antigravity Academy',
      description: 'Complete guide to React 19, NestJS, and Prisma.',
      posterUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop',
      genres: ['Technology', 'Programming'],
    },
  });

  await prisma.userCourse.upsert({
    where: { userId_courseId: { userId, courseId: course.id } },
    update: { status: 'COMPLETED', hoursSpent: 40, rating: 5, favorite: true, progressPercentage: 100 },
    create: {
      userId,
      courseId: course.id,
      status: 'COMPLETED',
      rating: 5,
      favorite: true,
      hoursSpent: 40,
      progressPercentage: 100,
    },
  });

  // 8. Journal Entries
  await prisma.journalEntry.createMany({
    data: [
      {
        userId,
        title: 'Finished Interstellar IMAX Rewatch',
        content: 'The docking scene still gives me chills every single time. Hans Zimmer\'s organ drop is unmatched.',
        mood: 'CALM',
      },
      {
        userId,
        title: 'Entering Season 4 of Succession',
        content: 'The dialogue writing is razor sharp. Shiv and Kendall\'s dynamic is peak modern television.',
        mood: 'EXCITED',
      },
      {
        userId,
        title: 'Project Hail Mary Final Chapters',
        content: 'Rocky and Grace\'s friendship is one of the most heartwarming sci-fi stories ever written.',
        mood: 'HAPPY',
      },
    ],
  });

  // 9. Timeline Events
  await prisma.timelineEvent.createMany({
    data: [
      {
        userId,
        title: 'Completed Elden Ring Defeating Malenia',
        description: 'After 45 attempts, finally mastered Waterfowl Dance dodging without summons.',
        type: 'COMPLETED',
        eventDate: new Date(),
      },
      {
        userId,
        title: 'Finished Project Hail Mary',
        description: '5-star read! Amaze, amaze, amaze!',
        type: 'COMPLETED',
        eventDate: new Date(),
      },
    ],
  });

  // 10. Demo Collection
  const collection = await prisma.collection.upsert({
    where: { userId_slug: { userId, slug: 'all-time-favorites' } },
    update: {},
    create: {
      userId,
      name: 'All-Time Favorites',
      slug: 'all-time-favorites',
      description: 'Masterpieces that shaped my media journey.',
      isPinned: true,
    },
  });

  await prisma.collectionItem.createMany({
    data: [
      { collectionId: collection.id, movieId: movie1.id },
      { collectionId: collection.id, tvShowId: show.id },
      { collectionId: collection.id, gameId: game1.id },
      { collectionId: collection.id, bookId: book2.id },
    ],
    skipDuplicates: true,
  });

  console.log('Successfully seeded rich analytics demo data for chronicle-tester@example.com!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
