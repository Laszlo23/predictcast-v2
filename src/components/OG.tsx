import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';
import { OGImageData } from '@/types';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const question = searchParams.get('question') || 'Will this prediction come true?';
    const optionA = searchParams.get('optionA') || 'Yes';
    const optionB = searchParams.get('optionB') || 'No';
    const expiresAt = searchParams.get('expiresAt');
    const optionAVotes = parseInt(searchParams.get('optionAVotes') || '0');
    const optionBVotes = parseInt(searchParams.get('optionBVotes') || '0');

    const totalVotes = optionAVotes + optionBVotes;
    const optionAPercentage = totalVotes > 0 ? Math.round((optionAVotes / totalVotes) * 100) : 50;
    const optionBPercentage = totalVotes > 0 ? Math.round((optionBVotes / totalVotes) * 100) : 50;

    const timeLeft = expiresAt ? getTimeLeft(new Date(expiresAt)) : 'Expired';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0f0f23',
            backgroundImage: 'linear-gradient(45deg, #1a1a2e 0%, #16213e 100%)',
            fontFamily: 'system-ui, sans-serif',
            color: 'white',
            padding: '40px',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '30px',
            }}
          >
            <div
              style={{
                fontSize: '32px',
                fontWeight: 'bold',
                background: 'linear-gradient(45deg, #00d4ff, #0099cc)',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              PredictCast
            </div>
          </div>

          {/* Question */}
          <div
            style={{
              fontSize: '28px',
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: '40px',
              maxWidth: '800px',
              lineHeight: '1.2',
            }}
          >
            {question}
          </div>

          {/* Options */}
          <div
            style={{
              display: 'flex',
              gap: '40px',
              marginBottom: '30px',
            }}
          >
            {/* Option A */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '20px',
                backgroundColor: '#1a1a2e',
                borderRadius: '12px',
                border: '2px solid #00d4ff',
                minWidth: '200px',
              }}
            >
              <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>
                {optionA}
              </div>
              <div style={{ fontSize: '24px', color: '#00d4ff' }}>
                {optionAPercentage}%
              </div>
              <div style={{ fontSize: '14px', color: '#888' }}>
                {optionAVotes} votes
              </div>
            </div>

            {/* Option B */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '20px',
                backgroundColor: '#1a1a2e',
                borderRadius: '12px',
                border: '2px solid #ff6b6b',
                minWidth: '200px',
              }}
            >
              <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>
                {optionB}
              </div>
              <div style={{ fontSize: '24px', color: '#ff6b6b' }}>
                {optionBPercentage}%
              </div>
              <div style={{ fontSize: '14px', color: '#888' }}>
                {optionBVotes} votes
              </div>
            </div>
          </div>

          {/* Time Left */}
          <div
            style={{
              fontSize: '18px',
              color: timeLeft === 'Expired' ? '#ff6b6b' : '#00d4ff',
              fontWeight: 'bold',
            }}
          >
            {timeLeft === 'Expired' ? 'Market Closed' : `Time Left: ${timeLeft}`}
          </div>

          {/* Total Predictions */}
          <div
            style={{
              fontSize: '16px',
              color: '#888',
              marginTop: '10px',
            }}
          >
            {totalVotes} total predictions
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}

function getTimeLeft(expiresAt: Date): string {
  const now = new Date();
  const diff = expiresAt.getTime() - now.getTime();

  if (diff <= 0) return 'Expired';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}
