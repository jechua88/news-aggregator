import React, { useEffect, useMemo, useState } from 'react';
import PageShell from '../components/layout/PageShell';
import DashboardHeader from '../components/sections/DashboardHeader';
import FilterPanel from '../components/sections/FilterPanel';
import LatestNewsSection from '../components/sections/LatestNewsSection';
import NewsSource from '../components/NewsSource';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import SkeletonLoader from '../components/SkeletonLoader';
import { exportToCSV, exportToJSON } from '../utils/exportUtils';
import { useNewsData } from '../hooks/useNewsData';
import { NewsResponse } from '../services/api';

const DESIRED_ORDER = [
  'Bloomberg',
  'The Business Times (Singapore)',
  'CNBC',
  'Financial Times',
  'South China Morning Post',
  'Wall Street Journal',
];

const Dashboard: React.FC = () => {
  const { data, isLoading, isFetching, error, refresh } = useNewsData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSources, setSelectedSources] = useState<string[]>([]);

  // Initialize selected sources when data loads
  useEffect(() => {
    if (data && selectedSources.length === 0) {
      const ordered = DESIRED_ORDER.filter((name) => data.sources.some((source) => source.name === name));
      const extras = data.sources
        .map((source) => source.name)
        .filter((name) => !ordered.includes(name));
      setSelectedSources([...ordered, ...extras]);
    }
  }, [data, selectedSources.length]);

  const orderIndex = (name: string): number => {
    const idx = DESIRED_ORDER.indexOf(name);
    return idx === -1 ? Number.MAX_SAFE_INTEGER : idx;
  };

  const filteredData = useMemo<NewsResponse | null>(() => {
    if (!data) return null;

    const filteredSources = data.sources
      .filter((source) => selectedSources.includes(source.name))
      .map((source) => ({
        ...source,
        headlines: source.headlines.filter((headline) =>
          headline.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          headline.source.toLowerCase().includes(searchTerm.toLowerCase()),
        ),
      }))
      .filter((source) => source.headlines.length > 0 || searchTerm === '')
      .sort((a, b) => orderIndex(a.name) - orderIndex(b.name));

    return {
      ...data,
      sources: filteredSources,
    };
  }, [data, searchTerm, selectedSources]);

  const recentHeadlines = useMemo(() => {
    if (!filteredData) return [];

    const cutoff = Date.now() - 2 * 60 * 60 * 1000;

    return filteredData.sources
      .flatMap((source) =>
        source.headlines.map((headline) => ({
          ...headline,
          source: source.name,
        })),
      )
      .filter((headline) => {
        const published = new Date(headline.published_at).getTime();
        return !Number.isNaN(published) && published >= cutoff;
      })
      .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
  }, [filteredData]);

  const handleSourceToggle = (sourceName: string) => {
    setSelectedSources((prev) => {
      const toggled = prev.includes(sourceName)
        ? prev.filter((name) => name !== sourceName)
        : [...prev, sourceName];
      const ordered = DESIRED_ORDER.filter((name) => toggled.includes(name));
      const extras = toggled.filter((name) => !ordered.includes(name));
      return [...ordered, ...extras];
    });
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

  const headerActions = (
    <>
      {filteredData && (
        <>
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
        </>
      )}
      <button
        onClick={refresh}
        disabled={isFetching}
        className="inline-flex items-center px-5 py-2.5 border border-[#2b363f] text-[13px] font-semibold rounded text-black bg-[#00ff41] hover:bg-[#1aff5a] focus:outline-none focus:ring-1 focus:ring-[#2b363f] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isFetching ? (
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
    </>
  );

  if (isLoading) {
    return (
      <PageShell header={<DashboardHeader newsSummary={null} actions={<LoadingSpinner size="sm" />} />}>
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonLoader key={index} className="h-fit" />
            ))}
          </div>
        </main>
      </PageShell>
    );
  }

  const summaryError = error instanceof Error ? error.message : error;

  return (
    <PageShell
      header={<DashboardHeader newsSummary={filteredData} actions={headerActions} />}
    >
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {summaryError && (
          <ErrorMessage message={summaryError} onRetry={() => refresh()} className="mb-6" />
        )}

        {filteredData && (
          <>
            <div className="mb-4">
              <div className="bg-[#0b0f10] rounded-md border border-[#1f2a32] px-5 py-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-[#E6E6E6]">News Summary</h2>
                    <p className="text-sm text-[#a9b1b7] font-medium mt-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-[#152028] text-[#a9b1b7] text-[13px] font-semibold border border-[#23303a] mr-2">
                        {filteredData.total_sources} sources
                      </span>
                      • Last updated: {new Date(filteredData.last_updated).toLocaleString()}
                    </p>
                  </div>
                  <div className="mt-3 sm:mt-0">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[13px] font-bold bg-[#152028] text-[#a9b1b7] border border-[#23303a]">
                      ⚡ Cache: {filteredData.cache_status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <FilterPanel
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              sources={[...data!.sources].sort((a, b) => orderIndex(a.name) - orderIndex(b.name))}
              selectedSources={selectedSources}
              onToggleSource={handleSourceToggle}
            />
          </>
        )}

        <LatestNewsSection headlines={recentHeadlines} />

        {filteredData && filteredData.sources.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredData.sources.map((source) => (
              <NewsSource key={source.name} source={source} className="h-full" />
            ))}
          </div>
        ) : (
          !summaryError && (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <h3 className="mt-2 text-base font-medium text-gray-100">No news available</h3>
              <p className="mt-1 text-sm text-gray-400">Try refreshing to fetch the latest headlines.</p>
            </div>
          )
        )}
      </main>
    </PageShell>
  );
};

export default Dashboard;

