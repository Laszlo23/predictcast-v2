import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'all'; // 'week', 'month', 'all'
    const limit = parseInt(searchParams.get('limit') || '10');

    let dateFilter: any = {};
    
    if (period === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      dateFilter = { lastUpdated: { gte: weekAgo } };
    } else if (period === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      dateFilter = { lastUpdated: { gte: monthAgo } };
    }

    const stats = await prisma.userStats.findMany({
      where: dateFilter,
      include: {
        user: true,
      },
      orderBy: [
        { correctPredictions: 'desc' },
        { winRate: 'desc' },
      ],
      take: limit,
    });

    // Add rank to each stat
    const statsWithRank = stats.map((stat, index) => ({
      ...stat,
      rank: index + 1,
    }));

    // Get overall stats
    const totalMarkets = await prisma.market.count();
    const activeMarkets = await prisma.market.count({
      where: {
        expiresAt: { gt: new Date() },
        resolvedAt: null,
      },
    });
    const totalPredictions = await prisma.prediction.count();
    const totalUsers = await prisma.user.count();

    return NextResponse.json({
      leaderboard: statsWithRank,
      overall: {
        totalMarkets,
        activeMarkets,
        totalPredictions,
        totalUsers,
      },
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
