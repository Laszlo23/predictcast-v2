import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    const market = await prisma.market.findUnique({
      where: { slug },
      include: {
        creator: true,
        predictions: {
          include: {
            user: true,
          },
        },
        _count: {
          select: {
            predictions: true,
          },
        },
      },
    });

    if (!market) {
      return NextResponse.json(
        { error: 'Market not found' },
        { status: 404 }
      );
    }

    // Calculate vote splits
    const predictions = market.predictions;
    const optionAVotes = predictions.filter(p => p.choice === 'OPTION_A').length;
    const optionBVotes = predictions.filter(p => p.choice === 'OPTION_B').length;
    const totalVotes = optionAVotes + optionBVotes;

    const marketWithVotes = {
      ...market,
      voteSplit: {
        optionA: optionAVotes,
        optionB: optionBVotes,
        total: totalVotes,
      },
    };

    return NextResponse.json(marketWithVotes);
  } catch (error) {
    console.error('Error fetching market:', error);
    return NextResponse.json(
      { error: 'Failed to fetch market' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const body = await request.json();
    const { outcome } = body;

    if (!outcome || !['OPTION_A', 'OPTION_B', 'CANCELLED'].includes(outcome)) {
      return NextResponse.json(
        { error: 'Invalid outcome' },
        { status: 400 }
      );
    }

    const market = await prisma.market.findUnique({
      where: { slug },
    });

    if (!market) {
      return NextResponse.json(
        { error: 'Market not found' },
        { status: 404 }
      );
    }

    if (market.resolvedAt) {
      return NextResponse.json(
        { error: 'Market already resolved' },
        { status: 400 }
      );
    }

    const updatedMarket = await prisma.market.update({
      where: { slug },
      data: {
        outcome,
        resolvedAt: new Date(),
      },
      include: {
        creator: true,
        predictions: {
          include: {
            user: true,
          },
        },
      },
    });

    // Update user stats for correct predictions
    if (outcome !== 'CANCELLED') {
      const correctPredictions = await prisma.prediction.findMany({
        where: {
          marketId: market.id,
          choice: outcome,
        },
        include: {
          user: true,
        },
      });

      for (const prediction of correctPredictions) {
        await prisma.userStats.upsert({
          where: { userId: prediction.userId },
          update: {
            correctPredictions: {
              increment: 1,
            },
            totalWon: {
              increment: prediction.amount * 2, // Double the wager for correct predictions
            },
          },
          create: {
            userId: prediction.userId,
            correctPredictions: 1,
            totalWon: prediction.amount * 2,
            totalPredictions: 1,
            totalWagered: prediction.amount,
            winRate: 100.0,
          },
        });
      }
    }

    return NextResponse.json(updatedMarket);
  } catch (error) {
    console.error('Error resolving market:', error);
    return NextResponse.json(
      { error: 'Failed to resolve market' },
      { status: 500 }
    );
  }
}
