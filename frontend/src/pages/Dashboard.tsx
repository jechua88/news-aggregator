import React, { useState, useEffect } from 'react';
import NewsAPI, { NewsResponse } from '../services/api';
import NewsSource from '../components/NewsSource';
import HeadlineItem from '../components/HeadlineItem';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import SkeletonLoader from '../components/SkeletonLoader';
import { exportToJSON, exportToCSV } from '../utils/exportUtils';

const DESIRED_ORDER = [
  'Bloomberg',
  'The Business Times (Singapore)',
  'CNBC',
  'Financial Times',
  'South China Morning Post',
  'Wall Street Journal'
];

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
      const ordered = DESIRED_ORDER.filter(name => newsData.sources.some(source => source.name === name));
      const additional = newsData.sources
        .map(source => source.name)
        .filter(name => !ordered.includes(name));
      setSelectedSources([...ordered, ...additional]);
    }
  }, [newsData]);

  useEffect(() => {
    fetchNews();
  }, []);

  // Filter data based on search term and selected sources
  const filteredData = React.useMemo(() => {
    if (!newsData) return null;

    const orderIndex = (name: string): number => {
      const idx = DESIRED_ORDER.indexOf(name);
      return idx === -1 ? Number.MAX_SAFE_INTEGER : idx;
    };

    const filteredSources = newsData.sources
      .filter(source => selectedSources.includes(source.name))
      .map(source => ({
        ...source,
        headlines: source.headlines.filter(headline =>
          headline.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          headline.source.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }))
      .filter(source => source.headlines.length > 0 || searchTerm === '')
      .sort((a, b) => orderIndex(a.name) - orderIndex(b.name));

    const filtered = {
      ...newsData,
      sources: filteredSources
    };

    return filtered;
  }, [newsData, searchTerm, selectedSources]);

  const recentHeadlines = React.useMemo(() => {
    if (!filteredData) return [];

    const cutoff = Date.now() - (2 * 60 * 60 * 1000);

    return filteredData.sources
      .flatMap(source =>
        source.headlines.map(headline => ({
          ...headline,
          source: source.name
        }))
      )
      .filter(headline => {
        const published = new Date(headline.published_at).getTime();
        return !Number.isNaN(published) && published >= cutoff;
      })
      .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
  }, [filteredData]);

  const handleSourceToggle = (sourceName: string) => {
    setSelectedSources(prev => {
      const toggled = prev.includes(sourceName)
        ? prev.filter(name => name !== sourceName)
        : [...prev, sourceName];
      const ordered = DESIRED_ORDER.filter(name => toggled.includes(name));
      const extras = toggled.filter(name => !ordered.includes(name));
      return [...ordered, ...extras];
    });
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
      <div className="min-h-screen bg-black text-[#E6E6E6] font-sans">
        <header className="bg-[#0b0f10] border-b border-[#1f2a32]">
          <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-6">
            <div className="flex justify-between items-center py-3">
              <div>
                <h1 className="text-xl font-bold tracking-tight">Financial News Aggregator</h1>
                <p className="text-[11px] text-[#a9b1b7] mt-1">Loading latest financial news...</p>
              </div>
              <LoadingSpinner size="sm" />
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[...Array(6)].map((_, index) => (
              <SkeletonLoader key={index} className="h-fit" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-[#E6E6E6] font-sans">
      <header className="bg-[#0b0f10] border-b border-[#1f2a32]">
        <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-6">
          <div className="flex justify-between items-center py-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Financial News Aggregator</h1>
              <p className="text-sm text-[#a9b1b7] mt-1">Real-time financial news from trusted sources</p>
              <div className="flex items-center space-x-4 mt-3">
                <span className="text-sm text-gray-400">
                  📅 {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long',
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
                <span className="text-sm text-gray-400">
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
                    className="inline-flex items-center px-3 py-2 border border-[#2b363f] text-[13px] font-medium rounded text-[#E6E6E6] bg-[#0f1316] hover:bg-[#12171b] focus:outline-none focus:ring-1 focus:ring-[#2b363f] transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    </svg>
                    CSV
                  </button>
                  <button
                    onClick={handleExportJSON}
                    className="inline-flex items-center px-3 py-2 border border-[#2b363f] text-[13px] font-medium rounded text-[#E6E6E6] bg-[#0f1316] hover:bg-[#12171b] focus:outline-none focus:ring-1 focus:ring-[#2b363f] transition-colors"
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
                className="inline-flex items-center px-5 py-2.5 border border-[#2b363f] text-[13px] font-semibold rounded text-black bg-[#00ff41] hover:bg-[#1aff5a] focus:outline-none focus:ring-1 focus:ring-[#2b363f] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <ErrorMessage 
            message={error} 
            onRetry={handleRetry}
            className="mb-6"
          />
        )}

        {newsData && (
          <>
            {recentHeadlines.length > 0 && (
              <div className="mb-6">
                <div className="bg-[#0b0f10] rounded-md border border-[#1f2a32] px-5 py-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
                    <h2 className="text-lg font-semibold text-[#f4f7fb]">Latest in the Past 2 Hours</h2>
                    <span className="mt-2 sm:mt-0 inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-[#152028] text-[#a9b1b7] border border-[#23303a]">
                      {recentHeadlines.length} headline{recentHeadlines.length === 1 ? '' : 's'}
                    </span>
                  </div>
                  <div>
                    {recentHeadlines.slice(0, 12).map((headline, index) => (
                      <HeadlineItem
                        key={`${headline.link}-${index}`}
                        headline={headline}
                        className="last:border-b-0"
                      />
                    ))}
                    {recentHeadlines.length > 12 && (
                      <p className="mt-2 text-xs text-[#7a8288]">
                        Showing the 12 most recent headlines.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="mb-4">
              <div className="bg-[#0b0f10] rounded-md border border-[#1f2a32] px-5 py-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-[#E6E6E6]">News Summary</h2>
                    <p className="text-sm text-[#a9b1b7] font-medium mt-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-[#152028] text-[#a9b1b7] text-[13px] font-semibold border border-[#23303a] mr-2">{newsData.total_sources} sources</span>
                      • Last updated: {formatLastUpdated(newsData.last_updated)}
                    </p>
                  </div>
                  <div className="mt-3 sm:mt-0">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[13px] font-bold bg-[#152028] text-[#a9b1b7] border border-[#23303a]">⚡ Cache: {newsData.cache_status}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <div className="bg-[#0b0f10] rounded-md border border-[#1f2a32] px-5 py-4">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                  <div className="flex-1 max-w-xl">
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
                        className="block w-full pl-10 pr-3 py-2 border border-[#2b363f] rounded bg-[#0f1316] text-[#E6E6E6] placeholder-[#7a8288] focus:outline-none focus:ring-1 focus:ring-[#2b363f] text-[14px]"
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {[...newsData.sources]
                      .sort((a, b) => {
                        const idxA = DESIRED_ORDER.indexOf(a.name);
                        const idxB = DESIRED_ORDER.indexOf(b.name);
                        return (idxA === -1 ? Number.MAX_SAFE_INTEGER : idxA) -
                          (idxB === -1 ? Number.MAX_SAFE_INTEGER : idxB);
                      })
                      .map((source) => (
                      <label key={source.name} className="inline-flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedSources.includes(source.name)}
                          onChange={() => handleSourceToggle(source.name)}
                          className="rounded border-[#2b363f] bg-[#0f1316] text-[#00ff41] focus:ring-[#2b363f] focus:ring-offset-0"
                        />
                        <span className="ml-2 text-[13px] text-[#E6E6E6] font-medium">
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredData.sources.map((source) => (
              <NewsSource 
                key={source.name} 
                source={source}
                className="h-full"
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
