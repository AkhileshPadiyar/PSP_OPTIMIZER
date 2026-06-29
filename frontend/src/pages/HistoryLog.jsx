import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function HistoryLog() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/v1/optimizer/history');
        setHistory(res.data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch historical run logs.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const formatRevenue = (val) => {
    const num = Number(val || 0);
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(num);
  };

  if (loading) {
    return (
      <div className="flex-1 p-8 text-center text-slate-400 bg-slate-900 min-h-screen flex flex-col justify-center items-center">
        <div className="animate-spin inline-block w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full mb-4"></div>
        <p>Loading optimization logs...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 overflow-y-auto space-y-8 bg-slate-900 text-slate-100 min-h-screen">
      <header className="flex justify-between items-center border-b border-slate-800 pb-5 print:border-b-2 print:border-slate-800">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-100 print:text-slate-950">Optimization History Log</h2>
          <p className="text-sm text-slate-400 mt-1 print:text-slate-600">History of scheduling simulations executed on Tehri PSP Unit-1</p>
        </div>
        <button
          onClick={handlePrint}
          className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-6 py-2.5 rounded-xl font-bold transition-all shadow-sm flex items-center gap-2 print:hidden cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print Report
        </button>
      </header>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm max-w-lg">
          {error}
        </div>
      )}

      {/* History table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md print:bg-white print:border-none print:shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse print:text-slate-950">
            <thead>
              <tr className="bg-slate-950 text-slate-400 uppercase text-xs tracking-wider border-b border-slate-800 print:bg-slate-100 print:text-slate-700 print:border-b-2 print:border-slate-300">
                <th className="py-4 px-6">Simulation Date</th>
                <th className="py-4 px-6">Pumps Scheduled</th>
                <th className="py-4 px-6">Generations Scheduled</th>
                <th className="py-4 px-6">Holds Scheduled</th>
                <th className="py-4 px-6 text-right">Daily Estimated Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm text-slate-300 print:divide-slate-200">
              {history.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-slate-500 print:text-slate-400">
                    No historical simulation runs found in database.
                  </td>
                </tr>
              ) : (
                history.map((row) => (
                  <tr key={row.run_date} className="hover:bg-slate-800/40 print:hover:bg-transparent">
                    <td className="py-4 px-6 font-bold text-slate-200 print:text-slate-900">
                      {row.run_date}
                    </td>
                    <td className="py-4 px-6 font-semibold text-blue-400 print:text-blue-700">
                      {row.pump_count} hours
                    </td>
                    <td className="py-4 px-6 font-semibold text-emerald-400 print:text-emerald-700">
                      {row.generate_count} hours
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-400 print:text-slate-600">
                      {row.hold_count} hours
                    </td>
                    <td className={`py-4 px-6 text-right font-mono font-bold text-base ${
                      row.revenue > 0 
                        ? 'text-emerald-400 print:text-emerald-700' 
                        : row.revenue < 0 
                          ? 'text-rose-400 print:text-rose-700' 
                          : 'text-slate-400 print:text-slate-600'
                    }`}>
                      {formatRevenue(row.revenue)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
