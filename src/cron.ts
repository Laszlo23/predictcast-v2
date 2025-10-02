import { prisma } from './lib/db';

export async function expireMarkets() {
  console.log('🕐 Running market expiration job...');
  
  try {
    const now = new Date();
    
    // Find markets that have expired but haven't been resolved
    const expiredMarkets = await prisma.market.findMany({
      where: {
        expiresAt: {
          lte: now,
        },
        resolvedAt: null,
      },
    });

    console.log(`Found ${expiredMarkets.length} expired markets`);

    // Mark markets as expired (you might want to auto-resolve based on some logic)
    for (const market of expiredMarkets) {
      await prisma.market.update({
        where: { id: market.id },
        data: {
          resolvedAt: now,
          outcome: 'CANCELLED', // Default to cancelled for expired markets
        },
      });
    }

    console.log(`✅ Processed ${expiredMarkets.length} expired markets`);
  } catch (error) {
    console.error('❌ Error in market expiration job:', error);
  }
}

export async function updateLeaderboard() {
  console.log('🏆 Running leaderboard update job...');
  
  try {
    // Get all user stats
    const userStats = await prisma.userStats.findMany({
      include: {
        user: true,
      },
    });

    // Sort by correct predictions, then by win rate
    const sortedStats = userStats.sort((a, b) => {
      if (a.correctPredictions !== b.correctPredictions) {
        return b.correctPredictions - a.correctPredictions;
      }
      return b.winRate - a.winRate;
    });

    // Update ranks
    for (let i = 0; i < sortedStats.length; i++) {
      await prisma.userStats.update({
        where: { id: sortedStats[i].id },
        data: {
          rank: i + 1,
          lastUpdated: new Date(),
        },
      });
    }

    console.log(`✅ Updated leaderboard for ${sortedStats.length} users`);
  } catch (error) {
    console.error('❌ Error in leaderboard update job:', error);
  }
}

export async function cleanupOldData() {
  console.log('🧹 Running cleanup job...');
  
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Delete old resolved markets (optional - you might want to keep them for analytics)
    const deletedMarkets = await prisma.market.deleteMany({
      where: {
        resolvedAt: {
          not: null,
          lt: thirtyDaysAgo,
        },
      },
    });

    console.log(`✅ Cleaned up ${deletedMarkets.count} old markets`);
  } catch (error) {
    console.error('❌ Error in cleanup job:', error);
  }
}

// Run all jobs
export async function runAllJobs() {
  console.log('🚀 Starting scheduled jobs...');
  
  await Promise.all([
    expireMarkets(),
    updateLeaderboard(),
    cleanupOldData(),
  ]);
  
  console.log('✅ All scheduled jobs completed');
}

// If running directly (for testing)
if (require.main === module) {
  runAllJobs()
    .catch(console.error)
    .finally(() => process.exit(0));
}
