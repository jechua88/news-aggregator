import { ReactNode } from 'react';
import { NewsResponse } from '../../services/api';

interface DashboardHeaderProps {
  newsSummary: NewsResponse | null;
  actions: ReactNode;
  subtitle?: string;
}

const DashboardHeader = ({ newsSummary, actions, subtitle }: DashboardHeaderProps) => {
  return (
    <div className="flex justify-between items-center py-3">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Financial News Aggregator</h1>
        <p className="text-sm text-[#a9b1b7] mt-1">{subtitle ?? 'Real-time financial news from trusted sources'}</p>
        <div className="flex items-center space-x-4 mt-3 text-sm text-gray-400">
          <span>
            📅 {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
          <span>
            🕐 {new Date().toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          {newsSummary && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-[#152028] text-[#a9b1b7] border border-[#23303a]">
              {newsSummary.total_sources} sources
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-3">
        {actions}
      </div>
    </div>
  );
};

export default DashboardHeader;
