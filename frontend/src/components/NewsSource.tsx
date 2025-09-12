import React from 'react';
import { NewsSource as NewsSourceType } from '../services/api.ts';
import HeadlineItem from './HeadlineItem.tsx';

interface NewsSourceProps {
  source: NewsSourceType;
  className?: string;
}

const NewsSource: React.FC<NewsSourceProps> = ({ 
  source, 
  className = '' 
}) => {
  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'error':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'disabled':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  const getSourceColor = (sourceName: string): string => {
    const colors = [
      'border-l-blue-500 bg-blue-50',
      'border-l-purple-500 bg-purple-50', 
      'border-l-emerald-500 bg-emerald-50',
      'border-l-orange-500 bg-orange-50',
      'border-l-pink-500 bg-pink-50',
      'border-l-indigo-500 bg-indigo-50',
      'border-l-cyan-500 bg-cyan-50'
    ];
    const hash = sourceName.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const formatLastUpdated = (dateString?: string): string => {
    if (!dateString) return 'Never updated';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      
      if (diffMins < 5) {
        return 'Just now';
      } else if (diffMins < 60) {
        return `${diffMins}m ago`;
      } else {
        const diffHours = Math.floor(diffMins / 60);
        return `${diffHours}h ago`;
      }
    } catch (error) {
      return 'Unknown';
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg border-l-4 ${getSourceColor(source.name)} border-r border-t border-b border-gray-100 hover:shadow-xl transition-shadow duration-300 ${className}`}>
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">
            {source.name}
          </h2>
          <div className="flex items-center space-x-3">
            <span 
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusColor(source.status)}`}
            >
              {source.status}
            </span>
          </div>
        </div>
        <div className="flex items-center mt-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></div>
          <p className="text-sm text-gray-600 font-medium">
            Last updated: {formatLastUpdated(source.last_updated)}
          </p>
        </div>
      </div>
      
      <div className="px-6 py-4">
        {source.headlines.length > 0 ? (
          <div className="space-y-0">
            {source.headlines.map((headline, index) => (
              <HeadlineItem 
                key={`${headline.link}-${index}`} 
                headline={headline} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">
              No headlines available
            </p>
            {source.status === 'error' && (
              <p className="text-red-500 text-xs mt-1">
                Source experiencing issues
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsSource;