import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateFrameHtml, verifyFrameSignature } from '@/lib/frames';
import { FrameData } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'view';

    const market = await prisma.market.findUnique({
      where: { slug },
      include: {
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
    });

    if (!market) {
      return new NextResponse('Market not found', { status: 404 });
    }

    // Calculate vote splits
    const predictions = market.predictions;
    const optionAVotes = predictions.filter(p => p.choice === 'OPTION_A').length;
    const optionBVotes = predictions.filter(p => p.choice === 'OPTION_B').length;

    const imageUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/og?question=${encodeURIComponent(market.question)}&optionA=${encodeURIComponent(market.optionA)}&optionB=${encodeURIComponent(market.optionB)}&expiresAt=${market.expiresAt.toISOString()}&optionAVotes=${optionAVotes}&optionBVotes=${optionBVotes}`;

    let buttons: Array<{ label: string; action: string; target?: string }> = [];
    let postUrl: string | undefined;

    if (action === 'view') {
      if (market.expiresAt > new Date() && !market.resolvedAt) {
        buttons = [
          { label: market.optionA, action: 'post', target: `${process.env.NEXT_PUBLIC_APP_URL}/api/frames/${slug}/join?choice=OPTION_A` },
          { label: market.optionB, action: 'post', target: `${process.env.NEXT_PUBLIC_APP_URL}/api/frames/${slug}/join?choice=OPTION_B` },
          { label: 'Refresh', action: 'post', target: `${process.env.NEXT_PUBLIC_APP_URL}/frames/${slug}` },
        ];
        postUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/frames/${slug}/join`;
      } else {
        buttons = [
          { label: 'View Results', action: 'link', target: `${process.env.NEXT_PUBLIC_APP_URL}/markets/${slug}` },
          { label: 'New Prediction', action: 'link', target: `${process.env.NEXT_PUBLIC_APP_URL}/create` },
        ];
      }
    }

    const html = generateFrameHtml(
      market.question,
      imageUrl,
      buttons,
      postUrl
    );

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error('Error rendering frame:', error);
    return new NextResponse('Error rendering frame', { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const body = await request.json();
    const frameData: FrameData = body;

    // Verify frame signature
    const isValid = await verifyFrameSignature(frameData);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid frame signature' },
        { status: 401 }
      );
    }

    const buttonIndex = frameData.untrustedData.buttonIndex;
    const fid = frameData.untrustedData.fid;

    // Get or create user
    let user = await prisma.user.findUnique({
      where: { fid },
    });

    if (!user) {
      // In a real app, you'd fetch user data from Neynar here
      user = await prisma.user.create({
        data: {
          fid,
          username: `user_${fid}`,
          displayName: `User ${fid}`,
        },
      });
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

    if (market.expiresAt <= new Date() || market.resolvedAt) {
      return NextResponse.json(
        { error: 'Market is no longer active' },
        { status: 400 }
      );
    }

    // Handle different button actions
    if (buttonIndex === 1 || buttonIndex === 2) {
      // Join market with choice
      const choice = buttonIndex === 1 ? 'OPTION_A' : 'OPTION_B';
      const amount = 100; // Default amount

      // Check if user already has a prediction
      const existingPrediction = await prisma.prediction.findUnique({
        where: {
          marketId_userId: {
            marketId: market.id,
            userId: user.id,
          },
        },
      });

      if (existingPrediction) {
        return NextResponse.json({
          message: 'You already have a prediction for this market!',
          choice: existingPrediction.choice,
        });
      }

      // Create prediction
      await prisma.prediction.create({
        data: {
          marketId: market.id,
          userId: user.id,
          choice,
          amount,
        },
      });

      // Update user stats
      await prisma.userStats.upsert({
        where: { userId: user.id },
        update: {
          totalPredictions: { increment: 1 },
          totalWagered: { increment: amount },
        },
        create: {
          userId: user.id,
          totalPredictions: 1,
          totalWagered: amount,
          correctPredictions: 0,
          totalWon: 0,
          winRate: 0.0,
        },
      });

      return NextResponse.json({
        message: `Successfully predicted ${choice === 'OPTION_A' ? market.optionA : market.optionB}!`,
        choice,
      });
    }

    return NextResponse.json({
      message: 'Action completed',
    });
  } catch (error) {
    console.error('Error handling frame post:', error);
    return NextResponse.json(
      { error: 'Failed to process frame action' },
      { status: 500 }
    );
  }
}
