import React from 'react';
import { Terminal, Activity, Info, CheckCircle2, AlertCircle } from 'lucide-react';

export default function LiveEventLog({ eventLogs, currentExplanation, defenseActive }) {
  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-blue-600" />
          <h4 className="text-xs sm:text-sm font-bold text-slate-900 font-mono uppercase tracking-wide">
            Live Simulation Event Timeline
          </h4>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Real-time Event Streaming</span>
        </div>
      </div>

      {/* Active Event Explanation Card */}
      {currentExplanation && (
        <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/90 flex items-start gap-3">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono uppercase font-bold text-blue-800 tracking-wider block">
              What This Event Means (Beginner Explanation)
            </span>
            <p className="text-xs text-slate-800 leading-relaxed">
              {currentExplanation}
            </p>
          </div>
        </div>
      )}

      {/* Chronological Event Log Entries */}
      <div className="space-y-1.5 max-h-48 overflow-y-auto scrollbar-none font-mono text-xs">
        {eventLogs.length === 0 ? (
          <div className="py-6 text-center text-slate-400 text-xs font-mono">
            No events logged yet. Press <strong className="text-slate-700">Start Simulation</strong> or <strong className="text-slate-700">Step Forward</strong>.
          </div>
        ) : (
          eventLogs.slice().reverse().map((ev) => (
            <div
              key={ev.id}
              className={`p-2.5 rounded-xl border flex items-start gap-2.5 transition-all ${
                ev.active
                  ? 'bg-blue-50/80 border-blue-400 text-slate-900 font-semibold ring-1 ring-blue-300'
                  : 'bg-slate-50/60 border-slate-200/80 text-slate-600 opacity-80'
              }`}
            >
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                ev.active ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                {ev.time}
              </span>
              <span className="flex-1 leading-snug">
                {ev.text}
              </span>
              {ev.active && (
                <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1 animate-ping" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
