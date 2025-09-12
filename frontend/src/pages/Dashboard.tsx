import React, { useState, useEffect } from 'react';
import NewsAPI, { NewsResponse } from '../services/api.ts';
import NewsSource from '../components/NewsSource.tsx';
import LoadingSpinner from '../components/LoadingSpinner.tsx';
import ErrorMessage from '../components/ErrorMessage.tsx';

const Dashboard: React.FC = () => {
  const [newsData, setNewsData] = useState<NewsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNews = async () => {
    try {
      setError(null);
      const data = await NewsAPI.getNews();
      setNewsData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch news');
      console.error('Failed to fetch news:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setError(null);
      await NewsAPI.refreshNews();
      await fetchNews();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh news');
      console.error('Failed to refresh news:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleRetry = () => {
    setLoading(true);
    fetchNews();
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const formatLastUpdated = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (error) {
      return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading financial news..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gradient-to-r from-blue-200 to-purple-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Financial News Aggregator
              </h1>
              <p className="text-sm text-gray-600 mt-1 font-medium">
                🚀 Real-time financial news from trusted sources
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-semibold rounded-xl shadow-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200"
            >
              {refreshing ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Refreshing...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <ErrorMessage 
            message={error} 
            onRetry={handleRetry}
            className="mb-6"
          />
        )}

        {newsData && (
          <div className="mb-6">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gradient-to-r from-blue-100 to-purple-100 px-8 py-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                    📊 News Summary
                  </h2>
                  <p className="text-sm text-gray-700 font-medium">
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mr-2">
                      {newsData.total_sources} sources
                    </span>
                    • Last updated: {formatLastUpdated(newsData.last_updated)}
                  </p>
                </div>
                <div className="mt-3 sm:mt-0">
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border border-emerald-200 shadow-sm">
                    ⚡ Cache: {newsData.cache_duration}s
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {newsData && newsData.sources.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {newsData.sources.map((source) => (
              <NewsSource 
                key={source.name} 
                source={source}
                className="h-fit"
              />
            ))}
          </div>
        ) : (
          !error && (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No news available</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try refreshing to fetch the latest headlines.
              </p>
            </div>
          )
        )}
      </main>
    </div>
  );
};

export default Dashboard;