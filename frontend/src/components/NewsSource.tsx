import React from 'react';
import { NewsSource as NewsSourceType } from '../services/api';
import HeadlineItem from './HeadlineItem';

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
        return 'bg-emerald-900 text-emerald-200 border-emerald-700';
      case 'error':
        return 'bg-rose-900 text-rose-200 border-rose-700';
      case 'disabled':
        return 'bg-slate-800 text-slate-200 border-slate-600';
      default:
        return 'bg-amber-900 text-amber-200 border-amber-700';
    }
  };

  const getSourceColor = (sourceName: string): string => {
    const colors = [
      'border-l-blue-400 bg-slate-800',
      'border-l-purple-400 bg-slate-800', 
      'border-l-emerald-400 bg-slate-800',
      'border-l-orange-400 bg-slate-800',
      'border-l-pink-400 bg-slate-800',
      'border-l-indigo-400 bg-slate-800',
      'border-l-cyan-400 bg-slate-800'
    ];
    const hash = sourceName.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const getSourceLogo = (sourceName: string): React.ReactNode => {
    const logoComponents: { [key: string]: React.ReactNode } = {
      'Wall Street Journal': (
        <div className="w-8 h-8 flex items-center justify-center bg-blue-600 rounded font-bold text-white text-sm">
          WSJ
        </div>
      ),
      'Bloomberg': (
        <div className="w-8 h-8 flex items-center justify-center bg-black rounded font-bold text-white text-xs">
          B
        </div>
      ),
      'CNBC': (
        <div className="w-8 h-8 flex items-center justify-center bg-red-600 rounded font-bold text-white text-xs">
          CNBC
        </div>
      ),
      'Financial Times': (
        <div className="w-8 h-8 flex items-center justify-center bg-pink-200 rounded font-bold text-pink-800 text-sm">
          FT
        </div>
      ),
      'The Business Times (Singapore)': (
        <div className="w-8 h-8 flex items-center justify-center bg-blue-800 rounded font-bold text-white text-xs">
          BT
        </div>
      ),
      'South China Morning Post': (
        <div className="w-8 h-8 flex items-center justify-center bg-blue-900 rounded font-bold text-white text-xs">
          SCMP
        </div>
      )
    };
    
    return logoComponents[sourceName] || (
      <div className="w-8 h-8 flex items-center justify-center bg-gray-600 rounded font-bold text-white text-xs">
        N
      </div>
    );
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
    <div className={`rounded-xl shadow-lg border-l-4 ${getSourceColor(source.name)} border-r border-t border-b border-slate-600 hover:shadow-xl transition-shadow duration-300 ${className}`}>
      <div className="px-4 py-3 border-b border-gray-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getSourceLogo(source.name)}
            <h2 className="text-lg font-bold text-gray-100 tracking-tight">
              {source.name}
            </h2>
          </div>
          <div className="flex items-center space-x-3">
            <span 
              className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(source.status)}`}
            >
              {source.status}
            </span>
          </div>
        </div>
        <div className="flex items-center mt-1">
          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-2 animate-pulse"></div>
          <p className="text-xs text-gray-300 font-medium">
            Last updated: {formatLastUpdated(source.last_updated)}
          </p>
        </div>
      </div>
      
      <div className="px-4 py-3">
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
          <div className="text-center py-6">
            <p className="text-gray-400 text-sm">
              No headlines available
            </p>
            {source.status === 'error' && (
              <p className="text-red-400 text-xs mt-1">
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