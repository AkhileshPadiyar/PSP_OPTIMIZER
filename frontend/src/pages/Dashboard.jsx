import React, { useEffect, useState } from 'react';
import axios from 'axios';
import StatCard from '../components/StatCard';
import RevenueCard from '../components/RevenueCard';
import StorageBar from '../components/StorageBar';
import AdvisoryConsole from '../components/AdvisoryConsole';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/v1/dashboard');
        setData(res.data);
        setError(null);
        
        // Generate console logs based on loaded data
        const newLogs = [];
        newLogs.push(`[SYSTEM] Connected to Tehri PSP simulation engine.`);
        newLogs.push(`[SYSTEM] Plant configuration: ${res.data.plant.plant_name}`);
        
        const storage = res.data.plant.current_storage_mwh;
        const min = res.data.plant.min_storage_mwh;
        const max = res.data.plant.max_storage_mwh;
        const efficiency = res.data.plant.efficiency_rate * 100;
        
        newLogs.push(`[INFO] Current storage: ${storage} MWh. Efficiency rate: ${efficiency}%.`);
        
        if (storage <= (min + 150)) {
          newLogs.push(`[WARNING] Reservoir water level is low (${storage} MWh). Minimum operating limit is ${min} MWh.`);
          newLogs.push(`[ADVISORY] Priority PUMP action recommended during low-tariff hours.`);
        } else if (storage >= (max - 150)) {
          newLogs.push(`[WARNING] Reservoir water level is near max capacity (${storage}/${max} MWh).`);
          newLogs.push(`[ADVISORY] Priority GENERATE action recommended during peak tariff hours to prevent water spilling.`);
        } else {
          newLogs.push(`[INFO] Reservoir storage level is normal and within safe boundaries.`);
        }

        if (res.data.today_revenue !== 0 || res.data.pumped_energy > 0 || res.data.generated_energy > 0) {
          newLogs.push(`[INFO] Today's schedule run found. Pumped: ${res.data.pumped_energy} MWh, Generated: ${res.data.generated_energy} MWh.`);
          newLogs.push(`[INFO] Estimated Daily Revenue: ₹${res.data.today_revenue.toLocaleString('en-IN')}`);
        } else {
          newLogs.push(`[SYSTEM] No optimization schedule has been computed for today (${res.data.today_date}).`);
          newLogs.push(`[ADVISORY] Go to 'Tariff Upload' to upload prices and simulate scheduling.`);
        }

        setLogs(newLogs);
      } catch (err) {
        console.error('Error fetching dashboard:', err);
        setError('Failed to fetch dashboard data. Make sure backend is running.');
        setLogs([`[ERROR] Failed to connect to server: ${err.message}`]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 p-8 text-center text-slate-400 bg-slate-900 min-h-screen flex flex-col justify-center items-center">
        <div className="animate-spin inline-block w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full mb-4"></div>
        <p>Loading dashboard metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-8 text-center bg-slate-900 min-h-screen flex flex-col justify-center">
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl max-w-lg mx-auto">
          <h2 className="font-bold mb-2">Connection Error</h2>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const { plant, today_revenue, generated_energy, pumped_energy } = data;

  return (
    <div className="flex-1 p-8 overflow-y-auto space-y-8 bg-slate-900 text-slate-100 min-h-screen">
      <header className="flex justify-between items-center border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-100">Operational Dashboard</h2>
          <p className="text-sm text-slate-400 mt-1">Real-time status of {plant.plant_name}</p>
        </div>
        <div className="bg-slate-800 px-4 py-2 border border-slate-700 rounded-lg text-xs font-semibold text-slate-400">
          Status: <span className="text-emerald-400 font-bold ml-1">● ONLINE</span>
        </div>
      </header>

      {/* Grid of KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Storage Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md md:col-span-1 flex flex-col justify-between">
          <div>
            <span className="text-sm font-medium text-slate-400 block mb-3">Reservoir Storage</span>
            <StorageBar 
              current={plant.current_storage_mwh} 
              min={plant.min_storage_mwh} 
              max={plant.max_storage_mwh} 
            />
          </div>
        </div>

        {/* Revenue Card */}
        <RevenueCard 
          title="Today's Estimated Revenue" 
          value={today_revenue} 
          description={today_revenue !== 0 ? "Calculated from today's optimized schedule." : "No schedule executed for today yet."}
        />

        {/* Round-Trip Efficiency Card */}
        <StatCard 
          title="Round-Trip Efficiency"
          value={plant.efficiency_rate * 100}
          unit="%"
          description="Fixed hydraulic operating efficiency rate."
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
        />
      </div>

      {/* Energy stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard 
          title="Pumped Energy Today"
          value={pumped_energy}
          unit="MWh"
          description="Total energy consumed to pump water back up."
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          }
        />
        <StatCard 
          title="Generated Energy Today"
          value={generated_energy}
          unit="MWh"
          description="Total hydro power generated and fed to the grid."
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          }
        />
      </div>

      {/* Advisory Console */}
      <div className="w-full">
        <AdvisoryConsole logs={logs} />
      </div>
    </div>
  );
}
