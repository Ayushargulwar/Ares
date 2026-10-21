import React from 'react';
import { Play, Pause, RotateCcw, Clock, FastForward } from 'lucide-react';

interface SimulationClockProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  speed: number;
  onSelectSpeed: (speed: number) => void;
  onResetClock: () => void;
  tick: number;
}

export const SimulationClock: React.FC<SimulationClockProps> = ({
  isPlaying,
  onTogglePlay,
  speed,
  onSelectSpeed,
  onResetClock,
  tick
}) => {
  // Format tick seconds into HH:MM:SS
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 flex items-center space-x-3 shadow-sm font-mono text-xs">
      <div className="flex items-center space-x-1.5 text-slate-700 font-bold">
        <Clock className="w-4 h-4 text-sky-600" />
        <span>SIM CLOCK:</span>
        <span className="text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-bold">
          {formatTime(tick * 5)}
        </span>
      </div>

      {/* Play / Pause Toggle */}
      <button
        onClick={onTogglePlay}
        className={`flex items-center space-x-1 px-2.5 py-1 rounded font-bold transition-colors ${
          isPlaying ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
        }`}
      >
        {isPlaying ? (
          <>
            <Pause className="w-3.5 h-3.5 text-amber-700" />
            <span>PAUSE</span>
          </>
        ) : (
          <>
            <Play className="w-3.5 h-3.5 text-emerald-700" />
            <span>PLAY</span>
          </>
        )}
      </button>

      {/* Speed Controls */}
      <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded border border-slate-200">
        {[1, 2, 5].map((s) => (
          <button
            key={s}
            onClick={() => onSelectSpeed(s)}
            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
              speed === s ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {s}x
          </button>
        ))}
      </div>

      {/* Reset Clock */}
      <button
        onClick={onResetClock}
        className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
        title="Reset Clock"
      >
        <RotateCcw className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
