import React from 'react';
import {
  HelpCircle,
  AlertTriangle,
  Flame,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  BookOpen,
  Info,
  ShieldX
} from 'lucide-react';

export function SectionWhatIsThisAttack({ attack }) {
  const { whatIsThis } = attack;

  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-4 sm:p-6 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase text-blue-600 font-bold tracking-wider">
              Section A · Foundational Concept
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              What is this attack? ({attack.title})
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
            {attack.category}
          </span>
          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
            attack.severity === 'CRITICAL'
              ? 'bg-rose-50 text-rose-700 border-rose-300'
              : 'bg-amber-50 text-amber-700 border-amber-300'
          }`}>
            {attack.severity} RISK
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        {/* Core summary */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Plain-English Definition</span>
          </div>
          <p className="text-slate-700 leading-relaxed text-[11px] sm:text-xs">
            {whatIsThis.summary}
          </p>
        </div>

        {/* Realistic Example */}
        <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/80 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Realistic Scenario Example</span>
          </div>
          <p className="text-amber-950 leading-relaxed text-[11px] sm:text-xs">
            {whatIsThis.example}
          </p>
        </div>

        {/* Damage potential */}
        <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-200/80 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-rose-900">
            <Flame className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Potential Damage &amp; Impact</span>
          </div>
          <p className="text-rose-950 leading-relaxed text-[11px] sm:text-xs">
            {whatIsThis.impact}
          </p>
        </div>
      </div>
    </div>
  );
}

export function SectionWhatDidWeLearn({ attack, defenseActive }) {
  const { whatDidWeLearn } = attack;

  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-4 sm:p-6 shadow-sm space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase text-emerald-600 font-bold tracking-wider">
              Section D · Key Takeaways &amp; Architecture
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              What did we learn from this simulation?
            </h3>
          </div>
        </div>

        <span className="text-xs text-slate-500 font-mono hidden sm:inline-block">
          Cybersecurity Educational Recap
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        {/* Attacker attempt */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
          <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">
            1. What Attacker Attempted
          </span>
          <p className="text-slate-700 leading-relaxed text-[11px] sm:text-xs">
            {whatDidWeLearn.attempted}
          </p>
        </div>

        {/* Component that stopped it */}
        <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 space-y-1.5">
          <span className="text-[10px] font-mono uppercase text-blue-700 font-bold block">
            2. Defending Component
          </span>
          <p className="text-blue-950 leading-relaxed text-[11px] sm:text-xs">
            {whatDidWeLearn.stoppedBy}
          </p>
        </div>

        {/* Protected Asset */}
        <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-1.5">
          <span className="text-[10px] font-mono uppercase text-emerald-700 font-bold block">
            3. Asset Protected
          </span>
          <p className="text-emerald-950 leading-relaxed text-[11px] sm:text-xs">
            {whatDidWeLearn.assetProtected}
          </p>
        </div>

        {/* Defense Disabled Outcome */}
        <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200 space-y-1.5">
          <span className="text-[10px] font-mono uppercase text-rose-700 font-bold block">
            4. Without Defense (Defense OFF)
          </span>
          <p className="text-rose-950 leading-relaxed text-[11px] sm:text-xs">
            {whatDidWeLearn.defenseDisabledOutcome}
          </p>
        </div>
      </div>

      {/* Prevention Measures */}
      <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
        <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span>Practical Prevention &amp; Hardening Measures</span>
        </h4>
        <ul className="space-y-1.5 text-xs text-slate-700 pl-4 list-disc leading-relaxed">
          {whatDidWeLearn.preventionMeasures.map((measure, idx) => (
            <li key={idx} className="leading-relaxed">
              {measure}
            </li>
          ))}
        </ul>
      </div>

      {/* Engine Distinction Notice */}
      <div className="p-3 rounded-xl bg-slate-100/90 border border-slate-200 text-[11px] font-mono text-slate-600 flex items-start gap-2">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div>{whatDidWeLearn.engineDistinction}</div>
      </div>
    </div>
  );
}
