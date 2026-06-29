import React, { useState } from 'react';
import axios from 'axios';

export default function TariffUpload() {
  // Get tomorrow's date string as default
  const getTomorrowStr = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const day = String(tomorrow.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [date, setDate] = useState(getTomorrowStr());
  const [tariffs, setTariffs] = useState(
    Array.from({ length: 24 }, (_, i) => ({ hour: i, price: '' }))
  );
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Pre-fill Template
  const loadTemplate = () => {
    // Standard double-peak price profile:
    // Cheap night hours (0-5) -> 1500-2000
    // Mid day (10-17) -> 3500-4500
    // Morning peak (6-9) -> 6000-7200
    // Evening peak (18-22) -> 7300-8500
    // Late night (23) -> 2200
    const templateTariffs = tariffs.map((t) => {
      let price = 4000; // default
      const h = t.hour;
      if (h >= 0 && h <= 5) {
        price = 1500 + h * 100; // 1500, 1600, 1700, 1800, 1900, 2000
      } else if (h === 23) {
        price = 2200;
      } else if (h >= 6 && h <= 9) {
        price = 6000 + (h - 6) * 400; // 6000, 6400, 6800, 7200
      } else if (h >= 18 && h <= 22) {
        price = 8500 - (h - 18) * 300; // 8500, 8200, 7900, 7600, 7300
      } else {
        price = 3500 + (h - 10) * 150; // mid day
      }
      return { hour: h, price: price.toString() };
    });
    setTariffs(templateTariffs);
    setMessage('Tariff template loaded. Review and click Upload.');
    setError(null);
  };

  const handlePriceChange = (hour, val) => {
    setTariffs(prev =>
      prev.map(t => (t.hour === hour ? { ...t, price: val } : t))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    // Validate inputs
    if (!date) {
      setError('Please select a date.');
      return;
    }

    const formattedTariffs = [];
    for (let i = 0; i < tariffs.length; i++) {
      const p = tariffs[i].price;
      if (p === '' || isNaN(p) || Number(p) < 0) {
        setError(`Please enter a valid non-negative price for Hour ${String(i).padStart(2, '0')}:00.`);
        return;
      }
      formattedTariffs.push({
        hour: tariffs[i].hour,
        price: Number(p)
      });
    }

    try {
      setLoading(true);
      const res = await axios.post('/api/v1/market/upload', {
        date,
        tariffs: formattedTariffs
      });
      setMessage(res.data.message || 'Tariffs uploaded successfully!');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to upload tariffs. Check server connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto space-y-8 bg-slate-900 text-slate-100 min-h-screen">
      <header className="flex justify-between items-center border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-100">Upload Market Tariffs</h2>
          <p className="text-sm text-slate-400 mt-1">Input day-ahead electricity prices for each 1-hour block</p>
        </div>
        <button
          type="button"
          onClick={loadTemplate}
          className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 px-4 py-2 rounded-lg text-xs font-semibold tracking-wider transition-colors cursor-pointer"
        >
          PRE-FILL TEMPLATE
        </button>
      </header>

      {message && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-sm">
          {message}
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-slate-950 border border-slate-800 p-6 rounded-xl max-w-sm">
          <label className="block text-sm font-semibold text-slate-400 mb-2">Tariff Target Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
            required
          />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md">
          <h3 className="text-sm font-bold text-slate-300 mb-6 border-b border-slate-800 pb-3">Hourly Price Input (INR per MWh)</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {tariffs.map((t) => (
              <div key={t.hour} className="bg-slate-950/40 p-3 rounded-lg border border-slate-800/60 flex items-center justify-between gap-3">
                <span className="text-xs font-semibold text-slate-400">
                  {String(t.hour).padStart(2, '0')}:00
                </span>
                <div className="relative flex-1 max-w-[120px]">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={t.price}
                    onChange={(e) => handlePriceChange(t.hour, e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 pl-6 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 font-mono text-right"
                    required
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 text-slate-950 font-bold px-8 py-3 rounded-xl shadow-md transition-colors cursor-pointer"
          >
            {loading ? 'Uploading...' : 'Upload Market Tariffs'}
          </button>
        </div>
      </form>
    </div>
  );
}
