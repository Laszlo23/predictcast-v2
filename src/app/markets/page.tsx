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
    username?: string;
    displayName?: string;
  };
  voteSplit: {
    optionA: number;
    optionB: number;
    total: number;
  };
}

export default function MarketsPage() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('active');

  useEffect(() => {
    fetchMarkets();
  }, [status]);

  const fetchMarkets = async () => {
    try {
      const response = await fetch(`/api/markets?status=${status}&limit=20`);
      const data = await response.json();
      setMarkets(data.markets || []);
    } catch (error) {
      console.error('Error fetching markets:', error);
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
        <div className="text-white text-xl">Loading markets...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">Prediction Markets</h1>
          <Link
            href="/create"
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
          >
            Create Market
          </Link>
        </div>

        {/* Status Filter */}
        <div className="flex gap-4 mb-8">
          {['active', 'resolved', 'expired'].map((filterStatus) => (
            <button
              key={filterStatus}
              onClick={() => setStatus(filterStatus)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                status === filterStatus
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
            </button>
          ))}
        </div>

        {/* Markets Grid */}
        <div className="grid gap-6">
          {markets.length === 0 ? (
            <div className="text-center text-gray-300 py-12">
              <p className="text-xl mb-4">No {status} markets found</p>
              <p>Be the first to create a prediction market!</p>
            </div>
          ) : (
            markets.map((market) => (
              <div
                key={market.id}
                className="bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/20 transition-colors"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-white flex-1">
                    {market.question}
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(market)}`}
                  >
                    {getStatusText(market)}
                  </span>
                </div>

                {market.description && (
                  <p className="text-gray-300 mb-4">{market.description}</p>
                )}

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-blue-500/20 rounded-lg p-4">
                    <div className="text-blue-300 font-medium mb-1">
                      {market.optionA}
                    </div>
                    <div className="text-2xl font-bold text-blue-400">
                      {market.voteSplit.total > 0
                        ? Math.round((market.voteSplit.optionA / market.voteSplit.total) * 100)
                        : 0}%
                    </div>
                    <div className="text-sm text-gray-400">
                      {market.voteSplit.optionA} votes
                    </div>
                  </div>

                  <div className="bg-red-500/20 rounded-lg p-4">
                    <div className="text-red-300 font-medium mb-1">
                      {market.optionB}
                    </div>
                    <div className="text-2xl font-bold text-red-400">
                      {market.voteSplit.total > 0
                        ? Math.round((market.voteSplit.optionB / market.voteSplit.total) * 100)
                        : 0}%
                    </div>
                    <div className="text-sm text-gray-400">
                      {market.voteSplit.optionB} votes
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center text-sm text-gray-400">
                  <div>
                    Created by {market.creator.displayName || market.creator.username || 'Unknown'}
                  </div>
                  <div>
                    {getStatusText(market) === 'Active'
                      ? `Expires in ${getTimeLeft(market.expiresAt)}`
                      : `Expired ${new Date(market.expiresAt).toLocaleDateString()}`}
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Link
                    href={`/frames/${market.slug}`}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    View Frame
                  </Link>
                  <Link
                    href={`/markets/${market.slug}`}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
