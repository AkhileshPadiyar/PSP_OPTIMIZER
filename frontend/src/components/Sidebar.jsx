import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  const links = [
    { name: 'Dashboard', path: '/' },
    { name: 'Tariff Upload', path: '/upload' },
    { name: 'Optimization Results', path: '/results' },
    { name: 'History Log', path: '/history' }
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 text-slate-100 flex flex-col h-screen sticky top-0 print:hidden">
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-slate-900">
          T
        </div>
        <div>
          <h1 className="font-bold text-lg leading-none">THDCIL</h1>
          <span className="text-xs text-slate-400">PSP Simulator</span>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100'
              }`
            }
          >
            {link.name}
          </NavLink>
        ))}
      </nav>
      
      <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
        PSPOPTIMIZER_LITE v1.0.0
      </div>
    </aside>
  );
}
