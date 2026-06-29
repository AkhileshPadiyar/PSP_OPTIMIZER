import React from 'react';

export default function ScheduleTable({ schedule = [] }) {
  const formatPrice = (val) => `₹ ${Number(val || 0).toFixed(2)}`;
  
  const formatRevenue = (val) => {
    const num = Number(val || 0);
    if (num > 0) return `+₹ ${num.toLocaleString('en-IN')}`;
    if (num < 0) return `-₹ ${Math.abs(num).toLocaleString('en-IN')}`;
    return '₹ 0';
  };

  const getActionBadgeClass = (action) => {
    switch (action) {
      case 'PUMP':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'GENERATE':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      default:
        return 'bg-slate-800 text-slate-400 border border-slate-700/50';
    }
  };

  const getRowClass = (action) => {
    switch (action) {
      case 'PUMP':
        return 'bg-blue-950/10 border-l-2 border-l-blue-500';
      case 'GENERATE':
        return 'bg-emerald-950/10 border-l-2 border-l-emerald-500';
      default:
        return 'border-l-2 border-l-slate-700';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md">
      <div className="px-6 py-4 border-b border-slate-800">
        <h3 className="text-sm font-semibold text-slate-200">Hourly Operating Schedule</h3>
      </div>
      <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-950 text-slate-400 uppercase text-xs tracking-wider border-b border-slate-800">
              <th className="py-3 px-6">Hour Block</th>
              <th className="py-3 px-6">Market Price</th>
              <th className="py-3 px-6">Recommended Action</th>
              <th className="py-3 px-6">Resulting Storage</th>
              <th className="py-3 px-6 text-right">Calculated Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/55 text-sm text-slate-300">
            {schedule.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-8 text-slate-500">
                  No operational schedule data available.
                </td>
              </tr>
            ) : (
              schedule.map((row) => (
                <tr key={row.hour} className={`hover:bg-slate-800/40 transition-colors ${getRowClass(row.recommended_action)}`}>
                  <td className="py-3.5 px-6 font-semibold">
                    {String(row.hour).padStart(2, '0')}:00 - {String(row.hour + 1).padStart(2, '0')}:00
                  </td>
                  <td className="py-3.5 px-6 font-mono text-slate-400">
                    {formatPrice(row.price)}
                  </td>
                  <td className="py-3.5 px-6">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider ${getActionBadgeClass(row.recommended_action)}`}>
                      {row.recommended_action}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 font-semibold">
                    {row.resulting_storage.toFixed(1)} MWh
                  </td>
                  <td className={`py-3.5 px-6 text-right font-mono font-bold ${
                    row.calculated_revenue > 0 
                      ? 'text-emerald-400' 
                      : row.calculated_revenue < 0 
                        ? 'text-rose-400' 
                        : 'text-slate-400'
                  }`}>
                    {formatRevenue(row.calculated_revenue)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
