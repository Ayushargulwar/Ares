import React from 'react';
import { ShieldCheck, ShieldAlert, RefreshCw, Rocket } from 'lucide-react';
import { DisasterScenario } from '../types/ares';
import { AresLogo } from './AresLogo';

interface HeaderProps {
  scenario: DisasterScenario | null;
  onSelectScenario: (id: string) => void;
  onOpenWizard: () => void;
  onApprove: () => void;
  onReset: () => void;
  isProcessing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  scenario,
  onSelectScenario,
  onOpenWizard,
  onApprove,
  onReset,
  isProcessing
}) => {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 shadow-sm">
      {/* Brand Title with Custom ARES Logo */}
      <div className="flex items-center space-x-3.5">
        <div className="h-11 w-11 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shadow-sm p-1">
          <AresLogo size={38} />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 font-mono">ARES</h1>
            <span className="bg-sky-100 text-sky-800 text-xs px-2 py-0.5 rounded border border-sky-300 font-semibold font-mono">
              ENGINE v1.0
            </span>
            <span className="bg-emerald-50 text-emerald-700 text-xs px-2 py-0.5 rounded border border-emerald-300 flex items-center gap-1 font-mono font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              ONLINE
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Autonomous Disaster Response & Resource Allocation Engine — <span className="text-sky-700 font-semibold">T9 Agentic AI</span>
          </p>
        </div>
      </div>

      {/* Active Incident Controls */}
      <div className="flex items-center space-x-3">
        {/* NEW INCIDENT WIZARD BUTTON */}
        <button
          onClick={onOpenWizard}
          disabled={isProcessing}
          className="flex items-center space-x-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-md font-mono cursor-pointer hover:scale-[1.02]"
        >
          <Rocket className="w-4 h-4" />
          <span>+ NEW INCIDENT WIZARD</span>
        </button>

        {/* Scenario Switcher */}
        <div className="flex items-center space-x-2 bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 shadow-sm">
          <span className="text-xs text-slate-500 uppercase font-mono tracking-wider font-semibold">Location:</span>
          <select
            value={scenario?.id || "scenario-flood-01"}
            onChange={(e) => onSelectScenario(e.target.value)}
            disabled={isProcessing}
            className="bg-transparent text-sm font-bold text-slate-900 focus:outline-none cursor-pointer max-w-[220px] truncate"
          >
            <option value="scenario-delhi-01" className="bg-white text-slate-900">Delhi — Yamuna Flood Crisis</option>
            <option value="scenario-mumbai-01" className="bg-white text-slate-900">Mumbai — Coastal Storm Surge</option>
            <option value="scenario-flood-01" className="bg-white text-slate-900">Kathmandu — Bagmati Basin Crisis</option>
            <option value="scenario-kolkata-01" className="bg-white text-slate-900">Kolkata — Hooghly Inundation</option>
          </select>
        </div>

        {/* Human Approval Status */}
        {scenario && (
          <div className="flex items-center space-x-3">
            {scenario.human_approved ? (
              <div className="flex items-center space-x-1.5 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm font-mono">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>COMMANDER APPROVED</span>
              </div>
            ) : (
              <button
                onClick={onApprove}
                disabled={isProcessing}
                className="flex items-center space-x-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors font-mono shadow-sm"
              >
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>[APPROVE PLAN]</span>
              </button>
            )}

            <button
              onClick={onReset}
              disabled={isProcessing}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 transition-colors"
              title="Reset Scenario"
            >
              <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
