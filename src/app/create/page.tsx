'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateMarketPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    question: '',
    description: '',
    optionA: 'Yes',
    optionB: 'No',
    expiresAt: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/markets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const market = await response.json();
        router.push(`/frames/${market.slug}`);
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creating market:', error);
      alert('Failed to create market');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8 text-center">
            Create Prediction Market
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="question" className="block text-white font-medium mb-2">
                Question *
              </label>
              <input
                type="text"
                id="question"
                name="question"
                value={formData.question}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Will Bitcoin reach $100,000 by end of 2024?"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-white font-medium mb-2">
                Description (Optional)
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Add more context about your prediction market..."
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="optionA" className="block text-white font-medium mb-2">
                  Option A *
                </label>
                <input
                  type="text"
                  id="optionA"
                  name="optionA"
                  value={formData.optionA}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Yes"
                />
              </div>

              <div>
                <label htmlFor="optionB" className="block text-white font-medium mb-2">
                  Option B *
                </label>
                <input
                  type="text"
                  id="optionB"
                  name="optionB"
                  value={formData.optionB}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="No"
                />
              </div>
            </div>

            <div>
              <label htmlFor="expiresAt" className="block text-white font-medium mb-2">
                Expiration Date *
              </label>
              <input
                type="datetime-local"
                id="expiresAt"
                name="expiresAt"
                value={formData.expiresAt}
                onChange={handleChange}
                required
                min={new Date().toISOString().slice(0, 16)}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                {loading ? 'Creating...' : 'Create Market'}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 text-white border border-white/20 rounded-lg hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>

          <div className="mt-8 p-4 bg-blue-500/20 rounded-lg">
            <h3 className="text-white font-semibold mb-2">💡 Tips for Great Markets</h3>
            <ul className="text-gray-300 text-sm space-y-1">
              <li>• Make questions clear and specific</li>
              <li>• Choose topics people care about</li>
              <li>• Set reasonable expiration times</li>
              <li>• Use binary options (Yes/No, A/B, etc.)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
