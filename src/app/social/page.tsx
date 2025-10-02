'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Activity {
  id: string;
  type: 'market_created' | 'prediction_made' | 'market_resolved' | 'comment_added';
  user: {
    fid: number;
    username?: string;
    displayName?: string;
    pfpUrl?: string;
  };
  market?: {
    id: string;
    slug: string;
    question: string;
  };
  content?: string;
  createdAt: string;
}

export default function SocialPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for now - in real app, fetch from API
    const mockActivities: Activity[] = [
      {
        id: '1',
        type: 'market_created',
        user: {
          fid: 1,
          username: 'alice',
          displayName: 'Alice Smith',
          pfpUrl: 'https://picsum.photos/200/200?random=1',
        },
        market: {
          id: '1',
          slug: 'bitcoin-price-2024',
          question: 'Will Bitcoin reach $100,000 by end of 2024?',
        },
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        type: 'prediction_made',
        user: {
          fid: 2,
          username: 'bob',
          displayName: 'Bob Johnson',
          pfpUrl: 'https://picsum.photos/200/200?random=2',
        },
        market: {
          id: '1',
          slug: 'bitcoin-price-2024',
          question: 'Will Bitcoin reach $100,000 by end of 2024?',
        },
        content: 'Predicted: Yes',
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      },
      {
        id: '3',
        type: 'comment_added',
        user: {
          fid: 3,
          username: 'charlie',
          displayName: 'Charlie Brown',
          pfpUrl: 'https://picsum.photos/200/200?random=3',
        },
        market: {
          id: '1',
          slug: 'bitcoin-price-2024',
          question: 'Will Bitcoin reach $100,000 by end of 2024?',
        },
        content: 'This is going to be interesting! I think the market is too volatile right now.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      },
    ];

    setTimeout(() => {
      setActivities(mockActivities);
      setLoading(false);
    }, 1000);
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'market_created':
        return '🎯';
      case 'prediction_made':
        return '🎲';
      case 'market_resolved':
        return '✅';
      case 'comment_added':
        return '💬';
      default:
        return '📝';
    }
  };

  const getActivityText = (activity: Activity) => {
    switch (activity.type) {
      case 'market_created':
        return `created a new market`;
      case 'prediction_made':
        return `made a prediction`;
      case 'market_resolved':
        return `resolved a market`;
      case 'comment_added':
        return `commented on`;
      default:
        return 'performed an action';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading social feed...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-white">Social Feed</h1>
            <Link
              href="/markets"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
            >
              Browse Markets
            </Link>
          </div>

          <div className="space-y-6">
            {activities.length === 0 ? (
              <div className="text-center text-gray-300 py-12">
                <p className="text-xl mb-4">No activity yet</p>
                <p>Follow users and participate in markets to see activity here!</p>
              </div>
            ) : (
              activities.map((activity) => (
                <div
                  key={activity.id}
                  className="bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/20 transition-colors"
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {activity.user.pfpUrl ? (
                        <img
                          src={activity.user.pfpUrl}
                          alt={activity.user.displayName || activity.user.username}
                          className="w-12 h-12 rounded-full"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold">
                            {activity.user.displayName?.charAt(0) || 'U'}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-2xl">{getActivityIcon(activity.type)}</span>
                        <span className="text-white font-semibold">
                          {activity.user.displayName || activity.user.username || `User ${activity.user.fid}`}
                        </span>
                        <span className="text-gray-400">
                          {getActivityText(activity)}
                        </span>
                        <span className="text-gray-500 text-sm">
                          {formatTimeAgo(activity.createdAt)}
                        </span>
                      </div>

                      {activity.market && (
                        <div className="bg-white/5 rounded-lg p-4 mb-3">
                          <h3 className="text-white font-medium mb-1">
                            {activity.market.question}
                          </h3>
                          <Link
                            href={`/markets/${activity.market.slug}`}
                            className="text-blue-400 hover:text-blue-300 text-sm"
                          >
                            View Market →
                          </Link>
                        </div>
                      )}

                      {activity.content && (
                        <div className="bg-white/5 rounded-lg p-4">
                          <p className="text-gray-300">{activity.content}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Follow Suggestions */}
          <div className="mt-12 bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Suggested Users to Follow</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { fid: 1, username: 'alice', displayName: 'Alice Smith', pfpUrl: 'https://picsum.photos/200/200?random=1' },
                { fid: 2, username: 'bob', displayName: 'Bob Johnson', pfpUrl: 'https://picsum.photos/200/200?random=2' },
                { fid: 3, username: 'charlie', displayName: 'Charlie Brown', pfpUrl: 'https://picsum.photos/200/200?random=3' },
              ].map((user) => (
                <div key={user.fid} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                  {user.pfpUrl ? (
                    <img
                      src={user.pfpUrl}
                      alt={user.displayName}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">{user.displayName.charAt(0)}</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="text-white font-medium">{user.displayName}</div>
                    <div className="text-gray-400 text-sm">@{user.username}</div>
                  </div>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors">
                    Follow
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
