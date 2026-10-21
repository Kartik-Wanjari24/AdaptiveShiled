import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ShieldX,
  Shield,
  Activity,
  AlertCircle,
  CheckCircle2,
  FastForward,
  StepForward
} from 'lucide-react';

export default function SimulationControls({
  attack,
  currentStepIndex,
  onStepChange,
  isPlaying,
  onTogglePlay,
  onReset,
  defenseActive,
  onToggleDefense,
  speed = 1.0,
  onSpeedChange,
  onStepForward
}) {
  const totalSteps = attack.steps.length;
  const currentStep = attack.steps[currentStepIndex] || attack.steps[0];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === totalSteps - 1;

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      onStepChange(currentStepIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentStepIndex < totalSteps - 1) {
      onStepChange(currentStepIndex + 1);
    }
  };

  return (
    <div className="space-y-4">
      {/* Playback Controls Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">

        {/* Left: Step navigation & Play/Pause/Reset */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Start / Pause */}
          <button
            onClick={onTogglePlay}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm ${
              isPlaying
                ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-300'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>{isLastStep ? 'Replay Simulation' : 'Play Simulation'}</span>
              </>
            )}
          </button>

          {/* Step-by-Step Forward Button */}
          {onStepForward && (
            <button
              onClick={onStepForward}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-800 transition-all cursor-pointer border border-slate-200"
              title="Advance one event at a time"
            >
              <StepForward className="w-3.5 h-3.5 text-blue-600" />
              <span>Step Forward</span>
            </button>
          )}

          {/* Previous Step */}
          <button
            onClick={handlePrev}
            disabled={isFirstStep}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold text-slate-700 transition-all cursor-pointer border border-slate-200"
            title="Previous Step"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Prev</span>
          </button>

          {/* Next Step */}
          <button
            onClick={handleNext}
            disabled={isLastStep}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold text-slate-700 transition-all cursor-pointer border border-slate-200"
            title="Next Step"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Reset */}
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-all cursor-pointer border border-slate-200"
            title="Reset to Step 1 & clear packets"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>

        {/* Center: Simulation Speed Selector (0.5x, 1x, 2x) */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <span className="text-[10px] font-mono text-slate-500 font-bold px-1.5">SPEED:</span>
          {[0.5, 1.0, 2.0].map((s) => (
            <button
              key={s}
              onClick={() => onSpeedChange && onSpeedChange(s)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                speed === s
                  ? 'bg-white text-blue-600 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {s}×
            </button>
          ))}
        </div>

        {/* Right: Defense ON / OFF toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleDefense}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer ${
              defenseActive
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/25 ring-2 ring-blue-400'
                : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300'
            }`}
          >
            {defenseActive ? (
              <>
                <ShieldCheck className="w-4 h-4 text-white" />
                <span>Defense: ON</span>
              </>
            ) : (
              <>
                <ShieldX className="w-4 h-4 text-rose-600" />
                <span>Defense: OFF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Step Progress Timeline Indicator */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none">
        {attack.steps.map((step, idx) => {
          const isCurrent = idx === currentStepIndex;
          const isPassed = idx < currentStepIndex;
          return (
            <button
              key={step.stepNumber}
              onClick={() => onStepChange(idx)}
              className={`flex-1 min-w-[120px] p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                isCurrent
                  ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-400/30'
                  : isPassed
                  ? 'bg-white border-slate-300 text-slate-600 hover:border-slate-400'
                  : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                <span className={isCurrent ? 'font-bold text-blue-700' : 'text-slate-500'}>
                  STEP {step.stepNumber}
                </span>
                {isPassed && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                {isCurrent && <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />}
              </div>
              <div className={`text-[11px] truncate font-medium ${isCurrent ? 'text-slate-900 font-bold' : 'text-slate-600'}`}>
                {step.title}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Step Detailed Explanation Box */}
      <div className="rounded-2xl bg-white border border-slate-200 p-4 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 font-mono uppercase tracking-wide">
              Step {currentStep.stepNumber} Explanation: {currentStep.title}
            </h4>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-500">Live Stage:</span>
            <span className="font-semibold text-slate-800">{currentStep.statusText}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* What is happening */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
              <Activity className="w-4 h-4 text-blue-600" />
              <span>What is happening right now</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              {currentStep.description}
            </p>
          </div>

          {/* Why Defense allows / detects / blocks / quarantines */}
          <div className={`p-4 rounded-xl border space-y-1.5 ${
            defenseActive
              ? 'bg-blue-50/50 border-blue-200 text-blue-950'
              : 'bg-rose-50/50 border-rose-200 text-rose-950'
          }`}>
            <div className="flex items-center gap-1.5 text-xs font-bold">
              {defenseActive ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span className="text-blue-900">AdaptiveShield Active Defense Response</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span className="text-rose-900">Unprotected Network Response (Defense OFF)</span>
                </>
              )}
            </div>
            <p className="text-xs leading-relaxed whitespace-pre-line text-slate-700">
              {currentStep.defenseExplanation}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
