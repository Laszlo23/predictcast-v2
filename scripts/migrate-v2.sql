-- Migration script for PredictCast v2.0
-- Run this on your Neon database to add new tables

-- Add new columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "isVerified" BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS reputation INTEGER DEFAULT 0;

-- Add new columns to markets table
ALTER TABLE markets ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE markets ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE markets ADD COLUMN IF NOT EXISTS "marketType" TEXT DEFAULT 'BINARY';
ALTER TABLE markets ADD COLUMN IF NOT EXISTS options JSONB;
ALTER TABLE markets ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true;
ALTER TABLE markets ADD COLUMN IF NOT EXISTS "isFeatured" BOOLEAN DEFAULT false;
ALTER TABLE markets ADD COLUMN IF NOT EXISTS "totalVolume" INTEGER DEFAULT 0;

-- Create new tables for v2.0
CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    content TEXT NOT NULL,
    "marketId" TEXT NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
    "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "parentId" TEXT REFERENCES comments(id),
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_follows (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "followerId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "followingId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    UNIQUE("followerId", "followingId")
);

CREATE TABLE IF NOT EXISTS market_follows (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "marketId" TEXT NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
    "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    UNIQUE("marketId", "userId")
);

CREATE TABLE IF NOT EXISTS user_badges (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "badgeType" TEXT NOT NULL,
    "earnedAt" TIMESTAMP DEFAULT NOW(),
    UNIQUE("userId", "badgeType")
);

CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    "isRead" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_comments_market_id ON comments("marketId");
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments("userId");
CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON user_follows("followerId");
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON user_follows("followingId");
CREATE INDEX IF NOT EXISTS idx_market_follows_market ON market_follows("marketId");
CREATE INDEX IF NOT EXISTS idx_market_follows_user ON market_follows("userId");
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications("userId");
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications("userId", "isRead");
