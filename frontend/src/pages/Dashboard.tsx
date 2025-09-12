import React, { useState, useEffect } from 'react';
import NewsAPI, { NewsResponse } from '../services/api.ts';
import NewsSource from '../components/NewsSource.tsx';
import LoadingSpinner from '../components/LoadingSpinner.tsx';
import ErrorMessage from '../components/ErrorMessage.tsx';
import SkeletonLoader from '../components/SkeletonLoader.tsx';
import { exportToJSON, exportToCSV } from '../utils/exportUtils.ts';

const Dashboard: React.FC = () => {
  const [newsData, setNewsData] = useState<NewsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSources, setSelectedSources] = useState<string[]>([]);

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

  // Initialize selected sources when news data loads
  useEffect(() => {
    if (newsData && selectedSources.length === 0) {
      setSelectedSources(newsData.sources.map(source => source.name));
    }
  }, [newsData]);

  useEffect(() => {
    fetchNews();
  }, []);

  // Filter data based on search term and selected sources
  const filteredData = React.useMemo(() => {
    if (!newsData) return null;

    const filtered = {
      ...newsData,
      sources: newsData.sources
        .filter(source => selectedSources.includes(source.name))
        .map(source => ({
          ...source,
          headlines: source.headlines.filter(headline =>
            headline.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            headline.source.toLowerCase().includes(searchTerm.toLowerCase())
          )
        }))
        .filter(source => source.headlines.length > 0 || searchTerm === '')
    };

    return filtered;
  }, [newsData, searchTerm, selectedSources]);

  const handleSourceToggle = (sourceName: string) => {
    setSelectedSources(prev => 
      prev.includes(sourceName)
        ? prev.filter(name => name !== sourceName)
        : [...prev, sourceName]
    );
  };

  const formatLastUpdated = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (error) {
      return 'Unknown';
    }
  };

  const handleExportJSON = () => {
    if (filteredData) {
      exportToJSON(filteredData, searchTerm);
    }
  };

  const handleExportCSV = () => {
    if (filteredData) {
      exportToCSV(filteredData, searchTerm);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <header className="bg-gray-800/90 backdrop-blur-md shadow-lg border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                  Financial News Aggregator
                </h1>
                <p className="text-sm text-gray-300 mt-1 font-medium">
                  🚀 Loading latest financial news...
                </p>
              </div>
              <LoadingSpinner size="sm" />
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...Array(6)].map((_, index) => (
              <SkeletonLoader key={index} className="h-fit" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <header className="bg-gray-800/90 backdrop-blur-md shadow-lg border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                Financial News Aggregator
              </h1>
              <p className="text-sm text-gray-300 mt-1 font-medium">
                🚀 Real-time financial news from trusted sources
              </p>
              <div className="flex items-center space-x-4 mt-2">
                <span className="text-xs text-gray-400">
                  📅 {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long',
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
                <span className="text-xs text-gray-400">
                  🕐 {new Date().toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {newsData && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleExportCSV}
                    className="inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-lg text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    </svg>
                    CSV
                  </button>
                  <button
                    onClick={handleExportJSON}
                    className="inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-lg text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    </svg>
                    JSON
                  </button>
                </div>
              )}
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
          <>
            <div className="mb-6">
              <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700 px-8 py-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                      📊 News Summary
                    </h2>
                    <p className="text-sm text-gray-200 font-medium">
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-emerald-900 text-emerald-200 text-xs font-semibold mr-2">
                        {newsData.total_sources} sources
                      </span>
                      • Last updated: {formatLastUpdated(newsData.last_updated)}
                    </p>
                  </div>
                  <div className="mt-3 sm:mt-0">
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-900 text-emerald-200 border border-emerald-700 shadow-sm">
                      ⚡ Cache: {newsData.cache_status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700 px-8 py-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                  <div className="flex-1 max-w-md">
                    <label htmlFor="search" className="sr-only">Search headlines</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <input
                        id="search"
                        type="text"
                        placeholder="Search headlines..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {newsData.sources.map((source) => (
                      <label key={source.name} className="inline-flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedSources.includes(source.name)}
                          onChange={() => handleSourceToggle(source.name)}
                          className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                        />
                        <span className="ml-2 text-sm text-gray-300 font-medium">
                          {source.name.split(' ').slice(0, 2).join(' ')}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {filteredData && filteredData.sources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredData.sources.map((source) => (
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
              <h3 className="mt-2 text-sm font-medium text-gray-100">No news available</h3>
              <p className="mt-1 text-sm text-gray-400">
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