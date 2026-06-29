import React from 'react';

export default function AdvisoryConsole({ logs = [] }) {
  return (
    <div className="bg-black border border-slate-800 rounded-xl p-6 shadow-md">
      <div className="flex justify-between items-center border-b border-slate-900 pb-3 mb-4">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Operational Advisory Console</span>
        <div className="flex space-x-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
        </div>
      </div>
      
      <div className="font-mono text-xs text-green-400 h-48 overflow-y-auto space-y-2 leading-relaxed scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        {logs.length === 0 ? (
          <div className="text-green-500/60 animate-pulse">[SYSTEM] Initializing console... No active advisory alerts. Ready.</div>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="flex gap-2">
              <span className="text-green-600 select-none">&gt;</span>
              <span className={log.startsWith('[WARNING]') ? 'text-yellow-400' : log.startsWith('[ERROR]') ? 'text-red-500' : 'text-green-400'}>
                {log}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
