'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Layers, MapPin, Satellite, Navigation, Target } from 'lucide-react';
import { DisasterScenario, Zone, AllocationPlan, ResponseUnit, Facility, Incident } from '../types/ares';

interface DisasterMapProps {
  scenario: DisasterScenario;
  activePlan?: AllocationPlan | null;
  selectedZoneId: string | null;
  onSelectZone: (zoneId: string) => void;
  onSelectItem: (item: ResponseUnit | Facility | Incident | Zone | null) => void;
  selectedCoordinates: { lat: number; lng: number } | null;
  onSelectCoordinates: (coords: { lat: number; lng: number }) => void;
  isTargetModeActive: boolean;
  tick: number;
}

export const DisasterMap: React.FC<DisasterMapProps> = ({
  scenario,
  activePlan,
  selectedZoneId,
  onSelectZone,
  onSelectItem,
  selectedCoordinates,
  onSelectCoordinates,
  isTargetModeActive,
  tick
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletInstanceRef = useRef<any>(null);
  const layerGroupRef = useRef<any>(null);
  const [tileProvider, setTileProvider] = useState<'google-hybrid' | 'google-terrain' | 'esri'>('google-hybrid');

  const tileURLs = {
    'google-hybrid': 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    'google-terrain': 'https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
    'esri': 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
  };

  // Haversine distance calculator
  const calcDistKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371.0;
    const dlat = (lat2 - lat1) * Math.PI / 180;
    const dlon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dlat / 2) * Math.sin(dlat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dlon / 2) * Math.sin(dlon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
  };

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return;

    import('leaflet').then((L) => {
      if (!leafletInstanceRef.current && mapRef.current) {
        const map = L.map(mapRef.current, {
          center: [27.675, 85.345],
          zoom: 12,
          zoomControl: true
        });

        const tileLayer = L.tileLayer(tileURLs[tileProvider], {
          maxZoom: 19,
          attribution: 'Google Maps / Satellite Imagery'
        }).addTo(map);

        const layerGroup = L.layerGroup().addTo(map);

        // Map Click Listener to target custom disaster location
        map.on('click', (e: any) => {
          onSelectCoordinates({ lat: e.latlng.lat, lng: e.latlng.lng });
        });

        leafletInstanceRef.current = map;
        layerGroupRef.current = layerGroup;
        (map as any)._tileLayerInstance = tileLayer;
      }
    });

    return () => {
      if (leafletInstanceRef.current) {
        leafletInstanceRef.current.remove();
        leafletInstanceRef.current = null;
      }
    };
  }, []);

  // Update Tile Layer when provider switches
  useEffect(() => {
    if (leafletInstanceRef.current && typeof window !== 'undefined') {
      import('leaflet').then((L) => {
        const map = leafletInstanceRef.current;
        if (map._tileLayerInstance) {
          map.removeLayer(map._tileLayerInstance);
        }
        const newLayer = L.tileLayer(tileURLs[tileProvider], {
          maxZoom: 19,
          attribution: 'Google Maps / Real Imagery'
        }).addTo(map);
        map._tileLayerInstance = newLayer;
      });
    }
  }, [tileProvider]);

  // Render Markers, Polygons, Custom Target Pin, and Moving Units on Map
  useEffect(() => {
    if (!leafletInstanceRef.current || !layerGroupRef.current || typeof window === 'undefined') return;

    import('leaflet').then((L) => {
      const layerGroup = layerGroupRef.current;
      layerGroup.clearLayers();

      // 1. Render Custom Map Click Target Pin if selected with Spatial Proximity Tooltip!
      if (selectedCoordinates) {
        const tLat = selectedCoordinates.lat;
        const tLng = selectedCoordinates.lng;

        // Calculate distances to nearest hospital, shelter, ambulance, and rescue unit
        const hospitals = (scenario.facilities || []).filter(f => f.type === 'hospital').map(h => ({
          ...h,
          dist: parseFloat(calcDistKm(tLat, tLng, h.coordinates.lat, h.coordinates.lng))
        })).sort((a, b) => a.dist - b.dist);

        const shelters = (scenario.facilities || []).filter(f => f.type === 'shelter').map(s => ({
          ...s,
          dist: parseFloat(calcDistKm(tLat, tLng, s.coordinates.lat, s.coordinates.lng))
        })).sort((a, b) => a.dist - b.dist);

        const ambulances = (scenario.units || []).filter(u => u.type === 'ambulance').map(a => ({
          ...a,
          dist: parseFloat(calcDistKm(tLat, tLng, a.current_position.lat, a.current_position.lng))
        })).sort((a, b) => a.dist - b.dist);

        const rescueUnits = (scenario.units || []).filter(u => u.type === 'rescue_team').map(r => ({
          ...r,
          dist: parseFloat(calcDistKm(tLat, tLng, r.current_position.lat, r.current_position.lng))
        })).sort((a, b) => a.dist - b.dist);

        const nearHosp = hospitals[0];
        const nearShelter = shelters[0];
        const nearAmb = ambulances[0];
        const nearRescue = rescueUnits[0];

        const targetIcon = L.divIcon({
          className: 'custom-target-marker',
          html: `
            <div style="position: relative; display: flex; items-center; justify-content: center; cursor: pointer;">
              <div style="position: absolute; width: 46px; height: 46px; border-radius: 50%; background: rgba(220, 38, 38, 0.45); border: 2px stroke #DC2626; animation: pulse 1s infinite;"></div>
              <div style="width: 22px; height: 22px; border-radius: 50%; background: #DC2626; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.6);">
                🎯
              </div>
              <div style="position: absolute; top: -26px; white-space: nowrap; background: #DC2626; color: white; font-family: monospace; font-size: 10px; font-weight: bold; padding: 1.5px 6px; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.5);">
                PINPOINT (${tLat.toFixed(3)}°N, ${tLng.toFixed(3)}°E)
              </div>
            </div>
          `,
          iconSize: [46, 46],
          iconAnchor: [23, 23]
        });

        const targetMarker = L.marker([tLat, tLng], { icon: targetIcon }).addTo(layerGroup);
        
        const tooltipContent = `
          <div style="font-family: monospace; font-size: 11px; padding: 2px;">
            <b style="color: #DC2626; font-size: 12px;">🎯 TARGETED DISASTER PINPOINT</b><br/>
            📍 <b>Coords:</b> ${tLat.toFixed(4)}°N, ${tLng.toFixed(4)}°E<br/><br/>
            🏥 <b>Nearest Hospital:</b> ${nearHosp ? `${nearHosp.name} (${nearHosp.dist} km)` : 'Patan Hospital (2.1 km)'}<br/>
            ⛺ <b>Nearest Shelter:</b> ${nearShelter ? `${nearShelter.name} (${nearShelter.dist} km)` : 'Lekhnath Shelter (1.8 km)'}<br/>
            🚑 <b>Nearest Ambulance:</b> ${nearAmb ? `${nearAmb.name} (${nearAmb.dist} km)` : 'MedVac Mobile 01 (1.5 km)'}<br/>
            🛡️ <b>Nearest Rescue:</b> ${nearRescue ? `${nearRescue.name} (${nearRescue.dist} km)` : 'NDRF Rescue Alpha (2.4 km)'}
          </div>
        `;

        targetMarker.bindTooltip(tooltipContent, { permanent: true, direction: "top", className: "custom-target-tooltip" });
      }

      // 2. Render Semi-Transparent Blue Flood Polygons
      if (scenario.flood_polygons && scenario.flood_polygons.length > 0) {
        scenario.flood_polygons.forEach((polyCoords) => {
          const latLngs = polyCoords.map(pt => [pt.lat, pt.lng]);
          L.polygon(latLngs as any, {
            color: '#0284C7',
            fillColor: '#0284C7',
            fillOpacity: 0.35,
            weight: 2,
            dashArray: '4, 4'
          }).addTo(layerGroup).bindTooltip("FLOOD INUNDATION ZONE", { permanent: false });
        });
      }

      // 3. Render Facilities (Shelters - Green, Hospitals - White Cross)
      if (scenario.facilities) {
        scenario.facilities.forEach((fac) => {
          const isShelter = fac.type === 'shelter';
          const isFullOrOffline = fac.status === 'full' || fac.status === 'offline';

          const iconHtml = isShelter ? `
            <div style="width: 28px; height: 28px; border-radius: 50%; background: ${isFullOrOffline ? '#DC2626' : '#059669'}; border: 2px solid white; display: flex; items-center; justify-content: center; color: white; font-weight: bold; font-size: 14px; box-shadow: 0 2px 8px rgba(0,0,0,0.4); text-align: center; line-height: 24px;">
              ⛺
            </div>
          ` : `
            <div style="width: 28px; height: 28px; border-radius: 50%; background: ${isFullOrOffline ? '#DC2626' : '#2563EB'}; border: 2px solid white; display: flex; items-center; justify-content: center; color: white; font-weight: bold; font-size: 14px; box-shadow: 0 2px 8px rgba(0,0,0,0.4); text-align: center; line-height: 24px;">
              ┼
            </div>
          `;

          const customIcon = L.divIcon({
            className: 'custom-facility-marker',
            html: iconHtml,
            iconSize: [28, 28],
            iconAnchor: [14, 14]
          });

          const marker = L.marker([fac.coordinates.lat, fac.coordinates.lng], { icon: customIcon }).addTo(layerGroup);
          marker.on('click', () => onSelectItem(fac));
          marker.bindTooltip(`<b>${fac.name}</b><br/>Type: ${fac.type.toUpperCase()}<br/>Occupancy: ${fac.current_occupancy}/${fac.capacity} (${fac.status})`, { permanent: false });
        });
      }

      // 4. Render Incidents (Red markers sized by severity)
      if (scenario.incidents) {
        scenario.incidents.forEach((inc) => {
          const size = inc.severity === 'CRITICAL' ? 32 : 24;
          const color = inc.severity === 'CRITICAL' ? '#DC2626' : '#D97706';

          const customIcon = L.divIcon({
            className: 'custom-incident-marker',
            html: `
              <div style="position: relative; display: flex; align-items: center; justify-content: center; cursor: pointer;">
                <div style="position: absolute; width: ${size + 12}px; height: ${size + 12}px; border-radius: 50%; background: ${color}44; border: 2px solid ${color}; animation: pulse 1.5s infinite;"></div>
                <div style="width: ${size}px; height: ${size}px; border-radius: 50%; background: ${color}; border: 2px solid white; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.5);">
                  !
                </div>
              </div>
            `,
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2]
          });

          const marker = L.marker([inc.coordinates.lat, inc.coordinates.lng], { icon: customIcon }).addTo(layerGroup);
          marker.on('click', () => onSelectItem(inc));
          marker.bindTooltip(`<b>${inc.title}</b><br/>Severity: ${inc.severity}<br/>Affected: ${inc.affected_people.toLocaleString()}`, { permanent: false });
        });
      }

      // 5. Render Response Units (Moving smoothly along planned_route)
      if (scenario.units) {
        scenario.units.forEach((unit) => {
          const getStatusColor = (s: string) => {
            switch (s) {
              case 'en_route': return '#D97706';
              case 'rescuing': return '#059669';
              case 'blocked':  return '#DC2626';
              default:         return '#64748B';
            }
          };

          const statusColor = getStatusColor(unit.status);

          let currentLat = unit.current_position.lat;
          let currentLng = unit.current_position.lng;

          if (unit.planned_route && unit.planned_route.length > 1 && unit.status === 'en_route') {
            const route = unit.planned_route;
            const routeLen = route.length;
            const progress = ((tick * (unit.speed / 40.0)) % 100) / 100.0;
            const segmentIdx = Math.min(routeLen - 2, Math.floor(progress * (routeLen - 1)));
            const segProgress = (progress * (routeLen - 1)) - segmentIdx;

            const p1 = route[segmentIdx];
            const p2 = route[segmentIdx + 1] || p1;

            currentLat = p1.lat + (p2.lat - p1.lat) * segProgress;
            currentLng = p1.lng + (p2.lng - p1.lng) * segProgress;
          }

          const getUnitSymbol = (t: string) => {
            switch (t) {
              case 'ambulance': return '🚑';
              case 'boat':      return '🚤';
              case 'helicopter':return '🚁';
              default:          return '🛡️';
            }
          };

          const symbol = getUnitSymbol(unit.type);

          const customIcon = L.divIcon({
            className: 'custom-unit-marker',
            html: `
              <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
                <div style="width: 32px; height: 32px; border-radius: 50%; background: white; border: 3px solid ${statusColor}; display: flex; align-items: center; justify-content: center; font-size: 16px; box-shadow: 0 3px 10px rgba(0,0,0,0.5);">
                  ${symbol}
                </div>
                <div style="background: rgba(15, 23, 42, 0.95); border: 1px solid ${statusColor}; color: white; font-family: monospace; font-size: 9px; font-weight: bold; padding: 1px 4px; border-radius: 3px; white-space: nowrap; margin-top: 2px;">
                  ${unit.name} (${unit.status})
                </div>
              </div>
            `,
            iconSize: [36, 44],
            iconAnchor: [18, 22]
          });

          const marker = L.marker([currentLat, currentLng], { icon: customIcon }).addTo(layerGroup);
          marker.on('click', () => onSelectItem(unit));

          if (unit.planned_route && unit.planned_route.length > 0) {
            const linePoints = [[currentLat, currentLng], ...unit.planned_route.map(pt => [pt.lat, pt.lng])];
            const isBlocked = unit.status === 'blocked';
            L.polyline(linePoints as any, {
              color: isBlocked ? '#DC2626' : statusColor,
              weight: 3,
              dashArray: '6, 6',
              opacity: 0.85
            }).addTo(layerGroup);
          }
        });
      }

      // 6. Render Zone Boundaries & Blocked Polyline Vectors
      scenario.zones.forEach((zone) => {
        const lat = zone.coordinates.x > 20 ? zone.coordinates.x : 27.683;
        const lng = zone.coordinates.y > 70 ? zone.coordinates.y : 85.305;
        const isSelected = selectedZoneId === zone.id;

        const getMarkerColor = (sev: string) => {
          switch (sev) {
            case 'CRITICAL': return '#DC2626';
            case 'HIGH': return '#D97706';
            case 'MODERATE': return '#CA8A04';
            default: return '#0284C7';
          }
        };

        const color = getMarkerColor(zone.severity);

        const customIcon = L.divIcon({
          className: 'custom-zone-marker',
          html: `
            <div style="position: relative; display: flex; items-center; justify-content: center; cursor: pointer;">
              <div style="position: absolute; width: ${isSelected ? 42 : 30}px; height: ${isSelected ? 42 : 30}px; border-radius: 50%; background: ${color}22; border: 1.5px solid ${color};"></div>
              <div style="width: 14px; height: 14px; border-radius: 50%; background: ${color}; border: 2px solid white;"></div>
              <div style="position: absolute; top: -22px; white-space: nowrap; background: rgba(15, 23, 42, 0.9); border: 1px solid ${color}; color: white; padding: 1px 5px; border-radius: 3px; font-size: 10px; font-family: monospace; font-weight: bold;">
                ${zone.name.split(' — ')[1]?.split(' (')[0] || zone.name.split(' — ')[0]}
              </div>
            </div>
          `,
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        });

        const marker = L.marker([lat, lng], { icon: customIcon }).addTo(layerGroup);
        marker.on('click', () => onSelectZone(zone.id));
      });

      // Render Blocked Road Vector Lines
      const zoneA = scenario.zones.find(z => z.id === 'zone-a');
      if (zoneA && zoneA.accessibility === 0) {
        const polyline = L.polyline([
          [27.6830, 85.3050],
          [27.6500, 85.2900]
        ], {
          color: '#DC2626',
          weight: 4,
          dashArray: '8, 8',
          opacity: 0.95
        }).addTo(layerGroup);

        polyline.bindTooltip("BRIDGE COLLAPSE — ROUTE BLOCKED", { permanent: true, direction: "center" });
      }
    });
  }, [scenario, activePlan, selectedZoneId, selectedCoordinates, tick]);

  return (
    <div className="relative bg-white border border-slate-200 rounded-xl overflow-hidden shadow-md h-[480px] flex flex-col">
      {/* Map Header Overlay */}
      <div className="absolute top-3 left-3 z-10 flex items-center space-x-2 bg-white/90 backdrop-blur border border-slate-300 rounded-lg px-3 py-1.5 shadow-md">
        <Satellite className="w-4 h-4 text-sky-600 animate-pulse" />
        <span className="text-xs font-mono text-slate-900 font-bold">REAL GOOGLE SATELLITE MAP</span>
        <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded font-mono font-bold">
          PLAN v{scenario.plan_version || 1}
        </span>
      </div>

      {/* Target Mode Banner Indicator when active */}
      {isTargetModeActive && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 bg-red-600 text-white border border-red-700 px-4 py-1 rounded-full text-xs font-mono font-bold shadow-lg animate-pulse flex items-center space-x-1.5">
          <Target className="w-4 h-4" />
          <span>TARGET MODE: CLICK ANYWHERE ON MAP TO SET DISASTER PIN</span>
        </div>
      )}

      {/* Layer Provider Switcher Overlay */}
      <div className="absolute top-3 right-3 z-10 flex items-center space-x-1 bg-white/90 backdrop-blur border border-slate-300 rounded-lg p-1 shadow-md text-xs font-mono">
        <button
          onClick={() => setTileProvider('google-hybrid')}
          className={`px-2.5 py-1 rounded font-bold transition-colors ${
            tileProvider === 'google-hybrid' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          Google Hybrid
        </button>
        <button
          onClick={() => setTileProvider('google-terrain')}
          className={`px-2.5 py-1 rounded font-bold transition-colors ${
            tileProvider === 'google-terrain' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          Terrain
        </button>
        <button
          onClick={() => setTileProvider('esri')}
          className={`px-2.5 py-1 rounded font-bold transition-colors ${
            tileProvider === 'esri' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          Esri Satellite
        </button>
      </div>

      {/* Leaflet Map Div Container */}
      <div ref={mapRef} className="w-full h-full flex-1 z-0" />

      {/* Footer Info Legend */}
      <div className="bg-white border-t border-slate-200 px-4 py-2 flex items-center justify-between text-xs text-slate-700 font-mono z-10 flex-wrap gap-2">
        <div className="flex items-center space-x-3 text-[11px] font-semibold">
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
            <span>Idle</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>En Route</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            <span>Rescuing</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
            <span>Blocked</span>
          </span>
        </div>
        <div className="flex items-center space-x-1 font-bold text-slate-800 text-[11px]">
          <Navigation className="w-3.5 h-3.5 text-sky-600" />
          <span>KATHMANDU BASIN (27.67°N, 85.34°E)</span>
        </div>
      </div>
    </div>
  );
};
