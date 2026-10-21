import React from 'react';
import { X, CheckCircle2, Cpu } from 'lucide-react';
import { DecisionTrace } from '../types/ares';

interface DecisionTraceModalProps {
  trace: DecisionTrace | null;
  onClose: () => void;
}

export const DecisionTraceModal: React.FC<DecisionTraceModalProps> = ({ trace, onClose }) => {
  if (!trace) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-300 rounded-xl max-w-4xl w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-sky-50 border border-sky-200 rounded-lg text-sky-600 font-mono">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-mono">DECISION TRACE & EXPLAINABILITY LOG</h2>
              <p className="text-xs text-slate-600">Complete multi-agent step execution trace & constraint audit trail</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Plan Summary Banner */}
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-600 font-bold">PRIMARY DECISION RATIONALE:</span>
            <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded font-bold">
              {trace.candidate_plans_count} CANDIDATE PLANS EVALUATED
            </span>
          </div>
          <p className="text-sm font-bold text-slate-900 font-sans">
            {trace.selected_plan_reason}
          </p>

          {/* Hard Constraints Enforced */}
          <div className="pt-2 border-t border-slate-200 text-xs">
            <span className="text-slate-600 font-mono font-bold">HARD CONSTRAINTS ENFORCED:</span>
            <div className="flex flex-wrap gap-2 mt-1 font-mono">
              {trace.constraints_enforced.map((c, idx) => (
                <span key={idx} className="bg-white text-sky-800 border border-slate-300 px-2 py-0.5 rounded text-[11px] font-semibold">
                  ✓ {c}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Step-by-Step Agent Timeline */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-700 font-mono tracking-wider">
            AGENT EXECUTION TIMELINE (OBSERVE → UNDERSTAND → PLAN → ANALYZE → DECIDE → VALIDATE → ACT)
          </h3>

          <div className="relative border-l-2 border-slate-200 ml-4 space-y-5">
            {trace.steps.map((step) => (
              <div key={step.step_index} className="relative pl-6">
                <div className="absolute -left-[17px] top-0 bg-white border-2 border-sky-600 text-sky-600 rounded-full p-1 shadow-sm">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-1.5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold text-sky-700">STEP {step.step_index}</span>
                      <span className="text-xs font-bold text-slate-900 font-mono">{step.agent_name}</span>
                    </div>
                    <span className="bg-white text-slate-700 text-[10px] px-2 py-0.5 rounded border border-slate-200 font-mono font-semibold">
                      STAGE: {step.stage}
                    </span>
                  </div>

                  <div className="text-xs text-slate-700 font-mono">
                    <span className="text-slate-500 font-bold">Input:</span> {step.input_summary}
                  </div>

                  <div className="text-xs text-slate-900 bg-white p-2.5 rounded border border-slate-200 font-mono">
                    <span className="text-emerald-700 font-bold">Output:</span> {step.output_summary}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-200">
          <button
            onClick={onClose}
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-mono text-xs px-4 py-2 rounded-lg transition-colors border border-slate-300 font-bold"
          >
            CLOSE TRACE
          </button>
        </div>
      </div>
    </div>
  );
};
