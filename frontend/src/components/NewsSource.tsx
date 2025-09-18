import React from 'react';
import { NewsSource as NewsSourceType } from '../services/api';
import HeadlineItem from './HeadlineItem';
import SourceLogo from './SourceLogo';

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

  const getSourceAccent = (sourceName: string): string => {
    const accents = [
      { border: 'border-l-[#00ff41]', ring: 'ring-[#22303b]' },
      { border: 'border-l-[#ffb000]', ring: 'ring-[#2a3543]' },
      { border: 'border-l-[#00bcd4]', ring: 'ring-[#1f3441]' },
      { border: 'border-l-[#ff3d71]', ring: 'ring-[#2d2f45]' },
      { border: 'border-l-[#8bc34a]', ring: 'ring-[#223a3c]' },
      { border: 'border-l-[#ff9800]', ring: 'ring-[#2f3940]' },
      { border: 'border-l-[#7c4dff]', ring: 'ring-[#322f47]' }
    ];
    const hash = sourceName.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const accent = accents[hash % accents.length];
    return `${accent.border} ring-1 ${accent.ring}`;
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
    <div className={`rounded-lg border-l-4 ${getSourceAccent(source.name)} border border-[#273746] bg-[#141d26] shadow-lg ${className}`}>
      <div className="px-4 py-3 border-b border-[#273746] bg-[#18232f]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <SourceLogo name={source.name} className="h-6" />
            <h2 className="text-lg font-semibold text-[#f4f7fb] tracking-tight">
              {source.name}
            </h2>
          </div>
          <div className="flex items-center space-x-3">
            <span 
              className={`px-2 py-0.5 rounded text-xs font-semibold border ${getStatusColor(source.status)} uppercase tracking-wide`}
            >
              {source.status}
            </span>
          </div>
        </div>
        <div className="flex items-center mt-2">
          <div className="w-1.5 h-1.5 bg-[#00ff41] rounded-full mr-2"></div>
          <p className="text-sm text-[#c5ccd3]">
            Last updated: {formatLastUpdated(source.last_updated)}
          </p>
        </div>
      </div>
      
      <div className="px-4 py-3">
        {source.headlines.length > 0 ? (
          <div className="overflow-hidden rounded-md border border-[#273746] divide-y divide-[#2f4050] bg-[#161f29]">
            {source.headlines.map((headline, index) => (
              <HeadlineItem 
                key={`${headline.link}-${index}`} 
                headline={headline}
                className="px-3 py-2"
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-[#7a8288] text-sm">
              No headlines available
            </p>
            {source.status === 'error' && (
              <p className="text-red-400 text-sm mt-1">
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
