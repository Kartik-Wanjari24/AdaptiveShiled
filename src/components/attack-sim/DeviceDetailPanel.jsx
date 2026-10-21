import React from 'react';
import { X, Info, ArrowRight, Shield, ShieldCheck, ShieldAlert, Activity } from 'lucide-react';

export default function DeviceDetailPanel({ selectedElement, onClose, defenseActive }) {
  if (!selectedElement) return null;

  const isNode = selectedElement.elementType === 'node';
  const IconComponent = selectedElement.icon || Info;

  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-4 sm:p-5 shadow-lg space-y-3 relative animate-fadeIn">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
            <IconComponent className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                {isNode ? `Device: ${selectedElement.type}` : 'Network Connection'}
              </span>
              <span className="text-xs text-slate-400 font-mono">ID: {selectedElement.id}</span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">
              {selectedElement.label}
            </h3>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          title="Close details"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold block">
            {isNode ? 'Role & Purpose' : 'Traffic Details'}
          </span>
          <p className="text-slate-700 leading-relaxed">
            {selectedElement.desc || (isNode ? selectedElement.role : 'Network transmission link')}
          </p>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold block">
            {isNode ? 'Security Posture' : 'Connection Type'}
          </span>
          <div className="flex items-center gap-2">
            {isNode ? (
              <span className="font-semibold text-slate-800">
                {selectedElement.type === 'attacker'
                  ? 'Adversary Node (Untrusted)'
                  : selectedElement.type === 'security'
                  ? (defenseActive ? 'Active Inspection Layer' : 'Security Layer Offline')
                  : selectedElement.type === 'server'
                  ? 'Internal Protected Server'
                  : 'Client / Network Host'}
              </span>
            ) : (
              <span className={`font-semibold capitalize ${
                selectedElement.type === 'malicious'
                  ? 'text-rose-600'
                  : selectedElement.type === 'safe'
                  ? 'text-emerald-600'
                  : selectedElement.type === 'warning'
                  ? 'text-amber-600'
                  : 'text-blue-600'
              }`}>
                {selectedElement.type} Flow
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500">
            {isNode
              ? 'Click other components to compare network topology roles.'
              : `Transmits packets between ${selectedElement.from} and ${selectedElement.to}.`}
          </p>
        </div>
      </div>
    </div>
  );
}
