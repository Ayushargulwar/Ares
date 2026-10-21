import React from 'react';
import { AlertCircle, Bell } from 'lucide-react';
import { Incident } from '../types/ares';

interface LiveAlertsProps {
  incidents: Incident[];
  latestDiffAlert?: string | null;
}

export const LiveAlerts: React.FC<LiveAlertsProps> = ({ incidents, latestDiffAlert }) => {
  return (
    <div className="bg-slate-100 border-t border-slate-200 px-6 py-2.5 flex items-center justify-between gap-4">
      <div className="flex items-center space-x-2 text-xs font-mono text-slate-700 shrink-0 font-bold">
        <Bell className="w-4 h-4 text-amber-600 animate-pulse" />
        <span className="uppercase tracking-wider">LIVE OPERATIONAL ALERTS:</span>
      </div>

      <div className="flex items-center space-x-6 overflow-x-auto text-xs font-mono text-slate-800 py-0.5 font-semibold">
        {latestDiffAlert && (
          <span className="bg-red-100 text-red-800 border border-red-300 px-2.5 py-1 rounded flex items-center space-x-1.5 font-bold animate-pulse">
            <AlertCircle className="w-3.5 h-3.5 text-red-600" />
            <span>{latestDiffAlert}</span>
          </span>
        )}

        {incidents.map((inc) => (
          <span key={inc.id} className="flex items-center space-x-1.5 text-slate-800 shrink-0">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span className="font-bold text-slate-900">{inc.title}:</span>
            <span className="text-slate-600 line-clamp-1">{inc.description}</span>
          </span>
        ))}
      </div>
    </div>
  );
};
