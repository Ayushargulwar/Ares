import React from 'react';
import { Bot, CheckCircle2, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import { AgentWorkflowStatus, AgentStatusItem } from '../types/ares';

interface AgentActivityProps {
  status: AgentWorkflowStatus | null;
  isReplanning?: boolean;
  replanMessage?: string;
}

export const AgentActivity: React.FC<AgentActivityProps> = ({
  status,
  isReplanning,
  replanMessage
}) => {
  const defaultAgents: AgentStatusItem[] = [
    { name: "Situation Agent", role: "Data Normalization", status: "completed", message: "Normalized 3 affected disaster zones.", timestamp: "" },
    { name: "Planner Agent", role: "Problem Decomposition", status: "completed", message: "Decomposed operational plan into 4 sub-tasks.", timestamp: "" },
    { name: "Resource Agent", role: "Constraint Auditing", status: "completed", message: "Audited 8 rescue teams, 5 ambulances.", timestamp: "" },
    { name: "Risk Agent", role: "Hazard Assessment", status: "completed", message: "Evaluated road access & flooding risk.", timestamp: "" },
    { name: "Priority Agent", role: "Deterministic Scoring", status: "completed", message: "Computed zone priorities (Zone A: 88.5/100).", timestamp: "" },
    { name: "Decision Agent", role: "Constraint Solver", status: "completed", message: "Solved PuLP integer linear program.", timestamp: "" },
    { name: "Critic Agent", role: "Safety Validation", status: "completed", message: "Constraint satisfaction verified 100%.", timestamp: "" },
    { name: "Communication Agent", role: "Dispatch Instructions", status: "completed", message: "Generated tactical emergency orders.", timestamp: "" }
  ];

  const agentsToDisplay = status?.agents && status.agents.length > 0 ? status.agents : defaultAgents;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col h-full shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
        <div className="flex items-center space-x-2">
          <Bot className="w-4 h-4 text-sky-600" />
          <h2 className="text-sm font-bold text-slate-900 font-mono tracking-wider">LIVE AGENT ACTIVITY</h2>
        </div>
        <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-semibold">
          8 ACTIVE AGENTS
        </span>
      </div>

      {/* Replanning Banner */}
      {isReplanning && (
        <div className="mb-3 bg-amber-50 border border-amber-300 p-2.5 rounded-lg flex items-center space-x-2 text-amber-900 text-xs font-mono animate-pulse shadow-sm">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <div>
            <div className="font-bold">⚠ CHANGE DETECTED — REPLANNING</div>
            <div className="text-[11px] text-amber-800">{replanMessage || "Recalculating priorities & solving ILP constraints..."}</div>
          </div>
        </div>
      )}

      {/* Agent Activity Log */}
      <div className="space-y-2 overflow-y-auto flex-1 pr-1">
        {agentsToDisplay.map((agent, idx) => {
          const isDone = agent.status === 'completed';
          const isRunning = agent.status === 'running';
          const isWarning = agent.status === 'warning';

          return (
            <div
              key={idx}
              className={`p-2.5 rounded-lg border text-xs flex items-start space-x-2.5 transition-colors ${
                isRunning
                  ? 'bg-sky-50 border-sky-300 text-sky-900'
                  : isWarning
                  ? 'bg-amber-50 border-amber-300 text-amber-900'
                  : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <div className="mt-0.5">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : isRunning ? (
                  <Loader2 className="w-4 h-4 text-sky-600 animate-spin" />
                ) : isWarning ? (
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                ) : (
                  <Clock className="w-4 h-4 text-slate-400" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-bold font-mono text-slate-900 text-xs">{agent.name}</span>
                  <span className="text-[10px] text-slate-500 font-mono font-semibold">{agent.role}</span>
                </div>
                <div className="text-[11px] text-slate-600 truncate mt-0.5">
                  {agent.message}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
