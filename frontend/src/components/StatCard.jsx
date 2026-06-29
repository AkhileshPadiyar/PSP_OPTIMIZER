import React from 'react';

export default function StatCard({ title, value, unit, description, icon }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
      <div className="flex justify-between items-start">
        <div>
          <span className="text-sm font-medium text-slate-400 block mb-1">{title}</span>
          <span className="text-2xl font-bold text-slate-100">
            {value}
            {unit && <span className="text-sm font-normal text-slate-400 ml-1">{unit}</span>}
          </span>
        </div>
        {icon && <div className="text-slate-400 bg-slate-800 p-2 rounded-lg">{icon}</div>}
      </div>
      {description && <p className="text-xs text-slate-400 mt-2">{description}</p>}
    </div>
  );
}
