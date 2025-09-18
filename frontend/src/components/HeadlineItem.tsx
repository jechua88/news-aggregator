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

  const baseClasses = `block transition-colors duration-150 rounded-sm bg-[#161f29] hover:bg-[#1b2734] ${className}`.trim();

  return (
    <div>
      <a 
        href={headline.link}
        target="_blank"
        rel="noopener noreferrer"
        className={baseClasses}
      >
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[15px] font-semibold text-[#ecf1f8] leading-snug hover:text-[#ffb000] transition-colors duration-150">
            {headline.title}
          </h3>
          <time dateTime={headline.published_at} className={`text-xs font-semibold whitespace-nowrap pt-0.5 ${getTimeColor(headline.published_at)}`}>
            {formatDate(headline.published_at)}
          </time>
        </div>
        <div className="mt-2 flex items-center text-[12px] gap-2 text-[#a9b1b7]">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-[#1d2a35] border border-[#2f4050] text-[#c5ccd3]">
            {headline.source}
          </span>
        </div>
      </a>
    </div>
  );
};

export default HeadlineItem;
