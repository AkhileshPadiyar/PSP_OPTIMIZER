import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import TariffUpload from './pages/TariffUpload';
import OptimizationResults from './pages/OptimizationResults';
import HistoryLog from './pages/HistoryLog';

export default function App() {
  return (
    <Router>
      <div className="flex bg-slate-955 text-slate-100 min-h-screen">
        <Sidebar />
        <main className="flex-1 min-h-screen flex flex-col bg-slate-900 overflow-hidden">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/upload" element={<TariffUpload />} />
            <Route path="/results" element={<OptimizationResults />} />
            <Route path="/history" element={<HistoryLog />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
