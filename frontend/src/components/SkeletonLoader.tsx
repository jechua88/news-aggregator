import React from 'react';

interface SkeletonLoaderProps {
  className?: string;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ className = '' }) => {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="rounded-xl border-l-4 border-slate-400 bg-slate-800 border-r border-t border-b border-slate-600">
        <div className="px-4 py-3 border-b border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-slate-700 rounded"></div>
              <div className="h-5 bg-slate-700 rounded w-32"></div>
            </div>
            <div className="h-6 bg-slate-700 rounded w-16"></div>
          </div>
          <div className="flex items-center mt-1">
            <div className="w-1.5 h-1.5 bg-slate-700 rounded-full mr-2"></div>
            <div className="h-3 bg-slate-700 rounded w-28"></div>
          </div>
        </div>
        
        <div className="px-4 py-3 space-y-2">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="py-2">
              <div className="space-y-2">
                <div className="h-4 bg-slate-700 rounded w-full"></div>
                <div className="h-4 bg-slate-700 rounded w-4/5"></div>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="h-3 bg-slate-700 rounded w-16"></div>
                  <div className="h-3 bg-slate-700 rounded w-20"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SkeletonLoader;