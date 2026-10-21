import React, { useState } from 'react';
import { X, MapPin, Waves, AlertTriangle, Wind, Flame, Rocket, Compass, Target } from 'lucide-react';
import { DisasterScenario } from '../types/ares';

interface IncidentLaunchWizardModalProps {
  onLaunchScenario: (cityName: string, disasterType: string, lat: number, lng: number) => void;
  onClose: () => void;
  isProcessing: boolean;
}

export const IncidentLaunchWizardModal: React.FC<IncidentLaunchWizardModalProps> = ({
  onLaunchScenario,
  onClose,
  isProcessing
}) => {
  const [selectedCity, setSelectedCity] = useState<string>("Delhi");
  const [disasterType, setDisasterType] = useState<string>("FLOOD");
  
  const [customCityName, setCustomCityName] = useState<string>("");
  const [customLat, setCustomLat] = useState<string>("28.6139");
  const [customLng, setCustomLng] = useState<string>("77.2090");
  const [useCustom, setUseCustom] = useState<boolean>(false);

  const cityPresets = [
    {
      name: "Delhi",
      subtitle: "Yamuna River Corridor & ISBT Sector",
      lat: 28.6139,
      lng: 77.2090,
      icon: "🏙️"
    },
    {
      name: "Mumbai",
      subtitle: "Mithi River & Coastal High Density Zone",
      lat: 19.0760,
      lng: 72.8777,
      icon: "🌊"
    },
    {
      name: "Kathmandu",
      subtitle: "Bagmati & Hanumante Basin Corridor",
      lat: 27.6750,
      lng: 85.3450,
      icon: "🏔️"
    },
    {
      name: "Kolkata",
      subtitle: "Hooghly River & Howrah Basin Sector",
      lat: 22.5726,
      lng: 88.3639,
      icon: "🌉"
    }
  ];

  const disasterTypes = [
    {
      type: "FLOOD",
      title: "Urban Flash Flood",
      desc: "River embankment breach, submerged roads & power grid",
      icon: Waves,
      color: "border-sky-500 bg-sky-50 text-sky-900"
    },
    {
      type: "EARTHQUAKE",
      title: "Seismic Strike",
      desc: "Structural building collapse, debris blocking mountain passes",
      icon: AlertTriangle,
      color: "border-amber-500 bg-amber-50 text-amber-900"
    },
    {
      type: "CYCLONE",
      title: "Coastal Cyclone / Surge",
      desc: "High velocity wind damage & seawater inundation",
      icon: Wind,
      color: "border-purple-500 bg-purple-50 text-purple-900"
    },
    {
      type: "WILDFIRE",
      title: "Terrain Wildfire",
      desc: "Uncontrolled bushfire threatening peri-urban settlements",
      icon: Flame,
      color: "border-red-500 bg-red-50 text-red-900"
    }
  ];

  const handleLaunch = () => {
    if (useCustom && customCityName) {
      onLaunchScenario(customCityName, disasterType, parseFloat(customLat) || 28.6139, parseFloat(customLng) || 77.2090);
    } else {
      const preset = cityPresets.find(c => c.name === selectedCity) || cityPresets[0];
      onLaunchScenario(preset.name, disasterType, preset.lat, preset.lng);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-300 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 font-mono">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-sky-100 text-sky-700 rounded-xl">
              <Rocket className="w-5 h-5 text-sky-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-wider">ARES INCIDENT LAUNCH WIZARD</h2>
              <p className="text-xs text-slate-500 font-sans font-medium">
                Select any city location & disaster type to generate a dynamic GIS emergency scenario
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: SELECT CITY LOCATION */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800 flex items-center space-x-1.5">
              <MapPin className="w-4 h-4 text-sky-600" />
              <span>STEP 1: SELECT TARGET METROPOLITAN CITY</span>
            </span>
            <button
              onClick={() => setUseCustom(!useCustom)}
              className="text-sky-600 hover:underline font-bold text-[11px]"
            >
              {useCustom ? "Use Preset Cities" : "+ Custom Map Coordinates"}
            </button>
          </div>

          {!useCustom ? (
            <div className="grid grid-cols-2 gap-2.5">
              {cityPresets.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setSelectedCity(c.name)}
                  className={`p-3 rounded-xl border text-left transition-all font-mono flex items-start space-x-3 ${
                    selectedCity === c.name
                      ? 'border-sky-600 bg-sky-50 shadow-md ring-2 ring-sky-300'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="text-2xl">{c.icon}</span>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-xs text-slate-900 flex items-center justify-between">
                      <span>{c.name}</span>
                      <span className="text-[10px] text-slate-400">{c.lat.toFixed(2)}°, {c.lng.toFixed(2)}°</span>
                    </div>
                    <div className="text-[10px] text-slate-500 truncate mt-0.5">{c.subtitle}</div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div>
                <label className="text-slate-600 font-bold block mb-1">City / Location Name:</label>
                <input
                  type="text"
                  placeholder="e.g. Jaipur, Bengaluru, Pokhara, Chicago"
                  value={customCityName}
                  onChange={(e) => setCustomCityName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 font-bold text-slate-900 focus:outline-sky-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-600 font-bold block mb-1">Latitude (°N):</label>
                  <input
                    type="text"
                    value={customLat}
                    onChange={(e) => setCustomLat(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-slate-600 font-bold block mb-1">Longitude (°E):</label>
                  <input
                    type="text"
                    value={customLng}
                    onChange={(e) => setCustomLng(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 font-bold text-slate-900"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* STEP 2: CHOOSE DISASTER TYPE */}
        <div className="space-y-3">
          <span className="font-bold text-slate-800 text-xs flex items-center space-x-1.5">
            <Compass className="w-4 h-4 text-amber-600" />
            <span>STEP 2: CHOOSE DISASTER DEMO TYPE</span>
          </span>

          <div className="grid grid-cols-2 gap-2.5">
            {disasterTypes.map((d) => {
              const Icon = d.icon;
              const isSelected = disasterType === d.type;
              return (
                <button
                  key={d.type}
                  onClick={() => setDisasterType(d.type)}
                  className={`p-3 rounded-xl border text-left transition-all font-mono flex items-start space-x-2.5 ${
                    isSelected
                      ? `${d.color} shadow-md ring-2 ring-sky-300`
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-xs text-slate-900">{d.title}</div>
                    <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{d.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Action */}
        <div className="pt-2 border-t border-slate-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs"
          >
            Cancel
          </button>
          <button
            onClick={handleLaunch}
            disabled={isProcessing}
            className="bg-sky-600 hover:bg-sky-700 text-white font-bold px-6 py-2.5 rounded-xl transition-all text-xs shadow-lg flex items-center space-x-2 cursor-pointer hover:scale-[1.02]"
          >
            <Rocket className="w-4 h-4" />
            <span>LAUNCH ARES RESPONSE ENGINE ➔</span>
          </button>
        </div>
      </div>
    </div>
  );
};
