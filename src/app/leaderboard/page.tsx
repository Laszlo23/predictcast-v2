'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface UserStats {
  id: string;
  userId: string;
  totalPredictions: number;
  correctPredictions: number;
  totalWagered: number;
  totalWon: number;
  winRate: number;
  rank?: number;
  lastUpdated: string;
  user: {
    fid: number;
    username?: string;
    displayName?: string;
    pfpUrl?: string;
  };
}

interface OverallStats {
  totalMarkets: number;
  activeMarkets: number;
  totalPredictions: number;
  totalUsers: number;
}

export default function LeaderboardPage() {
  const [stats, setStats] = useState<{
    leaderboard: UserStats[];
    overall: OverallStats;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('all');

  useEffect(() => {
    fetchStats();
  }, [period]);

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/stats?period=${period}&limit=50`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getWinRateColor = (winRate: number) => {
    if (winRate >= 80) return 'text-green-400';
    if (winRate >= 60) return 'text-yellow-400';
    if (winRate >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading leaderboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Leaderboard</h1>
          <p className="text-gray-300 mb-6">
            Top predictors based on accuracy and performance
          </p>

          {/* Period Filter */}
          <div className="flex justify-center gap-4 mb-8">
            {['all', 'week', 'month'].map((filterPeriod) => (
              <button
                key={filterPeriod}
                onClick={() => setPeriod(filterPeriod)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  period === filterPeriod
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {filterPeriod.charAt(0).toUpperCase() + filterPeriod.slice(1)}
              </button>
            ))}
          </div>

          {/* Overall Stats */}
          {stats?.overall && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold text-white">
                  {stats.overall.totalMarkets}
                </div>
                <div className="text-gray-300 text-sm">Total Markets</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold text-green-400">
                  {stats.overall.activeMarkets}
                </div>
                <div className="text-gray-300 text-sm">Active Markets</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-400">
                  {stats.overall.totalPredictions}
                </div>
                <div className="text-gray-300 text-sm">Total Predictions</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-400">
                  {stats.overall.totalUsers}
                </div>
                <div className="text-gray-300 text-sm">Total Users</div>
              </div>
            </div>
          )}
        </div>

        {/* Leaderboard */}
        <div className="max-w-4xl mx-auto">
          {stats?.leaderboard && stats.leaderboard.length > 0 ? (
            <div className="space-y-4">
              {stats.leaderboard.map((userStat, index) => (
                <div
                  key={userStat.id}
                  className={`bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/20 transition-colors ${
                    index < 3 ? 'ring-2 ring-yellow-400/50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl font-bold text-white">
                        {getRankIcon(userStat.rank || index + 1)}
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        {userStat.user.pfpUrl && (
                          <img
                            src={userStat.user.pfpUrl}
                            alt={userStat.user.displayName || userStat.user.username}
                            className="w-12 h-12 rounded-full"
                          />
                        )}
                        <div>
                          <div className="text-white font-semibold">
                            {userStat.user.displayName || userStat.user.username || `User ${userStat.user.fid}`}
                          </div>
                          <div className="text-gray-400 text-sm">
                            @{userStat.user.username || `user_${userStat.user.fid}`}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6 text-right">
                      <div>
                        <div className="text-white font-semibold">
                          {userStat.correctPredictions}/{userStat.totalPredictions}
                        </div>
                        <div className="text-gray-400 text-sm">Correct</div>
                      </div>
                      
                      <div>
                        <div className={`font-bold ${getWinRateColor(userStat.winRate)}`}>
                          {userStat.winRate.toFixed(1)}%
                        </div>
                        <div className="text-gray-400 text-sm">Win Rate</div>
                      </div>
                      
                      <div>
                        <div className="text-white font-semibold">
                          {userStat.totalWon.toLocaleString()}
                        </div>
                        <div className="text-gray-400 text-sm">Total Won</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-300 py-12">
              <p className="text-xl mb-4">No stats available</p>
              <p>Be the first to make a prediction!</p>
            </div>
          )}
        </div>

        <div className="text-center mt-8">
          <Link
            href="/markets"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Browse Markets
          </Link>
        </div>
      </div>
    </div>
  );
}
