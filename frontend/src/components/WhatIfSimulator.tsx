import React from 'react';
import { Sliders, AlertOctagon, UserPlus, ShieldOff, Zap, PlusCircle } from 'lucide-react';
import { SimulationEvent } from '../types/ares';

interface WhatIfSimulatorProps {
  onSimulateEvent: (event: SimulationEvent) => void;
  isProcessing: boolean;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({
  onSimulateEvent,
  isProcessing
}) => {
  const events = [
    {
      id: "evt-road-block",
      type: "ROAD_BLOCK" as const,
      title: "Block Highway — Zone A (Balkhu)",
      description: "Landslide & surge block main highway bridge to Kathmandu South",
      target_zone_id: "zone-a",
      icon: AlertOctagon,
      color: "hover:bg-red-50 text-red-900 border-red-300"
    },
    {
      id: "evt-pop-increase",
      type: "POPULATION_INCREASE" as const,
      title: "Add 500 Displaced — Zone C (Bhaktapur)",
      description: "500 hill landslide evacuees seek shelter in Bhaktapur square",
      target_zone_id: "zone-c",
      payload: { additional_population: 500 },
      icon: UserPlus,
      color: "hover:bg-sky-50 text-sky-900 border-sky-300"
    },
    {
      id: "evt-resource-loss",
      type: "RESOURCE_LOSS" as const,
      title: "Re-route 2 NDRF Rescue Teams",
      description: "2 NDRF rescue teams dispatched to Helambu flash emergency",
      payload: { rescue_teams_lost: 2 },
      icon: ShieldOff,
      color: "hover:bg-amber-50 text-amber-900 border-amber-300"
    },
    {
      id: "evt-severity-escalate",
      type: "SEVERITY_ESCALATION" as const,
      title: "Escalate Severity — Zone B (Chobhar)",
      description: "Debris dam breach escalates Chobhar Gorge to CRITICAL",
      target_zone_id: "zone-b",
      icon: Zap,
      color: "hover:bg-purple-50 text-purple-900 border-purple-300"
    },
    {
      id: "evt-new-zone",
      type: "NEW_INCIDENT" as const,
      title: "Add Zone D — Kavre & Roshi Basin",
      description: "New severe breach reported in Kavre mountain corridor",
      icon: PlusCircle,
      color: "hover:bg-emerald-50 text-emerald-900 border-emerald-300"
    }
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
        <div className="flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-sky-600" />
          <h2 className="text-sm font-bold text-slate-900 font-mono tracking-wider">WHAT-IF DISASTER SIMULATOR</h2>
        </div>
        <span className="text-[10px] text-slate-500 font-mono font-bold uppercase">
          REAL NEPAL MONSOON EVENT MUTATIONS
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5">
        {events.map((evt) => {
          const Icon = evt.icon;
          return (
            <button
              key={evt.id}
              disabled={isProcessing}
              onClick={() => onSimulateEvent({
                id: `${evt.id}-${Date.now()}`,
                type: evt.type,
                title: evt.title,
                description: evt.description,
                target_zone_id: evt.target_zone_id,
                payload: evt.payload || {},
                timestamp: new Date().toISOString()
              })}
              className={`flex flex-col items-center justify-center p-3 rounded-lg border bg-slate-50 transition-all font-mono text-left group ${evt.color} ${
                isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-[1.02] shadow-sm'
              }`}
            >
              <Icon className="w-5 h-5 mb-1.5 transition-transform group-hover:scale-110" />
              <span className="text-xs font-bold text-center text-slate-900">{evt.title}</span>
              <span className="text-[10px] text-slate-500 text-center mt-1 line-clamp-1">{evt.description}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
