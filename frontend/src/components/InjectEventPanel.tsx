import React, { useState } from 'react';
import { AlertOctagon, Waves, Home, Cross, Wrench, Zap, MapPin, Target, Ambulance, Shield } from 'lucide-react';
import { SimulationEvent, DisasterScenario, ResponseUnit, Facility, Zone } from '../types/ares';

interface InjectEventPanelProps {
  scenario: DisasterScenario;
  onInjectEvent: (event: SimulationEvent) => void;
  selectedCoordinates: { lat: number; lng: number } | null;
  onToggleTargetMode: (active: boolean) => void;
  isTargetModeActive: boolean;
  isProcessing: boolean;
}

export const InjectEventPanel: React.FC<InjectEventPanelProps> = ({
  scenario,
  onInjectEvent,
  selectedCoordinates,
  onToggleTargetMode,
  isTargetModeActive,
  isProcessing
}) => {
  const [selectedTargetId, setSelectedTargetId] = useState<string>("zone-a");

  // Determine current target Lat/Lng
  let targetLat = selectedCoordinates ? selectedCoordinates.lat : 27.6830;
  let targetLng = selectedCoordinates ? selectedCoordinates.lng : 85.3050;

  if (!selectedCoordinates && selectedTargetId) {
    const foundZone = scenario.zones.find(z => z.id === selectedTargetId);
    if (foundZone) {
      targetLat = foundZone.coordinates.x;
      targetLng = foundZone.coordinates.y;
    } else {
      const foundFac = scenario.facilities.find(f => f.id === selectedTargetId);
      if (foundFac) {
        targetLat = foundFac.coordinates.lat;
        targetLng = foundFac.coordinates.lng;
      }
    }
  }

  // Calculate Spatial Proximity (Haversine distance in client side for instant preview)
  const calculateHaversine = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371.0;
    const dlat = (lat2 - lat1) * Math.PI / 180;
    const dlon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dlat / 2) * Math.sin(dlat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dlon / 2) * Math.sin(dlon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
  };

  // Find Nearest Hospital
  const hospitals = scenario.facilities?.filter(f => f.type === 'hospital') || [];
  const hospitalsWithDist = hospitals.map(h => ({
    ...h,
    dist: parseFloat(calculateHaversine(targetLat, targetLng, h.coordinates.lat, h.coordinates.lng))
  })).sort((a, b) => a.dist - b.dist);

  const nearestHospital = hospitalsWithDist[0];

  // Count Nearest Ambulances within 10km radius & find closest unit
  const unitsWithDist = (scenario.units || []).map(u => ({
    ...u,
    dist: parseFloat(calculateHaversine(targetLat, targetLng, u.current_position.lat, u.current_position.lng))
  })).sort((a, b) => a.dist - b.dist);

  const nearbyAmbulances = unitsWithDist.filter(u => u.type === 'ambulance' && u.dist <= 10.0 && u.status !== 'blocked');
  const nearestUnit = unitsWithDist[0];

  const events = [
    {
      id: "evt-bridge-collapse",
      type: "BRIDGE_COLLAPSE",
      title: "Bridge / Road Collapse",
      description: `Landslide blocks highway at target location`,
      icon: AlertOctagon,
      color: "hover:bg-red-50 text-red-900 border-red-300"
    },
    {
      id: "evt-flood-rise",
      type: "FLOOD_LEVEL_RISE",
      title: "Flash Flood Surge",
      description: `Water surges +1.8m around target coordinates`,
      icon: Waves,
      color: "hover:bg-cyan-50 text-cyan-900 border-cyan-300"
    },
    {
      id: "evt-shelter-full",
      type: "SHELTER_FULL",
      title: "Shelter Full",
      description: `Target shelter reaches 100% occupancy`,
      icon: Home,
      color: "hover:bg-amber-50 text-amber-900 border-amber-300"
    },
    {
      id: "evt-hosp-offline",
      type: "HOSPITAL_OFFLINE",
      title: "Hospital Offline",
      description: `Nearest hospital power cutoff`,
      icon: Cross,
      color: "hover:bg-purple-50 text-purple-900 border-purple-300"
    },
    {
      id: "evt-unit-breakdown",
      type: "UNIT_BREAKDOWN",
      title: "Unit Breakdown",
      description: `Response Unit mechanical transmission failure`,
      icon: Wrench,
      color: "hover:bg-slate-100 text-slate-900 border-slate-300"
    }
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm font-mono space-y-3">
      {/* Header & Target Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center space-x-2">
          <Zap className="w-4 h-4 text-amber-600" />
          <h2 className="text-sm font-bold text-slate-900 tracking-wider">INJECT EVENT AT DISASTER LOCATION</h2>
        </div>

        {/* Location Selector Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Preset Location Dropdown */}
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1">
            <MapPin className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedCoordinates ? "custom" : selectedTargetId}
              onChange={(e) => {
                if (e.target.value !== "custom") {
                  setSelectedTargetId(e.target.value);
                  onToggleTargetMode(false);
                }
              }}
              disabled={isProcessing}
              className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer"
            >
              <optgroup label="Disaster Zones">
                {scenario.zones.map(z => (
                  <option key={z.id} value={z.id}>{z.name.split(' — ')[0]}</option>
                ))}
              </optgroup>
              <optgroup label="Emergency Facilities">
                {scenario.facilities.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </optgroup>
              {selectedCoordinates && (
                <option value="custom">🎯 Custom Map Target ({selectedCoordinates.lat.toFixed(3)}°N, {selectedCoordinates.lng.toFixed(3)}°E)</option>
              )}
            </select>
          </div>

          {/* Click Map Target Mode Button */}
          <button
            onClick={() => onToggleTargetMode(!isTargetModeActive)}
            className={`flex items-center space-x-1 px-3 py-1 rounded-lg border font-bold transition-colors ${
              isTargetModeActive
                ? 'bg-red-600 text-white border-red-700 animate-pulse shadow-sm'
                : selectedCoordinates
                ? 'bg-sky-100 text-sky-900 border-sky-300 font-bold'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>{isTargetModeActive ? 'CLICK MAP TO PIN DISASTER' : selectedCoordinates ? 'MAP PIN ACTIVE' : '🎯 CLICK MAP TARGET'}</span>
          </button>
        </div>
      </div>

      {/* Spatial Proximity HUD: Nearest Hospitals & Ambulance Counter */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        {/* Nearest Hospital */}
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-red-100 text-red-700 rounded-lg shrink-0">
            <Cross className="w-4 h-4 text-red-600" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] text-slate-500 font-bold">NEAREST HOSPITAL:</div>
            <div className="font-bold text-slate-900 truncate" title={nearestHospital ? nearestHospital.name : 'None'}>
              {nearestHospital ? nearestHospital.name : 'Kathmandu Trauma Center'}
            </div>
            <div className="text-[10px] text-sky-700 font-semibold">
              {nearestHospital ? `${nearestHospital.dist} km away` : '1.2 km'} • {nearestHospital ? `${nearestHospital.capacity - nearestHospital.current_occupancy} beds free` : '90 beds free'}
            </div>
          </div>
        </div>

        {/* Nearest Ambulances Count */}
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-amber-100 text-amber-700 rounded-lg shrink-0">
            <Ambulance className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-bold">AMBULANCES NEARBY (&lt;10km):</div>
            <div className="font-bold text-slate-900">
              {nearbyAmbulances.length} Active Ambulances
            </div>
            <div className="text-[10px] text-amber-700 font-semibold">
              Closest ETA: {nearbyAmbulances[0] ? `${Math.ceil((nearbyAmbulances[0].dist / 40) * 60)} mins (${nearbyAmbulances[0].dist} km)` : '4 mins'}
            </div>
          </div>
        </div>

        {/* Nearest Response Unit */}
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-sky-100 text-sky-700 rounded-lg shrink-0">
            <Shield className="w-4 h-4 text-sky-600" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] text-slate-500 font-bold">CLOSEST RESPONSE UNIT:</div>
            <div className="font-bold text-slate-900 truncate" title={nearestUnit ? nearestUnit.name : 'None'}>
              {nearestUnit ? nearestUnit.name : 'NDRF Rescue Alpha'}
            </div>
            <div className="text-[10px] text-emerald-700 font-semibold">
              {nearestUnit ? `${nearestUnit.dist} km • ${nearestUnit.status}` : '1.5 km • en route'}
            </div>
          </div>
        </div>
      </div>

      {/* Event Trigger Buttons Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5">
        {events.map((evt) => {
          const Icon = evt.icon;
          return (
            <button
              key={evt.id}
              disabled={isProcessing}
              onClick={() => onInjectEvent({
                id: `${evt.id}-${Date.now()}`,
                type: evt.type,
                title: `${evt.title} at (${targetLat.toFixed(3)}°N, ${targetLng.toFixed(3)}°E)`,
                description: evt.description,
                target_id: selectedTargetId,
                target_zone_id: selectedTargetId,
                coordinates: { lat: targetLat, lng: targetLng },
                scenario_id: "scenario-flood-01",
                timestamp: new Date().toISOString()
              })}
              className={`flex flex-col items-center justify-center p-3 rounded-lg border bg-slate-50 transition-all font-mono text-left group ${evt.color} ${
                isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-[1.02] shadow-sm'
              }`}
            >
              <Icon className="w-5 h-5 mb-1.5 transition-transform group-hover:scale-110 shrink-0" />
              <span className="text-xs font-bold text-center text-slate-900">{evt.title}</span>
              <span className="text-[10px] text-slate-500 text-center mt-1 line-clamp-1">{evt.description}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
