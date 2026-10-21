import React from 'react';
import { X, Navigation, Shield, Truck, Ship, Wind, Home, Cross, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { ResponseUnit, Facility, Incident } from '../types/ares';

interface SidePanelInspectorProps {
  selectedItem: ResponseUnit | Facility | Incident | null;
  onClose: () => void;
}

export const SidePanelInspector: React.FC<SidePanelInspectorProps> = ({ selectedItem, onClose }) => {
  if (!selectedItem) return null;

  // Type Guards
  const isUnit = 'speed' in selectedItem;
  const isFacility = 'capacity' in selectedItem && !('speed' in selectedItem);
  const isIncident = 'affected_people' in selectedItem;

  const unit = isUnit ? (selectedItem as ResponseUnit) : null;
  const facility = isFacility ? (selectedItem as Facility) : null;
  const incident = isIncident ? (selectedItem as Incident) : null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'en_route':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'rescuing':
      case 'active':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'blocked':
      case 'offline':
      case 'full':
        return 'bg-red-100 text-red-900 border-red-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const getUnitIcon = (type: string) => {
    switch (type) {
      case 'boat':
        return <Ship className="w-5 h-5 text-sky-600" />;
      case 'helicopter':
        return <Wind className="w-5 h-5 text-purple-600" />;
      case 'ambulance':
        return <Truck className="w-5 h-5 text-amber-600" />;
      default:
        return <Shield className="w-5 h-5 text-sky-600" />;
    }
  };

  return (
    <div className="absolute top-14 right-3 z-30 w-80 bg-white/95 backdrop-blur border border-slate-300 rounded-xl shadow-2xl p-4 animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center space-x-2.5">
          {unit && getUnitIcon(unit.type)}
          {facility && (facility.type === 'shelter' ? <Home className="w-5 h-5 text-emerald-600" /> : <Cross className="w-5 h-5 text-red-600" />)}
          {incident && <AlertCircle className="w-5 h-5 text-red-600" />}

          <div>
            <h3 className="text-xs font-mono font-bold text-slate-900 leading-tight">
              {selectedItem.name || (incident ? incident.title : 'Selected Entity')}
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">
              ID: {selectedItem.id}
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body Details */}
      <div className="mt-3 space-y-3 font-mono text-xs text-slate-800">
        {/* Status Badge */}
        <div className="flex items-center justify-between">
          <span className="text-slate-500 text-[11px] font-semibold">STATUS:</span>
          <span className={`px-2 py-0.5 rounded text-[11px] font-bold border uppercase ${getStatusBadge(unit ? unit.status : (facility ? facility.status : (incident ? incident.status : 'active')))}`}>
            {unit ? unit.status.replace('_', ' ') : (facility ? facility.status : (incident ? incident.status : 'active'))}
          </span>
        </div>

        {/* Response Unit Specific Information */}
        {unit && (
          <>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-[11px]">ASSIGNED TARGET:</span>
                <span className="font-bold text-slate-900 text-right truncate max-w-[130px]" title={unit.target_name || 'Unassigned'}>
                  {unit.target_name || 'Unassigned'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-[11px]">ESTIMATED ETA:</span>
                <span className="font-bold text-sky-700 flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{Math.ceil(unit.eta_seconds / 60)} mins</span>
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-[11px]">CAPACITY:</span>
                <span className="font-bold text-slate-900">{unit.capacity} personnel</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-[11px]">MAX SPEED:</span>
                <span className="font-bold text-slate-900">{unit.speed} km/h</span>
              </div>
            </div>

            <div>
              <span className="text-slate-500 text-[10px] font-semibold">TERRAIN ACCESS MODES:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {unit.terrain_access.map((t, idx) => (
                  <span key={idx} className="bg-sky-50 text-sky-800 border border-sky-300 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Facility Specific Information */}
        {facility && (
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-[11px]">FACILITY TYPE:</span>
              <span className="font-bold text-slate-900 uppercase">{facility.type}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-[11px]">OCCUPANCY:</span>
              <span className="font-bold text-slate-900">
                {facility.current_occupancy} / {facility.capacity}
              </span>
            </div>

            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-1">
              <div
                className={`h-full ${facility.current_occupancy >= facility.capacity ? 'bg-red-500' : 'bg-emerald-500'}`}
                style={{ width: `${Math.min(100, (facility.current_occupancy / facility.capacity) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Incident Specific Information */}
        {incident && (
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-[11px]">SEVERITY:</span>
              <span className="font-bold text-red-600 uppercase">{incident.severity}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-[11px]">AFFECTED PEOPLE:</span>
              <span className="font-bold text-slate-900">{incident.affected_people.toLocaleString()}</span>
            </div>

            <p className="text-[11px] text-slate-600 italic border-t border-slate-200 pt-1.5 mt-1.5 font-sans">
              "{incident.description}"
            </p>
          </div>
        )}

        {/* GPS Coordinates */}
        <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-500 flex items-center justify-between">
          <span className="flex items-center space-x-1">
            <Navigation className="w-3 h-3 text-slate-400" />
            <span>COORDINATES:</span>
          </span>
          <span className="font-bold text-slate-800">
            {unit ? `${unit.current_position.lat.toFixed(4)}°N, ${unit.current_position.lng.toFixed(4)}°E` : (facility ? `${facility.coordinates.lat.toFixed(4)}°N, ${facility.coordinates.lng.toFixed(4)}°E` : `${incident?.coordinates.lat.toFixed(4)}°N, ${incident?.coordinates.lng.toFixed(4)}°E`)}
          </span>
        </div>
      </div>
    </div>
  );
};
