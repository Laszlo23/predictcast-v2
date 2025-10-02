import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { CreateMarketRequest } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status'); // 'active', 'resolved', 'expired'

    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (status === 'active') {
      where.expiresAt = { gt: new Date() };
      where.resolvedAt = null;
    } else if (status === 'resolved') {
      where.resolvedAt = { not: null };
    } else if (status === 'expired') {
      where.expiresAt = { lte: new Date() };
      where.resolvedAt = null;
    }

    const [markets, total] = await Promise.all([
      prisma.market.findMany({
        where,
        include: {
          creator: true,
          predictions: {
            select: {
              choice: true,
              amount: true,
            },
          },
          _count: {
            select: {
              predictions: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.market.count({ where }),
    ]);

    // Calculate vote splits for each market
    const marketsWithVotes = markets.map(market => {
      const predictions = market.predictions;
      const optionAVotes = predictions.filter(p => p.choice === 'OPTION_A').length;
      const optionBVotes = predictions.filter(p => p.choice === 'OPTION_B').length;
      const totalVotes = optionAVotes + optionBVotes;

      return {
        ...market,
        voteSplit: {
          optionA: optionAVotes,
          optionB: optionBVotes,
          total: totalVotes,
        },
      };
    });

    return NextResponse.json({
      markets: marketsWithVotes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching markets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch markets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateMarketRequest = await request.json();
    const { question, description, optionA, optionB, expiresAt } = body;

    // Validate required fields
    if (!question || !optionA || !optionB || !expiresAt) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate expiration date
    const expirationDate = new Date(expiresAt);
    if (expirationDate <= new Date()) {
      return NextResponse.json(
        { error: 'Expiration date must be in the future' },
        { status: 400 }
      );
    }

    // Generate slug from question
    const slug = question
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);

    // Ensure slug is unique
    let finalSlug = slug;
    let counter = 1;
    while (await prisma.market.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${slug}-${counter}`;
      counter++;
    }

    // For now, create with a default user (in production, get from auth)
    const defaultUser = await prisma.user.findFirst();
    if (!defaultUser) {
      return NextResponse.json(
        { error: 'No users found. Please seed the database first.' },
        { status: 400 }
      );
    }

    const market = await prisma.market.create({
      data: {
        slug: finalSlug,
        question,
        description,
        optionA,
        optionB,
        expiresAt: expirationDate,
        creatorId: defaultUser.id,
      },
      include: {
        creator: true,
      },
    });

    return NextResponse.json(market, { status: 201 });
  } catch (error) {
    console.error('Error creating market:', error);
    return NextResponse.json(
      { error: 'Failed to create market' },
      { status: 500 }
    );
  }
}
