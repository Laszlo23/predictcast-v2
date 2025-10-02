# PredictCast

A Farcaster MiniApp for creating and joining binary prediction markets via Frames.

## Features

- 🎯 **Binary Prediction Markets**: Create yes/no prediction markets on any topic
- 📱 **Farcaster Frames**: Interactive Frame endpoints for seamless user experience
- 🏆 **Leaderboards**: Track prediction accuracy and compete with other users
- 🎨 **Dynamic OG Images**: Auto-generated social media previews with real-time vote counts
- 🔐 **Signature Verification**: Secure Frame interactions using Neynar
- 📊 **Real-time Stats**: Live vote counts and market status updates

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, TailwindCSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Farcaster**: Neynar API for Frame verification
- **Images**: Vercel OG for dynamic image generation
- **Caching**: Redis (optional)

## Quick Start

### 1. Clone and Install

```bash
git clone <your-repo>
cd predictcast
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `NEYNAR_API_KEY`: Your Neynar API key
- `NEXT_PUBLIC_APP_URL`: Your app URL (e.g., http://localhost:3000)

### 3. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed with sample data
npm run db:seed
```

### 4. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the app!

## API Endpoints

### Markets
- `GET /api/markets` - List all markets (with pagination and filtering)
- `POST /api/markets` - Create a new market
- `GET /api/markets/[slug]` - Get market details
- `PATCH /api/markets/[slug]` - Resolve a market

### Predictions
- `GET /api/predictions` - List predictions (with filtering)
- `POST /api/predictions` - Create a new prediction

### Stats
- `GET /api/stats` - Get leaderboard and overall stats

### Frames
- `GET /frames/[slug]` - Frame endpoint for market interaction
- `POST /frames/[slug]` - Handle Frame button clicks

### OG Images
- `GET /api/og` - Generate dynamic OG images for social sharing

## Frame Integration

PredictCast uses Farcaster Frames to provide seamless user interactions:

1. **Create Market Frame**: Users can create markets through Frame interactions
2. **Join Market Frame**: One-click prediction joining with signature verification
3. **Resolution Frame**: Display results and next actions

### Frame URL Structure
```
/frames/[market-slug]?action=view
```

## Database Schema

### Core Tables
- `users`: Farcaster user profiles
- `markets`: Prediction market definitions
- `predictions`: User predictions on markets
- `user_stats`: Aggregated user performance data

### Key Relationships
- Users can create multiple markets
- Users can make one prediction per market
- Stats are automatically updated on prediction/resolution

## Background Jobs

The app includes cron jobs for:
- **Market Expiration**: Auto-expire markets past their deadline
- **Leaderboard Updates**: Recalculate user rankings
- **Data Cleanup**: Remove old resolved markets

Run manually:
```bash
npm run cron
```

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repo to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### Database
- Use a managed PostgreSQL service (Neon, Supabase, etc.)
- Set `DATABASE_URL` in your environment

### Redis (Optional)
- Use Upstash Redis for caching and rate limiting
- Set `REDIS_URL` in your environment

## Development

### Adding New Features
1. Update database schema in `prisma/schema.prisma`
2. Run `npm run db:push` to apply changes
3. Update TypeScript types in `src/types.ts`
4. Add API routes in `src/app/api/`
5. Create Frame endpoints in `src/app/frames/`

### Testing Frames
Use the Farcaster Frame Validator or test in Warpcast:
1. Deploy your app
2. Share a Frame URL in Warpcast
3. Test button interactions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
- Create an issue on GitHub
- Join our Discord community
- Follow us on Farcaster

---

Built with ❤️ for the Farcaster ecosystem