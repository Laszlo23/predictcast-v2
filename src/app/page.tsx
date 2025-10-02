import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <h1 className="text-6xl font-bold text-white">
              PredictCast
            </h1>
            <span className="ml-3 px-3 py-1 bg-green-500 text-white text-sm font-bold rounded-full">
              v2.0
            </span>
          </div>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            The ultimate prediction market platform with social features, 
            multi-outcome markets, and advanced analytics. Built for Farcaster.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/markets"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors"
            >
              Browse Markets
            </Link>
            <Link
              href="/create"
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors"
            >
              Create Market
            </Link>
            <Link
              href="/leaderboard"
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors"
            >
              Leaderboard
            </Link>
            <Link
              href="/social"
              className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors"
            >
              Social Feed
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-3">🎯 Multi-Outcome Markets</h3>
              <p className="text-gray-300">
                Create binary, multiple choice, numeric, and time-based prediction markets.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-3">👥 Social Features</h3>
              <p className="text-gray-300">
                Follow users, comment on markets, and build your prediction community.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-3">🏆 Badge System</h3>
              <p className="text-gray-300">
                Earn badges for achievements and showcase your prediction skills.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-3">📊 Advanced Analytics</h3>
              <p className="text-gray-300">
                Detailed insights, performance tracking, and market analytics.
              </p>
            </div>
          </div>

          {/* New Features Section */}
          <div className="mt-16 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl p-8 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">What's New in v2.0</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <span className="text-green-400 text-xl">✓</span>
                  <div>
                    <h4 className="text-white font-semibold">Multi-Outcome Predictions</h4>
                    <p className="text-gray-300 text-sm">Support for complex prediction scenarios</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-green-400 text-xl">✓</span>
                  <div>
                    <h4 className="text-white font-semibold">Social Feed</h4>
                    <p className="text-gray-300 text-sm">Follow users and see their activity</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-green-400 text-xl">✓</span>
                  <div>
                    <h4 className="text-white font-semibold">Real-time Notifications</h4>
                    <p className="text-gray-300 text-sm">Stay updated on market changes</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <span className="text-green-400 text-xl">✓</span>
                  <div>
                    <h4 className="text-white font-semibold">Market Categories</h4>
                    <p className="text-gray-300 text-sm">Organize markets by topic and tags</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-green-400 text-xl">✓</span>
                  <div>
                    <h4 className="text-white font-semibold">Enhanced UI/UX</h4>
                    <p className="text-gray-300 text-sm">Better mobile experience and design</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-green-400 text-xl">✓</span>
                  <div>
                    <h4 className="text-white font-semibold">Badge System</h4>
                    <p className="text-gray-300 text-sm">Achievement system for engagement</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}