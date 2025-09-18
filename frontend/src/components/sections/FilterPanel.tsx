import React from 'react';
import { NewsSource } from '../../services/api';

interface FilterPanelProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  sources: NewsSource[];
  selectedSources: string[];
  onToggleSource: (sourceName: string) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  searchTerm,
  onSearchChange,
  sources,
  selectedSources,
  onToggleSource,
}) => {
  return (
    <div className="bg-[#0b0f10] rounded-md border border-[#1f2a32] px-5 py-4">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="flex-1 max-w-xl">
          <label htmlFor="search" className="sr-only">
            Search headlines
          </label>
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
              onChange={(e) => onSearchChange(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-[#2b363f] rounded bg-[#0f1316] text-[#E6E6E6] placeholder-[#7a8288] focus:outline-none focus:ring-1 focus:ring-[#2b363f] text-[14px]"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {sources.map((source) => (
            <label key={source.name} className="inline-flex items-center">
              <input
                type="checkbox"
                checked={selectedSources.includes(source.name)}
                onChange={() => onToggleSource(source.name)}
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
  );
};

export default FilterPanel;
