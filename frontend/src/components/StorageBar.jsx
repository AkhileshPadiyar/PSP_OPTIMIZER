import React from 'react';

export default function StorageBar({ current, min, max }) {
  const currentVal = Number(current || 0);
  const minVal = Number(min || 0);
  const maxVal = Number(max || 100);

  // Calculate percentage of reservoir full capacity
  const percent = Math.min(Math.max((currentVal / maxVal) * 100, 0), 100);

  // Alert threshold: if storage drops within 150 MWh of the minimum operating limit
  const isNearMinimum = currentVal <= (minVal + 150);

  const barColorClass = isNearMinimum ? 'bg-red-500 shadow-red-500/30' : 'bg-blue-500 shadow-blue-500/30';
  const textColorClass = isNearMinimum ? 'text-red-400' : 'text-blue-400';

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-slate-400">Current Storage Level</span>
        <span className={`text-base font-bold ${textColorClass}`}>
          {currentVal.toFixed(1)} <span className="text-xs font-normal text-slate-400">MWh ({percent.toFixed(1)}%)</span>
        </span>
      </div>
      
      <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden p-0.5 border border-slate-700">
        <div 
          className={`h-full rounded-full transition-all duration-500 ease-out shadow-sm ${barColorClass}`}
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="flex justify-between items-center mt-2 text-xs text-slate-500">
        <span>Min Limit: {minVal.toFixed(0)} MWh</span>
        <span>Max Capacity: {maxVal.toFixed(0)} MWh</span>
      </div>
    </div>
  );
}
