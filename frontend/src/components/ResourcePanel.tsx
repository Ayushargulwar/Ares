import React from 'react';
import { Shield, Ambulance, Package, Home, CheckCircle2 } from 'lucide-react';
import { Resource, AllocationPlan } from '../types/ares';

interface ResourcePanelProps {
  resources: Record<string, Resource>;
  activePlan?: AllocationPlan | null;
}

export const ResourcePanel: React.FC<ResourcePanelProps> = ({ resources, activePlan }) => {
  const rescue = resources.rescue_teams || { total: 8, available: 8, assigned: 0, unit_label: 'teams' };
  const ambulances = resources.ambulances || { total: 5, available: 5, assigned: 0, unit_label: 'units' };
  const shelter = resources.shelter_capacity || { total: 1000, available: 720, assigned: 280, unit_label: 'beds' };

  const rescueUsed = activePlan?.total_rescue_teams_used ?? 0;
  const ambUsed = activePlan?.total_ambulances_used ?? 0;
  const suppUsed = activePlan?.total_supply_percent_used ?? 0;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 mb-3">
        <div className="flex items-center space-x-2">
          <Shield className="w-4 h-4 text-sky-600" />
          <h2 className="text-sm font-bold text-slate-900 font-mono tracking-wider">RESOURCE INVENTORY</h2>
        </div>
        <div className="flex items-center space-x-1 text-[11px] text-emerald-700 font-mono font-bold">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>ZERO OVER-ALLOCATION ENFORCED</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Rescue Teams */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between text-slate-600 mb-1">
            <span className="text-xs font-mono font-bold">RESCUE TEAMS</span>
            <Shield className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-lg font-bold text-slate-900 font-mono">
            {rescueUsed} / <span className="text-sky-700">{rescue.available}</span>
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-sky-500 h-full transition-all"
              style={{ width: `${Math.min(100, (rescueUsed / max(1, rescue.available)) * 100)}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-500 mt-1 font-mono">Deployed: {rescueUsed} of {rescue.available} teams</div>
        </div>

        {/* Ambulances */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between text-slate-600 mb-1">
            <span className="text-xs font-mono font-bold">AMBULANCES</span>
            <Ambulance className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-lg font-bold text-slate-900 font-mono">
            {ambUsed} / <span className="text-amber-700">{ambulances.available}</span>
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-amber-500 h-full transition-all"
              style={{ width: `${Math.min(100, (ambUsed / max(1, ambulances.available)) * 100)}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-500 mt-1 font-mono">Deployed: {ambUsed} of {ambulances.available} units</div>
        </div>

        {/* Supply Units */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between text-slate-600 mb-1">
            <span className="text-xs font-mono font-bold">RATION SUPPLIES</span>
            <Package className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-lg font-bold text-slate-900 font-mono">
            {suppUsed}% <span className="text-xs font-normal text-slate-500">capacity</span>
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-full transition-all"
              style={{ width: `${Math.min(100, suppUsed)}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-500 mt-1 font-mono">Ration quota: {suppUsed}% allocated</div>
        </div>

        {/* Shelter Beds */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between text-slate-600 mb-1">
            <span className="text-xs font-mono font-bold">SHELTER CAPACITY</span>
            <Home className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-lg font-bold text-slate-900 font-mono">
            {shelter.available} <span className="text-xs font-normal text-slate-500">beds available</span>
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-purple-500 h-full transition-all"
              style={{ width: '72%' }}
            />
          </div>
          <div className="text-[10px] text-slate-500 mt-1 font-mono">Occupancy: 72% (720 beds free)</div>
        </div>
      </div>
    </div>
  );
};

function max(a: number, b: number) {
  return a > b ? a : b;
}
