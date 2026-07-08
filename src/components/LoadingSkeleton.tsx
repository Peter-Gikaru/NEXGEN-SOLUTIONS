import React from 'react';
export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div 
          key={i} 
          className="bg-white border border-light-gray rounded p-3 flex flex-col gap-3 h-full animate-pulse text-left min-h-[295px]"
        >
          {}
          <div className="w-full aspect-square bg-gray-200 rounded"></div>
          {}
          <div className="flex-grow flex flex-col gap-2">
            {}
            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            {}
            <div className="h-3 bg-gray-200 rounded w-full mt-1"></div>
            <div className="h-3 bg-gray-200 rounded w-4/5"></div>
            {}
            <div className="h-3.5 bg-gray-200 rounded w-1/2 mt-1"></div>
            {}
            <div className="h-5 bg-gray-200 rounded w-2/5 mt-2"></div>
            {}
            <div className="h-3.5 bg-gray-200 rounded w-1/4 mt-auto"></div>
          </div>
        </div>
      ))}
    </div>
  );
};
