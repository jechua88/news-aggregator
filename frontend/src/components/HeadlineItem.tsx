import React from 'react';
import { NewsHeadline } from '../services/api.ts';

interface HeadlineItemProps {
  headline: NewsHeadline;
  className?: string;
}

const HeadlineItem: React.FC<HeadlineItemProps> = ({ 
  headline, 
  className = '' 
}) => {
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMins = Math.floor(diffMs / (1000 * 60));

      if (diffMins < 60) {
        return `${diffMins}m ago`;
      } else if (diffHours < 24) {
        return `${diffHours}h ago`;
      } else {
        return date.toLocaleDateString();
      }
    } catch (error) {
      return 'Unknown';
    }
  };

  const getTimeColor = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMins = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      
      if (diffMins < 30) return 'text-emerald-600';
      if (diffMins < 120) return 'text-blue-600';
      if (diffMins < 360) return 'text-purple-600';
      return 'text-gray-500';
    } catch {
      return 'text-gray-500';
    }
  };

  return (
    <div className={`border-b border-gradient-to-r from-gray-100 to-gray-200 last:border-b-0 py-4 ${className}`}>
      <a 
        href={headline.link}
        target="_blank"
        rel="noopener noreferrer"
        className="block hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 rounded-lg px-3 py-2 -mx-3 -my-2 transform hover:scale-[1.01] hover:shadow-md"
      >
        <h3 className="text-sm font-semibold text-gray-900 mb-2 leading-5 hover:text-blue-800 transition-colors duration-200">
          {headline.title}
        </h3>
        <div className="flex items-center text-xs space-x-3">
          <span className="inline-flex items-center px-2 py-1 rounded-full bg-indigo-100 text-indigo-800 font-medium">
            {headline.source}
          </span>
          <div className="flex items-center space-x-1">
            <div className="w-1.5 h-1.5 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-full animate-pulse"></div>
            <time dateTime={headline.published_at} className={`font-medium ${getTimeColor(headline.published_at)}`}>
              {formatDate(headline.published_at)}
            </time>
          </div>
        </div>
      </a>
    </div>
  );
};

export default HeadlineItem;