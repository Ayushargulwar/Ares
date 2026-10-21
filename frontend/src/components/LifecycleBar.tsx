import React from 'react';
import { Eye, BarChart3, Cpu, Send, Radio, RefreshCw } from 'lucide-react';

interface LifecycleBarProps {
  currentStage: string;
  isReplanning?: boolean;
}

export const LifecycleBar: React.FC<LifecycleBarProps> = ({ currentStage, isReplanning }) => {
  const steps = [
    { id: 'UNDERSTAND', label: '1. UNDERSTAND', icon: Eye, desc: 'Collect & interpret data' },
    { id: 'ANALYZE', label: '2. ANALYZE', icon: BarChart3, desc: 'Evaluate zones & risks' },
    { id: 'DECIDE', label: '3. DECIDE', icon: Cpu, desc: 'Solve ILP constraints' },
    { id: 'ACT', label: '4. ACT', icon: Send, desc: 'Dispatch deployment' },
    { id: 'MONITOR', label: '5. MONITOR', icon: Radio, desc: 'Track live incidents' },
    { id: 'REPLAN', label: '6. REPLAN', icon: RefreshCw, desc: 'Dynamic replan' },
  ];

  return (
    <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5">
      <div className="flex items-center justify-between max-w-7xl mx-auto overflow-x-auto gap-2">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isActive = currentStage === step.id || (step.id === 'REPLAN' && isReplanning);
          const isPassed = steps.findIndex(s => s.id === currentStage) > idx;

          return (
            <div key={step.id} className="flex items-center flex-1 min-w-[140px]">
              <div
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border w-full transition-all ${
                  isActive
                    ? 'bg-sky-100 border-sky-500 text-sky-900 shadow-sm font-bold'
                    : isPassed
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-white border-slate-200 text-slate-400'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'animate-pulse text-sky-600' : isPassed ? 'text-emerald-600' : 'text-slate-400'}`} />
                <div className="truncate">
                  <div className="text-xs font-mono tracking-tight font-bold">{step.label}</div>
                  <div className="text-[10px] text-slate-500 truncate">{step.desc}</div>
                </div>
              </div>

              {idx < steps.length - 1 && (
                <div className={`h-[2px] w-4 mx-1 ${isPassed ? 'bg-emerald-400' : 'bg-slate-300'}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
