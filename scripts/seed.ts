import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create test users
  const users = await Promise.all([
    prisma.user.upsert({
      where: { fid: 1 },
      update: {},
      create: {
        fid: 1,
        username: 'alice',
        displayName: 'Alice Smith',
        pfpUrl: 'https://picsum.photos/200/200?random=1',
      },
    }),
    prisma.user.upsert({
      where: { fid: 2 },
      update: {},
      create: {
        fid: 2,
        username: 'bob',
        displayName: 'Bob Johnson',
        pfpUrl: 'https://picsum.photos/200/200?random=2',
      },
    }),
    prisma.user.upsert({
      where: { fid: 3 },
      update: {},
      create: {
        fid: 3,
        username: 'charlie',
        displayName: 'Charlie Brown',
        pfpUrl: 'https://picsum.photos/200/200?random=3',
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} users`);

  // Create sample markets
  const now = new Date();
  const markets = await Promise.all([
    prisma.market.upsert({
      where: { slug: 'bitcoin-price-2024' },
      update: {},
      create: {
        slug: 'bitcoin-price-2024',
        question: 'Will Bitcoin reach $100,000 by end of 2024?',
        description: 'A prediction on Bitcoin\'s price trajectory for 2024',
        optionA: 'Yes',
        optionB: 'No',
        expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        creatorId: users[0].id,
      },
    }),
    prisma.market.upsert({
      where: { slug: 'election-outcome-2024' },
      update: {},
      create: {
        slug: 'election-outcome-2024',
        question: 'Will the incumbent win the 2024 election?',
        description: 'Prediction on the outcome of the upcoming election',
        optionA: 'Yes',
        optionB: 'No',
        expiresAt: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
        creatorId: users[1].id,
      },
    }),
    prisma.market.upsert({
      where: { slug: 'ai-breakthrough-2024' },
      update: {},
      create: {
        slug: 'ai-breakthrough-2024',
        question: 'Will AGI be achieved in 2024?',
        description: 'Prediction on artificial general intelligence breakthrough',
        optionA: 'Yes',
        optionB: 'No',
        expiresAt: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
        creatorId: users[2].id,
      },
    }),
    prisma.market.upsert({
      where: { slug: 'weather-prediction' },
      update: {},
      create: {
        slug: 'weather-prediction',
        question: 'Will it rain tomorrow in San Francisco?',
        description: 'Simple weather prediction for tomorrow',
        optionA: 'Yes',
        optionB: 'No',
        expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000), // 24 hours from now
        creatorId: users[0].id,
      },
    }),
    prisma.market.upsert({
      where: { slug: 'sports-championship' },
      update: {},
      create: {
        slug: 'sports-championship',
        question: 'Will Team A win the championship?',
        description: 'Championship prediction for the upcoming season',
        optionA: 'Yes',
        optionB: 'No',
        expiresAt: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        creatorId: users[1].id,
      },
    }),
  ]);

  console.log(`✅ Created ${markets.length} markets`);

  // Create sample predictions
  const predictions = await Promise.all([
    prisma.prediction.upsert({
      where: {
        marketId_userId: {
          marketId: markets[0].id,
          userId: users[0].id,
        },
      },
      update: {},
      create: {
        marketId: markets[0].id,
        userId: users[0].id,
        choice: 'OPTION_A',
        amount: 100,
      },
    }),
    prisma.prediction.upsert({
      where: {
        marketId_userId: {
          marketId: markets[0].id,
          userId: users[1].id,
        },
      },
      update: {},
      create: {
        marketId: markets[0].id,
        userId: users[1].id,
        choice: 'OPTION_B',
        amount: 150,
      },
    }),
    prisma.prediction.upsert({
      where: {
        marketId_userId: {
          marketId: markets[1].id,
          userId: users[2].id,
        },
      },
      update: {},
      create: {
        marketId: markets[1].id,
        userId: users[2].id,
        choice: 'OPTION_A',
        amount: 200,
      },
    }),
    prisma.prediction.upsert({
      where: {
        marketId_userId: {
          marketId: markets[2].id,
          userId: users[0].id,
        },
      },
      update: {},
      create: {
        marketId: markets[2].id,
        userId: users[0].id,
        choice: 'OPTION_B',
        amount: 75,
      },
    }),
  ]);

  console.log(`✅ Created ${predictions.length} predictions`);

  // Create user stats
  const userStats = await Promise.all([
    prisma.userStats.upsert({
      where: { userId: users[0].id },
      update: {},
      create: {
        userId: users[0].id,
        totalPredictions: 2,
        correctPredictions: 1,
        totalWagered: 175,
        totalWon: 200,
        winRate: 50.0,
        rank: 1,
      },
    }),
    prisma.userStats.upsert({
      where: { userId: users[1].id },
      update: {},
      create: {
        userId: users[1].id,
        totalPredictions: 1,
        correctPredictions: 0,
        totalWagered: 150,
        totalWon: 0,
        winRate: 0.0,
        rank: 3,
      },
    }),
    prisma.userStats.upsert({
      where: { userId: users[2].id },
      update: {},
      create: {
        userId: users[2].id,
        totalPredictions: 1,
        correctPredictions: 1,
        totalWagered: 200,
        totalWon: 400,
        winRate: 100.0,
        rank: 2,
      },
    }),
  ]);

  console.log(`✅ Created ${userStats.length} user stats`);

  console.log('🎉 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
