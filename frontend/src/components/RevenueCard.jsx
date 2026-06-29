import React from 'react';

export default function RevenueCard({ title, value, description }) {
  // Format revenue as Indian Rupees currency format
  const formattedValue = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
      <div className="flex justify-between items-start">
        <div>
          <span className="text-sm font-medium text-slate-400 block mb-1">{title || 'Daily Revenue'}</span>
          <span className="text-3xl font-bold text-emerald-400">
            {formattedValue}
          </span>
        </div>
        <div className="text-emerald-500 bg-emerald-500/10 p-2 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
      {description && <p className="text-xs text-slate-400 mt-2">{description}</p>}
    </div>
  );
}
