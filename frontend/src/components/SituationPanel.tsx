import React from 'react';
import { Users, Navigation, Layers } from 'lucide-react';
import { Zone } from '../types/ares';

interface SituationPanelProps {
  zones: Zone[];
  selectedZoneId: string | null;
  onSelectZone: (id: string) => void;
}

export const SituationPanel: React.FC<SituationPanelProps> = ({
  zones,
  selectedZoneId,
  onSelectZone
}) => {
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-300';
      case 'HIGH': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'MODERATE': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-sky-100 text-sky-800 border-sky-300';
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col h-full shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-sky-600" />
          <h2 className="text-sm font-bold text-slate-900 font-mono tracking-wider">SITUATION OVERVIEW</h2>
        </div>
        <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-semibold">
          {zones.length} ZONES
        </span>
      </div>

      <div className="space-y-3 overflow-y-auto flex-1 pr-1">
        {zones.map((zone) => {
          const isSelected = selectedZoneId === zone.id;

          return (
            <div
              key={zone.id}
              onClick={() => onSelectZone(zone.id)}
              className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-sky-50/80 border-sky-400 shadow-sm ring-1 ring-sky-400/40'
                  : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100/80'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 font-mono">{zone.name}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border font-mono ${getSeverityBadge(zone.severity)}`}>
                      {zone.severity}
                    </span>
                    {zone.priority_score !== undefined && (
                      <span className="text-[11px] font-mono text-sky-700 font-bold">
                        Priority: {zone.priority_score}/100
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-2 mt-3 text-xs bg-white p-2 rounded border border-slate-200">
                <div className="flex items-center space-x-1.5 text-slate-700 font-mono">
                  <Users className="w-3.5 h-3.5 text-slate-500" />
                  <span>Pop: <strong className="text-slate-900">{zone.population_affected.toLocaleString()}</strong></span>
                </div>
                <div className="flex items-center space-x-1.5 text-slate-700 font-mono">
                  <Navigation className="w-3.5 h-3.5 text-slate-500" />
                  <span>Access: <strong className={zone.accessibility < 40 ? 'text-red-600' : 'text-emerald-600'}>{zone.accessibility}%</strong></span>
                </div>
              </div>

              {/* Risk Factors */}
              {zone.risk_factors && zone.risk_factors.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-slate-200">
                  <div className="text-[10px] text-slate-500 font-mono font-semibold mb-1">RISK FACTORS:</div>
                  <div className="flex flex-wrap gap-1">
                    {zone.risk_factors.map((rf, idx) => (
                      <span key={idx} className="text-[10px] bg-red-50 text-red-700 border border-red-200 px-1.5 py-0.5 rounded font-mono font-medium">
                        • {rf}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
