import React from 'react';
import { NewsHeadline } from '../services/api';

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
      
      if (diffMins < 30) return 'text-emerald-400';
      if (diffMins < 120) return 'text-blue-400';
      if (diffMins < 360) return 'text-purple-400';
      return 'text-gray-400';
    } catch {
      return 'text-gray-400';
    }
  };

  return (
    <div className={`border-b border-gray-700 last:border-b-0 py-2 ${className}`}>
      <a 
        href={headline.link}
        target="_blank"
        rel="noopener noreferrer"
        className="block hover:bg-gray-800 transition-all duration-200 rounded px-2 py-1 -mx-2 -my-1"
      >
        <h3 className="text-sm font-medium text-gray-100 mb-1 leading-snug hover:text-blue-300 transition-colors duration-200">
          {headline.title}
        </h3>
        <div className="flex items-center text-xs space-x-2">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-indigo-900 text-indigo-200 font-medium">
            {headline.source}
          </span>
          <time dateTime={headline.published_at} className={`font-medium ${getTimeColor(headline.published_at)}`}>
            {formatDate(headline.published_at)}
          </time>
        </div>
      </a>
    </div>
  );
};

export default HeadlineItem;