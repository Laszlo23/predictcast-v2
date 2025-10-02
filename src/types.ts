export interface User {
  id: string;
  fid: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
  bio?: string;
  isVerified: boolean;
  reputation: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Market {
  id: string;
  slug: string;
  question: string;
  description?: string;
  category?: string;
  tags: string[];
  marketType: MarketType;
  options?: any; // For multi-outcome markets
  optionA: string;
  optionB: string;
  expiresAt: Date;
  resolvedAt?: Date;
  outcome?: MarketOutcome;
  isActive: boolean;
  isFeatured: boolean;
  totalVolume: number;
  createdAt: Date;
  updatedAt: Date;
  creatorId: string;
  creator?: User;
  predictions?: Prediction[];
  comments?: Comment[];
  followers?: MarketFollow[];
  _count?: {
    predictions: number;
    comments: number;
    followers: number;
  };
}

export interface Prediction {
  id: string;
  marketId: string;
  userId: string;
  choice: PredictionChoice;
  amount: number;
  createdAt: Date;
  market?: Market;
  user?: User;
}

export interface UserStats {
  id: string;
  userId: string;
  totalPredictions: number;
  correctPredictions: number;
  totalWagered: number;
  totalWon: number;
  winRate: number;
  rank?: number;
  lastUpdated: Date;
  user?: User;
}

export enum MarketOutcome {
  OPTION_A = 'OPTION_A',
  OPTION_B = 'OPTION_B',
  CANCELLED = 'CANCELLED'
}

export enum PredictionChoice {
  OPTION_A = 'OPTION_A',
  OPTION_B = 'OPTION_B',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE'
}

// New interfaces for v2
export interface Comment {
  id: string;
  content: string;
  marketId: string;
  userId: string;
  parentId?: string;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  market?: Market;
  parent?: Comment;
  replies?: Comment[];
}

export interface UserFollow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: Date;
  follower?: User;
  following?: User;
}

export interface MarketFollow {
  id: string;
  marketId: string;
  userId: string;
  createdAt: Date;
  market?: Market;
  user?: User;
}

export interface UserBadge {
  id: string;
  userId: string;
  badgeType: BadgeType;
  earnedAt: Date;
  user?: User;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: Date;
  user?: User;
}

// New enums for v2
export enum MarketType {
  BINARY = 'BINARY',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  NUMERIC = 'NUMERIC',
  TIME_BASED = 'TIME_BASED'
}

export enum BadgeType {
  FIRST_PREDICTION = 'FIRST_PREDICTION',
  PERFECT_WEEK = 'PERFECT_WEEK',
  MARKET_CREATOR = 'MARKET_CREATOR',
  TOP_PREDICTOR = 'TOP_PREDICTOR',
  SOCIAL_BUTTERFLY = 'SOCIAL_BUTTERFLY',
  EARLY_BIRD = 'EARLY_BIRD',
  RISK_TAKER = 'RISK_TAKER',
  CONSERVATIVE = 'CONSERVATIVE'
}

export enum NotificationType {
  MARKET_CREATED = 'MARKET_CREATED',
  MARKET_RESOLVED = 'MARKET_RESOLVED',
  PREDICTION_CORRECT = 'PREDICTION_CORRECT',
  NEW_FOLLOWER = 'NEW_FOLLOWER',
  MENTION = 'MENTION',
  MARKET_FOLLOWED = 'MARKET_FOLLOWED',
  BADGE_EARNED = 'BADGE_EARNED'
}

export interface CreateMarketRequest {
  question: string;
  description?: string;
  optionA: string;
  optionB: string;
  expiresAt: string; // ISO string
}

export interface JoinMarketRequest {
  marketId: string;
  choice: PredictionChoice;
  amount: number;
}

export interface FrameData {
  untrustedData: {
    fid: number;
    url: string;
    messageHash: string;
    timestamp: number;
    network: number;
    buttonIndex: number;
    castId: {
      fid: number;
      hash: string;
    };
  };
  trustedData: {
    messageBytes: string;
  };
}

export interface OGImageData {
  question: string;
  optionA: string;
  optionB: string;
  expiresAt: Date;
  voteSplit: {
    optionA: number;
    optionB: number;
  };
  totalPredictions: number;
}
