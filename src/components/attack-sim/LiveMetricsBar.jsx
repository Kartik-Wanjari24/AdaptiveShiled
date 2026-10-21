import React from 'react';
import {
  Activity,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  Server,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Flame,
  Cpu
} from 'lucide-react';

export default function LiveMetricsBar({ metrics, defenseActive }) {
  const { generated, inspected, blocked, delivered, targetHealth, attackStatus } = metrics;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {/* 1. Packets Generated */}
      <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between space-y-1">
        <div className="flex items-center justify-between text-slate-500">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Generated</span>
          <Activity className="w-3.5 h-3.5 text-blue-600" />
        </div>
        <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900">
          {generated.toLocaleString()}
        </div>
        <div className="text-[9px] text-slate-400 font-mono">Simulated ingress</div>
      </div>

      {/* 2. Packets Inspected */}
      <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between space-y-1">
        <div className="flex items-center justify-between text-slate-500">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Inspected</span>
          <Shield className="w-3.5 h-3.5 text-indigo-600" />
        </div>
        <div className="text-xl sm:text-2xl font-bold font-mono text-indigo-700">
          {inspected.toLocaleString()}
        </div>
        <div className="text-[9px] text-slate-400 font-mono">DPI &amp; Policy Checks</div>
      </div>

      {/* 3. Packets Blocked */}
      <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between space-y-1">
        <div className="flex items-center justify-between text-slate-500">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Blocked</span>
          <XCircle className="w-3.5 h-3.5 text-rose-600" />
        </div>
        <div className="text-xl sm:text-2xl font-bold font-mono text-rose-600">
          {blocked.toLocaleString()}
        </div>
        <div className="text-[9px] text-slate-400 font-mono">Interception rules</div>
      </div>

      {/* 4. Legitimate Delivered */}
      <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between space-y-1">
        <div className="flex items-center justify-between text-slate-500">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Delivered</span>
          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
        </div>
        <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-600">
          {delivered.toLocaleString()}
        </div>
        <div className="text-[9px] text-slate-400 font-mono">Clean customer traffic</div>
      </div>

      {/* 5. Target Health */}
      <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between space-y-1">
        <div className="flex items-center justify-between text-slate-500">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Target Health</span>
          <Server className={`w-3.5 h-3.5 ${targetHealth < 50 ? 'text-rose-600 animate-pulse' : 'text-emerald-600'}`} />
        </div>
        <div className="flex items-center gap-2">
          <div className={`text-xl sm:text-2xl font-bold font-mono ${targetHealth < 50 ? 'text-rose-600' : 'text-emerald-700'}`}>
            {Math.round(targetHealth)}%
          </div>
        </div>
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              targetHealth < 40 ? 'bg-rose-500' : targetHealth < 75 ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${targetHealth}%` }}
          />
        </div>
      </div>

      {/* 6. Attack Status Badge */}
      <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between space-y-1">
        <div className="flex items-center justify-between text-slate-500">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Attack Status</span>
          <span className={`w-2 h-2 rounded-full ${defenseActive ? 'bg-blue-600 animate-ping' : 'bg-rose-600 animate-ping'}`} />
        </div>
        <div className={`text-[11px] font-mono font-bold truncate leading-snug ${
          defenseActive ? 'text-blue-700' : 'text-rose-700'
        }`}>
          {attackStatus}
        </div>
        <div className="text-[9px] text-slate-400 font-mono">
          {defenseActive ? 'Shield: ENFORCING' : 'Shield: BYPASS'}
        </div>
      </div>
    </div>
  );
}
