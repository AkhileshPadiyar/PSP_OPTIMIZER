import React, { useState } from 'react';
import axios from 'axios';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import ScheduleTable from '../components/ScheduleTable';
import RevenueCard from '../components/RevenueCard';

export default function OptimizationResults() {
  const getTomorrowStr = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const day = String(tomorrow.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [date, setDate] = useState(getTomorrowStr());
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runSimulation = async () => {
    if (!date) {
      setError('Please select a date first.');
      return;
    }
    
    setError(null);
    setLoading(true);
    setResults(null);

    try {
      const res = await axios.post('/api/v1/optimizer/run', { date });
      setResults(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to run optimization simulation. Ensure tariffs are uploaded.');
    } finally {
      setLoading(false);
    }
  };

  // Format data for Recharts (hours as readable time strings, prices as numbers)
  const chartData = results?.schedule.map(item => ({
    hourLabel: `${String(item.hour).padStart(2, '0')}:00`,
    price: Number(item.price),
    storage: Number(item.resulting_storage)
  })) || [];

  return (
    <div className="flex-1 p-8 overflow-y-auto space-y-8 bg-slate-900 text-slate-100 min-h-screen">
      <header className="flex justify-between items-center border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-100">Optimization Results</h2>
          <p className="text-sm text-slate-400 mt-1">Execute the PSP scheduling simulator and analyze power plant profiles</p>
        </div>
      </header>

      {/* Date selector and simulation runner */}
      <div className="bg-slate-950 border border-slate-800 p-6 rounded-xl flex flex-wrap items-end gap-6 max-w-2xl">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-semibold text-slate-400 mb-2">Select Simulation Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
        <button
          onClick={runSimulation}
          disabled={loading}
          className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 text-slate-950 font-bold px-8 py-3 rounded-xl shadow-md transition-colors cursor-pointer"
        >
          {loading ? 'Running Optimization...' : 'Run Simulation'}
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm max-w-2xl">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-center py-12 text-slate-400">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full mb-4"></div>
          <p className="font-semibold">Calculating schedule optimization...</p>
          <p className="text-xs text-slate-500 mt-1">Sorting tariffs, applying pump/generate constraints, and updating reservoir level</p>
        </div>
      )}

      {results && (
        <div className="space-y-8 animate-fadeIn">
          {/* Revenue Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <RevenueCard 
              title="Simulation Daily Revenue" 
              value={results.daily_revenue} 
              description={`Calculated total net profit for ${date}.`}
            />
            {/* Display final storage level */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md">
              <span className="text-sm font-medium text-slate-400 block mb-1">Ending Reservoir Storage</span>
              <span className="text-2xl font-bold text-blue-400">
                {results.schedule[23]?.resulting_storage.toFixed(1)} <span className="text-sm font-normal text-slate-400">MWh</span>
              </span>
              <p className="text-xs text-slate-400 mt-2">Storage level at hour block 23:00</p>
            </div>
            {/* Show pump/generation counts */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md">
              <span className="text-sm font-medium text-slate-400 block mb-1">Simulation Actions</span>
              <span className="text-2xl font-bold text-slate-100 flex items-center gap-3">
                <span className="text-blue-400">P:{results.schedule.filter(s => s.recommended_action === 'PUMP').length}</span>
                <span className="text-slate-500">|</span>
                <span className="text-emerald-400">G:{results.schedule.filter(s => s.recommended_action === 'GENERATE').length}</span>
                <span className="text-slate-500">|</span>
                <span className="text-slate-400">H:{results.schedule.filter(s => s.recommended_action === 'HOLD').length}</span>
              </span>
              <p className="text-xs text-slate-400 mt-2">Pumps (P), Generators (G), and Holds (H) scheduled</p>
            </div>
          </div>

          {/* Recharts Graphs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Price Profile Line Chart */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md">
              <h3 className="text-sm font-semibold text-slate-200 mb-4">Electricity Price Profile (INR/MWh)</h3>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="hourLabel" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `₹${val}`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', borderRadius: '8px' }}
                      labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
                      formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Price']}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Line type="monotone" dataKey="price" name="Market Tariff" stroke="#10b981" strokeWidth={2} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Storage Profile Area Chart */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md">
              <h3 className="text-sm font-semibold text-slate-200 mb-4">Reservoir Storage Profile (MWh)</h3>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                    <defs>
                      <linearGradient id="colorStorage" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="hourLabel" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 'dataMax + 100']} tickFormatter={(val) => `${val} MWh`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', borderRadius: '8px' }}
                      labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
                      formatter={(val) => [`${val} MWh`, 'Storage']}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Area type="monotone" dataKey="storage" name="Water Storage" stroke="#3b82f6" fillOpacity={1} fill="url(#colorStorage)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Schedule Table */}
          <ScheduleTable schedule={results.schedule} />
        </div>
      )}
    </div>
  );
}
