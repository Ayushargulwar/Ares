import React from 'react';
import { Cpu, ShieldCheck, HelpCircle, ArrowRight } from 'lucide-react';
import { AllocationPlan, Zone } from '../types/ares';

interface AllocationPanelProps {
  plan: AllocationPlan | null;
  zones: Zone[];
  onOpenDecisionTrace: () => void;
  onOpenDiffModal?: () => void;
  hasDiff?: boolean;
}

export const AllocationPanel: React.FC<AllocationPanelProps> = ({
  plan,
  zones,
  onOpenDecisionTrace,
  onOpenDiffModal,
  hasDiff
}) => {
  if (!plan) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 text-center text-slate-500 font-mono">
        No active plan generated yet.
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col h-full shadow-sm">
      {/* Title & Feasibility Pill */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
        <div className="flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-sky-600" />
          <h2 className="text-sm font-bold text-slate-900 font-mono tracking-wider">AI RECOMMENDED ALLOCATION</h2>
        </div>
        <div className="flex items-center space-x-1.5 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs px-2.5 py-1 rounded font-mono font-bold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Plan Feasibility: 100%</span>
        </div>
      </div>

      {/* Allocation Breakdown List */}
      <div className="space-y-3 overflow-y-auto flex-1 pr-1">
        {zones.map((zone) => {
          const item = plan.items[zone.id];
          if (!item) return null;

          return (
            <div key={zone.id} className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 font-mono">{item.zone_name}</span>
                <span className="text-[10px] bg-slate-200 text-slate-800 px-2 py-0.5 rounded font-mono font-bold">
                  Score: {item.priority_score}/100
                </span>
              </div>

              {/* Resource Deployment Grid */}
              <div className="grid grid-cols-3 gap-2 mt-2.5 text-xs font-mono text-center">
                <div className="bg-white p-2 rounded border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-semibold">RESCUE TEAMS</div>
                  <div className="text-sm font-bold text-sky-700 mt-0.5">{item.rescue_teams} Teams</div>
                </div>
                <div className="bg-white p-2 rounded border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-semibold">AMBULANCES</div>
                  <div className="text-sm font-bold text-amber-700 mt-0.5">{item.ambulances} Units</div>
                </div>
                <div className="bg-white p-2 rounded border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-semibold">SUPPLY ALLOC</div>
                  <div className="text-sm font-bold text-emerald-700 mt-0.5">{item.supply_percent}%</div>
                </div>
              </div>

              {/* Rationale */}
              <div className="text-[11px] text-slate-600 mt-2 italic bg-white p-2 rounded border border-slate-200">
                "{item.rationale}"
              </div>
            </div>
          );
        })}
      </div>

      {/* Decision Trace Action Footer */}
      <div className="pt-3 border-t border-slate-200 mt-3 flex flex-wrap items-center justify-between gap-2">
        <button
          onClick={onOpenDecisionTrace}
          className="flex items-center space-x-1.5 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-300 text-xs px-3 py-1.5 rounded-lg transition-colors font-mono font-bold shadow-sm"
        >
          <HelpCircle className="w-3.5 h-3.5 text-sky-600" />
          <span>[VIEW DECISION TRACE]</span>
        </button>

        {hasDiff && onOpenDiffModal && (
          <button
            onClick={onOpenDiffModal}
            className="flex items-center space-x-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 text-xs px-3 py-1.5 rounded-lg transition-colors font-mono font-bold animate-pulse shadow-sm"
          >
            <span>[VIEW PLAN DIFF]</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
