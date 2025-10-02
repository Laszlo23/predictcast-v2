'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Market {
  id: string;
  slug: string;
  question: string;
  description?: string;
  optionA: string;
  optionB: string;
  expiresAt: string;
  resolvedAt?: string;
  outcome?: string;
  createdAt: string;
  creator: {
    fid: number;
    username?: string;
    displayName?: string;
    pfpUrl?: string;
  };
  predictions: Array<{
    id: string;
    choice: string;
    amount: number;
    createdAt: string;
    user: {
      fid: number;
      username?: string;
      displayName?: string;
      pfpUrl?: string;
    };
  }>;
  voteSplit: {
    optionA: number;
    optionB: number;
    total: number;
  };
}

export default function MarketDetailPage({ params }: { params: { slug: string } }) {
  const [market, setMarket] = useState<Market | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMarket();
  }, [params.slug]);

  const fetchMarket = async () => {
    try {
      const response = await fetch(`/api/markets/${params.slug}`);
      if (response.ok) {
        const data = await response.json();
        setMarket(data);
      }
    } catch (error) {
      console.error('Error fetching market:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeLeft = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();

    if (diff <= 0) return 'Expired';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getStatusColor = (market: Market) => {
    if (market.resolvedAt) return 'bg-green-100 text-green-800';
    if (new Date(market.expiresAt) <= new Date()) return 'bg-red-100 text-red-800';
    return 'bg-blue-100 text-blue-800';
  };

  const getStatusText = (market: Market) => {
    if (market.resolvedAt) return 'Resolved';
    if (new Date(market.expiresAt) <= new Date()) return 'Expired';
    return 'Active';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading market...</div>
      </div>
    );
  }

  if (!market) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Market Not Found</h1>
          <Link
            href="/markets"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
          >
            Browse Markets
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-white mb-4">
                {market.question}
              </h1>
              {market.description && (
                <p className="text-gray-300 text-lg mb-4">
                  {market.description}
                </p>
              )}
            </div>
            <span
              className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(market)}`}
            >
              {getStatusText(market)}
            </span>
          </div>

          {/* Creator Info */}
          <div className="flex items-center space-x-3 mb-8">
            {market.creator.pfpUrl && (
              <img
                src={market.creator.pfpUrl}
                alt={market.creator.displayName || market.creator.username}
                className="w-10 h-10 rounded-full"
              />
            )}
            <div>
              <div className="text-white font-medium">
                Created by {market.creator.displayName || market.creator.username || `User ${market.creator.fid}`}
              </div>
              <div className="text-gray-400 text-sm">
                {new Date(market.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Vote Display */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-blue-500/20 rounded-lg p-6">
              <div className="text-blue-300 font-medium mb-2">
                {market.optionA}
              </div>
              <div className="text-4xl font-bold text-blue-400 mb-2">
                {market.voteSplit.total > 0
                  ? Math.round((market.voteSplit.optionA / market.voteSplit.total) * 100)
                  : 0}%
              </div>
              <div className="text-gray-400">
                {market.voteSplit.optionA} votes
              </div>
            </div>

            <div className="bg-red-500/20 rounded-lg p-6">
              <div className="text-red-300 font-medium mb-2">
                {market.optionB}
              </div>
              <div className="text-4xl font-bold text-red-400 mb-2">
                {market.voteSplit.total > 0
                  ? Math.round((market.voteSplit.optionB / market.voteSplit.total) * 100)
                  : 0}%
              </div>
              <div className="text-gray-400">
                {market.voteSplit.optionB} votes
              </div>
            </div>
          </div>

          {/* Time Info */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-8">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-white font-semibold mb-1">Expiration</div>
                <div className="text-gray-300">
                  {new Date(market.expiresAt).toLocaleString()}
                </div>
              </div>
              <div className="text-right">
                <div className="text-white font-semibold mb-1">Time Left</div>
                <div className={`font-bold ${
                  getTimeLeft(market.expiresAt) === 'Expired' 
                    ? 'text-red-400' 
                    : 'text-blue-400'
                }`}>
                  {getTimeLeft(market.expiresAt)}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 mb-8">
            <Link
              href={`/frames/${market.slug}`}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              View Frame
            </Link>
            <Link
              href="/markets"
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Back to Markets
            </Link>
          </div>

          {/* Recent Predictions */}
          {market.predictions.length > 0 && (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">
                Recent Predictions ({market.predictions.length})
              </h3>
              <div className="space-y-3">
                {market.predictions.slice(0, 10).map((prediction) => (
                  <div
                    key={prediction.id}
                    className="flex items-center justify-between py-2 border-b border-white/10 last:border-b-0"
                  >
                    <div className="flex items-center space-x-3">
                      {prediction.user.pfpUrl && (
                        <img
                          src={prediction.user.pfpUrl}
                          alt={prediction.user.displayName || prediction.user.username}
                          className="w-8 h-8 rounded-full"
                        />
                      )}
                      <div>
                        <div className="text-white font-medium">
                          {prediction.user.displayName || prediction.user.username || `User ${prediction.user.fid}`}
                        </div>
                        <div className="text-gray-400 text-sm">
                          {new Date(prediction.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-semibold ${
                        prediction.choice === 'OPTION_A' ? 'text-blue-400' : 'text-red-400'
                      }`}>
                        {prediction.choice === 'OPTION_A' ? market.optionA : market.optionB}
                      </div>
                      <div className="text-gray-400 text-sm">
                        {prediction.amount} points
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
