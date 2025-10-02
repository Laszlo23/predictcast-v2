import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { JoinMarketRequest } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: JoinMarketRequest = await request.json();
    const { marketId, choice, amount } = body;

    // Validate required fields
    if (!marketId || !choice || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!['OPTION_A', 'OPTION_B'].includes(choice)) {
      return NextResponse.json(
        { error: 'Invalid choice' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be positive' },
        { status: 400 }
      );
    }

    // Check if market exists and is still active
    const market = await prisma.market.findUnique({
      where: { id: marketId },
    });

    if (!market) {
      return NextResponse.json(
        { error: 'Market not found' },
        { status: 404 }
      );
    }

    if (market.expiresAt <= new Date()) {
      return NextResponse.json(
        { error: 'Market has expired' },
        { status: 400 }
      );
    }

    if (market.resolvedAt) {
      return NextResponse.json(
        { error: 'Market has been resolved' },
        { status: 400 }
      );
    }

    // For now, use a default user (in production, get from auth)
    const defaultUser = await prisma.user.findFirst();
    if (!defaultUser) {
      return NextResponse.json(
        { error: 'No users found. Please seed the database first.' },
        { status: 400 }
      );
    }

    // Check if user already has a prediction for this market
    const existingPrediction = await prisma.prediction.findUnique({
      where: {
        marketId_userId: {
          marketId,
          userId: defaultUser.id,
        },
      },
    });

    if (existingPrediction) {
      return NextResponse.json(
        { error: 'User already has a prediction for this market' },
        { status: 400 }
      );
    }

    // Create the prediction
    const prediction = await prisma.prediction.create({
      data: {
        marketId,
        userId: defaultUser.id,
        choice,
        amount,
      },
      include: {
        market: true,
        user: true,
      },
    });

    // Update user stats
    await prisma.userStats.upsert({
      where: { userId: defaultUser.id },
      update: {
        totalPredictions: {
          increment: 1,
        },
        totalWagered: {
          increment: amount,
        },
      },
      create: {
        userId: defaultUser.id,
        totalPredictions: 1,
        totalWagered: amount,
        correctPredictions: 0,
        totalWon: 0,
        winRate: 0.0,
      },
    });

    return NextResponse.json(prediction, { status: 201 });
  } catch (error) {
    console.error('Error creating prediction:', error);
    return NextResponse.json(
      { error: 'Failed to create prediction' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const marketId = searchParams.get('marketId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const skip = (page - 1) * limit;

    const where: any = {};
    if (userId) where.userId = userId;
    if (marketId) where.marketId = marketId;

    const [predictions, total] = await Promise.all([
      prisma.prediction.findMany({
        where,
        include: {
          market: true,
          user: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.prediction.count({ where }),
    ]);

    return NextResponse.json({
      predictions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching predictions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch predictions' },
      { status: 500 }
    );
  }
}
