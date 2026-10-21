import React from 'react';
import { X, HelpCircle, ArrowRight, ShieldAlert, Users, Clock, Navigation, Cross, Ambulance, Shield } from 'lucide-react';
import { PlanDiff } from '../types/ares';

interface PlanDiffModalProps {
  diff: PlanDiff | null;
  onClose: () => void;
}

export const PlanDiffModal: React.FC<PlanDiffModalProps> = ({ diff, onClose }) => {
  if (!diff) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-300 rounded-xl max-w-3xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 font-mono">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-amber-100 text-amber-900 border border-amber-300 text-xs px-2.5 py-0.5 rounded font-bold">
                ⚠ REPLAN TRIGGERED (PLAN v{diff.plan_version || 2})
              </span>
              <h2 className="text-lg font-bold text-slate-900">{diff.event.title || diff.event.type}</h2>
            </div>
            <p className="text-xs text-slate-600 mt-1 font-sans font-medium">{diff.event.description}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Summary Impact Metrics Grid */}
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="text-slate-500 font-bold text-[10px] flex items-center space-x-1">
              <Navigation className="w-3.5 h-3.5 text-sky-600" />
              <span>UNITS REROUTED</span>
            </div>
            <div className="text-base font-bold text-slate-900 mt-1">
              {diff.units_rerouted?.length || 0} Units
            </div>
            <div className="text-[10px] text-slate-500 truncate mt-0.5">
              {diff.units_rerouted?.join(', ') || 'None'}
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="text-slate-500 font-bold text-[10px] flex items-center space-x-1">
              <Users className="w-3.5 h-3.5 text-amber-600" />
              <span>PEOPLE AFFECTED CHANGE</span>
            </div>
            <div className="text-base font-bold text-amber-700 mt-1">
              {diff.people_affected_change > 0 ? `+${diff.people_affected_change.toLocaleString()}` : '0'}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Civilians impacted</div>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="text-slate-500 font-bold text-[10px] flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-purple-600" />
              <span>ETA DIFFERENTIAL</span>
            </div>
            <div className="text-base font-bold text-purple-700 mt-1">
              {diff.eta_change_seconds > 0 ? `+${Math.ceil(diff.eta_change_seconds / 60)} mins` : 'No delay'}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Detour penalty</div>
          </div>
        </div>

        {/* Spatial Proximity Analysis (Nearest Hospital & Ambulances) */}
        {diff.nearest_hospitals && diff.nearest_hospitals.length > 0 && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2 text-xs">
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center justify-between">
              <span>SPATIAL PROXIMITY ANALYSIS AT DISASTER TARGET:</span>
              <span className="text-amber-700 font-bold">{diff.nearest_ambulances_count} Ambulances within 10km</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
              {/* Closest Hospital */}
              <div className="bg-white p-2.5 rounded border border-slate-200 flex items-start space-x-2">
                <Cross className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <div className="font-bold text-slate-900 truncate">{diff.nearest_hospitals[0].name}</div>
                  <div className="text-[10px] text-sky-700 font-semibold">
                    {diff.nearest_hospitals[0].distance_km} km away • {diff.nearest_hospitals[0].capacity_or_eta}
                  </div>
                </div>
              </div>

              {/* Closest Unit */}
              {diff.nearest_units && diff.nearest_units.length > 0 && (
                <div className="bg-white p-2.5 rounded border border-slate-200 flex items-start space-x-2">
                  <Shield className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 truncate">{diff.nearest_units[0].name}</div>
                    <div className="text-[10px] text-emerald-700 font-semibold">
                      {diff.nearest_units[0].capacity_or_eta} • {diff.nearest_units[0].status}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Why did the plan change? Rationale */}
        <div className="bg-sky-50/70 border border-sky-200 p-4 rounded-lg">
          <div className="text-xs font-bold text-sky-800 flex items-center space-x-1.5 mb-1.5">
            <HelpCircle className="w-4 h-4 text-sky-600" />
            <span>REPLANNING RATIONALE & EXPLAINABILITY</span>
          </div>
          <p className="text-xs text-slate-800 leading-relaxed font-sans font-medium">
            {diff.why_plan_changed}
          </p>

          {/* Invalidated Assumptions List */}
          {diff.invalidated_assumptions?.length > 0 && (
            <div className="mt-3 pt-2.5 border-t border-sky-200 text-xs">
              <div className="text-slate-700 mb-1 font-bold">INVALIDATED OPERATIONAL ASSUMPTIONS:</div>
              <ul className="space-y-1">
                {diff.invalidated_assumptions.map((item, idx) => (
                  <li key={idx} className="text-amber-900 flex items-start space-x-1.5 font-medium">
                    <span>•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Diff Table */}
        <div>
          <h3 className="text-xs font-bold text-slate-700 mb-2 tracking-wider">
            RESOURCE ALLOCATION DIFFERENTIAL
          </h3>
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] border-b border-slate-200 font-bold">
                <tr>
                  <th className="p-3">Zone</th>
                  <th className="p-3">Resource Type</th>
                  <th className="p-3 text-center">BEFORE (Old)</th>
                  <th className="p-3 text-center">AFTER (New)</th>
                  <th className="p-3 text-center">Delta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                {diff.changes?.length > 0 ? (
                  diff.changes.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">{item.zone_name}</td>
                      <td className="p-3 text-slate-600">{item.resource_type}</td>
                      <td className="p-3 text-center font-bold text-slate-500">{item.old_value}</td>
                      <td className="p-3 text-center font-bold text-sky-700">{item.new_value}</td>
                      <td className="p-3 text-center font-bold">
                        <span className={`px-2 py-0.5 rounded text-[11px] ${
                          item.change_delta > 0
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-red-100 text-red-800 border border-red-300'
                        }`}>
                          {item.change_delta > 0 ? `+${item.change_delta}` : item.change_delta}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-slate-500">
                      Units rerouted along alternate transit corridors. No numerical quantity shifts required.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="bg-sky-600 hover:bg-sky-700 text-white font-bold px-4 py-2 rounded-lg transition-colors text-xs shadow-sm"
          >
            ACKNOWLEDGE & CONFIRM PLAN v{diff.plan_version || 2}
          </button>
        </div>
      </div>
    </div>
  );
};
