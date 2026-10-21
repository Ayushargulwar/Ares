'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { LifecycleBar } from '../components/LifecycleBar';
import { SituationPanel } from '../components/SituationPanel';
import { ResourcePanel } from '../components/ResourcePanel';
import { DisasterMap } from '../components/DisasterMap';
import { AllocationPanel } from '../components/AllocationPanel';
import { AgentActivity } from '../components/AgentActivity';
import { InjectEventPanel } from '../components/InjectEventPanel';
import { SimulationClock } from '../components/SimulationClock';
import { SidePanelInspector } from '../components/SidePanelInspector';
import { Toast } from '../components/Toast';
import { PlanDiffModal } from '../components/PlanDiffModal';
import { DecisionTraceModal } from '../components/DecisionTraceModal';
import { IncidentLaunchWizardModal } from '../components/IncidentLaunchWizardModal';
import { LiveAlerts } from '../components/LiveAlerts';
import { DisasterScenario, DecisionTrace, AgentWorkflowStatus, SimulationEvent, PlanDiff, ResponseUnit, Facility, Incident, Zone } from '../types/ares';

// Fallback Scenario Baseline for Instant UI Rendering (Zero Loading Freeze)
const FALLBACK_SCENARIO: DisasterScenario = {
  id: "scenario-delhi-01",
  title: "Delhi Monsoon Crisis — Yamuna River Basin",
  type: "FLOOD",
  description: "Extreme cloudburst over Delhi NCR triggered Yamuna embankment breach across ISBT, Lajpat, and Ring Road corridors.",
  status: "ACTIVE",
  plan_version: 1,
  priority_weights: { severity: 0.35, population: 0.25, urgency: 0.20, accessibility: 0.10, risk: 0.10 },
  human_approved: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  zones: [
    {
      id: "zone-delhi-1",
      name: "Yamuna River Corridor (ISBT Sector)",
      population_affected: 7500,
      severity: "CRITICAL",
      severity_score: 98.0,
      urgency: 95.0,
      accessibility: 70.0,
      risk_score: 92.0,
      risk_factors: ["Yamuna breach submerged squatter settlements", "Submerged power grid"],
      coordinates: { x: 28.6139, y: 77.2090 }
    },
    {
      id: "zone-delhi-2",
      name: "Lajpat & Ring Road Sector",
      population_affected: 4800,
      severity: "HIGH",
      severity_score: 82.0,
      urgency: 88.0,
      accessibility: 40.0,
      risk_score: 85.0,
      risk_factors: ["Severe waterlogging blocking traffic", "Bridge superstructure cracks"],
      coordinates: { x: 28.6000, y: 77.2200 }
    },
    {
      id: "zone-delhi-3",
      name: "Rohini & North Basin Sector",
      population_affected: 3100,
      severity: "MODERATE",
      severity_score: 65.0,
      urgency: 60.0,
      accessibility: 85.0,
      risk_score: 55.0,
      risk_factors: ["Inundation in market square"],
      coordinates: { x: 28.6300, y: 77.1900 }
    }
  ],
  resources: {
    rescue_teams: { id: "res-r", type: "rescue_teams", name: "Delhi NDRF Rescue Teams", total: 8, available: 8, assigned: 0, unit_label: "teams" },
    ambulances: { id: "res-a", type: "ambulances", name: "Emergency Ambulances", total: 5, available: 5, assigned: 0, unit_label: "units" },
    supply_units: { id: "res-s", type: "supply_units", name: "Ration Supply Units", total: 3, available: 3, assigned: 0, unit_label: "units" },
    shelter_capacity: { id: "res-sh", type: "shelter_capacity", name: "Relief Camp Shelter Beds", total: 1650, available: 1200, assigned: 450, unit_label: "beds" }
  },
  facilities: [
    { id: "hosp-delhi-1", name: "AIIMS Emergency Trauma Center", type: "hospital", capacity: 350, current_occupancy: 240, status: "active", coordinates: { lat: 28.6259, lng: 77.2040 } },
    { id: "hosp-delhi-2", name: "Safdarjung Field Hospital", type: "hospital", capacity: 250, current_occupancy: 170, status: "active", coordinates: { lat: 28.5989, lng: 77.1990 } },
    { id: "sh-delhi-1", name: "Yamuna Flood Relief Shelter", type: "shelter", capacity: 900, current_occupancy: 520, status: "active", coordinates: { lat: 28.6160, lng: 77.2270 } },
    { id: "sh-delhi-2", name: "Rajghat Community Camp", type: "shelter", capacity: 750, current_occupancy: 680, status: "active", coordinates: { lat: 28.6060, lng: 77.2390 } }
  ],
  units: [
    { id: "unit-rescue-1", name: "Delhi NDRF Rescue Alpha", type: "rescue_team", capacity: 15, speed: 45.0, terrain_access: ["road"], status: "en_route", current_position: { lat: 28.6339, lng: 77.1990 }, base_position: { lat: 28.6339, lng: 77.1990 }, target_name: "Yamuna River Corridor (ISBT Sector)", target_position: { lat: 28.6139, lng: 77.2090 }, planned_route: [{ lat: 28.6339, lng: 77.1990 }, { lat: 28.6239, lng: 77.2040 }, { lat: 28.6139, lng: 77.2090 }], eta_seconds: 360 },
    { id: "unit-boat-1", name: "Swift Water Boat 01", type: "boat", capacity: 20, speed: 30.0, terrain_access: ["water", "road"], status: "en_route", current_position: { lat: 28.6239, lng: 77.2010 }, base_position: { lat: 28.6239, lng: 77.2010 }, target_name: "Yamuna River Corridor (ISBT Sector)", target_position: { lat: 28.6139, lng: 77.2090 }, planned_route: [{ lat: 28.6239, lng: 77.2010 }, { lat: 28.6139, lng: 77.2090 }], eta_seconds: 240 },
    { id: "unit-ambulance-1", name: "MedVac Mobile 01", type: "ambulance", capacity: 4, speed: 60.0, terrain_access: ["road"], status: "en_route", current_position: { lat: 28.6119, lng: 77.2040 }, base_position: { lat: 28.6119, lng: 77.2040 }, target_name: "Lajpat & Ring Road Sector", target_position: { lat: 28.6000, lng: 77.2200 }, planned_route: [{ lat: 28.6119, lng: 77.2040 }, { lat: 28.6000, lng: 77.2200 }], eta_seconds: 480 },
    { id: "unit-heli-1", name: "Air Chopper Sky 1", type: "helicopter", capacity: 25, speed: 120.0, terrain_access: ["air"], status: "en_route", current_position: { lat: 28.6389, lng: 77.2190 }, base_position: { lat: 28.6389, lng: 77.2190 }, target_name: "Yamuna River Corridor (ISBT Sector)", target_position: { lat: 28.6139, lng: 77.2090 }, planned_route: [{ lat: 28.6389, lng: 77.2190 }, { lat: 28.6139, lng: 77.2090 }], eta_seconds: 150 }
  ],
  flood_polygons: [
    [{ lat: 28.6289, lng: 77.1840 }, { lat: 28.6339, lng: 77.2040 }, { lat: 28.6159, lng: 77.2140 }, { lat: 28.6089, lng: 77.1890 }]
  ],
  incidents: [
    { id: "inc-delhi-101", zone_id: "zone-delhi-1", title: "Yamuna River Embankment Collapse", description: "Water rising 4.2m above danger mark.", severity: "CRITICAL", status: "active", affected_people: 7500, coordinates: { lat: 28.6139, lng: 77.2090 }, timestamp: new Date().toISOString() }
  ]
};

export default function Dashboard() {
  // Initialize with FALLBACK_SCENARIO so UI renders instantly without stuck loading screen!
  const [scenario, setScenario] = useState<DisasterScenario>(FALLBACK_SCENARIO);
  const [trace, setTrace] = useState<DecisionTrace | null>(null);
  const [status, setStatus] = useState<AgentWorkflowStatus | null>(null);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>("zone-delhi-1");
  const [selectedInspectorItem, setSelectedInspectorItem] = useState<ResponseUnit | Facility | Incident | Zone | null>(null);

  // Custom Disaster Location Pin Coordinates
  const [selectedCoordinates, setSelectedCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [isTargetModeActive, setIsTargetModeActive] = useState<boolean>(false);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isReplanning, setIsReplanning] = useState<boolean>(false);
  
  // Simulation Clock State
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speed, setSpeed] = useState<number>(1);
  const [tick, setTick] = useState<number>(0);

  // Toast & Modals State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showDiffModal, setShowDiffModal] = useState<boolean>(false);
  const [showTraceModal, setShowTraceModal] = useState<boolean>(false);
  const [showWizardModal, setShowWizardModal] = useState<boolean>(false);
  const [latestDiff, setLatestDiff] = useState<PlanDiff | null>(null);

  // Simulation Clock Tick Loop
  useEffect(() => {
    if (!isPlaying) return;
    const intervalTime = 500 / speed;
    const timer = setInterval(() => {
      setTick(prev => prev + 1);
    }, intervalTime);
    return () => clearInterval(timer);
  }, [isPlaying, speed]);

  // Fetch initial scenario data
  const fetchScenarioData = async (scenarioId: string = "scenario-delhi-01") => {
    try {
      setIsProcessing(true);
      const res = await fetch(`/api/scenario/${scenarioId}`);
      if (res.ok) {
        const data = await res.json();
        setScenario(data);
        if (data.zones && data.zones.length > 0) {
          setSelectedZoneId(data.zones[0].id);
        }
        if (data.latest_diff) {
          setLatestDiff(data.latest_diff);
        }
      }

      // Fetch trace and status
      const traceRes = await fetch(`/api/scenario/${scenarioId}/decision-trace`);
      if (traceRes.ok) setTrace(await traceRes.json());

      const statusRes = await fetch(`/api/scenario/${scenarioId}/agent-status`);
      if (statusRes.ok) setStatus(await statusRes.json());
    } catch (err) {
      console.warn("Backend API connecting...", err);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    fetchScenarioData("scenario-delhi-01");
  }, []);

  const handleSelectScenario = async (id: string) => {
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/scenario/load/${id}`, { method: 'POST' });
      if (res.ok) {
        await fetchScenarioData(id);
      }
    } catch (err) {
      console.error("Error loading scenario:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Launch New City Scenario from Wizard (Step 1 + Step 2)
  const handleLaunchScenarioFromWizard = async (cityName: string, disasterType: string, lat: number, lng: number) => {
    setIsProcessing(true);
    setShowWizardModal(false);
    try {
      const res = await fetch(`/api/scenario/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city_name: cityName,
          disaster_type: disasterType,
          lat: lat,
          lng: lng
        })
      });

      if (res.ok) {
        const newScen = await res.json();
        setScenario(newScen);
        setSelectedCoordinates({ lat: lat, lng: lng });
        if (newScen.zones && newScen.zones.length > 0) {
          setSelectedZoneId(newScen.zones[0].id);
        }
        setToastMessage(`Launched ${cityName} ${disasterType} Crisis Scenario! Map centered at (${lat.toFixed(3)}°N, ${lng.toFixed(3)}°E).`);

        // Refresh trace & status
        const traceRes = await fetch(`/api/scenario/${newScen.id}/decision-trace`);
        if (traceRes.ok) setTrace(await traceRes.json());

        const statusRes = await fetch(`/api/scenario/${newScen.id}/agent-status`);
        if (statusRes.ok) setStatus(await statusRes.json());
      }
    } catch (err) {
      console.error("Failed to generate city scenario:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Map Click Handler to set custom disaster coordinates
  const handleSelectCoordinates = (coords: { lat: number; lng: number }) => {
    setSelectedCoordinates(coords);
    setIsTargetModeActive(false);
  };

  // Inject Event Callback with Spatial Coordinates and Proximity Analysis
  const handleInjectEvent = async (event: SimulationEvent) => {
    if (!scenario) return;
    setIsProcessing(true);
    setIsReplanning(true);

    try {
      const res = await fetch(`/events/inject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: event.type,
          target_id: event.target_id || event.target_zone_id,
          scenario_id: scenario.id,
          title: event.title,
          description: event.description,
          coordinates: event.coordinates || selectedCoordinates
        })
      });

      if (res.ok) {
        const data = await res.json();
        setScenario(data.scenario);
        setLatestDiff(data.diff);
        setToastMessage(data.toast_message || data.diff?.toast_message || `Plan v${data.scenario.plan_version} generated.`);
        setShowDiffModal(true);

        // Refresh trace & status
        const traceRes = await fetch(`/api/scenario/${scenario.id}/decision-trace`);
        if (traceRes.ok) setTrace(await traceRes.json());

        const statusRes = await fetch(`/api/scenario/${scenario.id}/agent-status`);
        if (statusRes.ok) setStatus(await statusRes.json());
      }
    } catch (err) {
      console.error("Event injection failed:", err);
    } finally {
      setIsProcessing(false);
      setIsReplanning(false);
    }
  };

  const handleApprovePlan = async () => {
    if (!scenario) return;
    try {
      const res = await fetch(`/api/scenario/${scenario.id}/approve`, { method: 'POST' });
      if (res.ok) {
        setScenario(prev => prev ? { ...prev, human_approved: true } : null);
      }
    } catch (err) {
      console.error("Approve plan error:", err);
    }
  };

  const handleResetScenario = () => {
    if (scenario) {
      handleSelectScenario(scenario.id);
      setSelectedCoordinates(null);
      setTick(0);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans relative">
      {/* Toast Notification */}
      <Toast
        message={toastMessage}
        onClose={() => setToastMessage(null)}
      />

      {/* Header */}
      <Header
        scenario={scenario}
        onSelectScenario={handleSelectScenario}
        onOpenWizard={() => setShowWizardModal(true)}
        onApprove={handleApprovePlan}
        onReset={handleResetScenario}
        isProcessing={isProcessing}
      />

      {/* 6-Step Lifecycle Bar */}
      <LifecycleBar
        currentStage={status?.current_stage || "MONITOR"}
        isReplanning={isReplanning}
      />

      {/* Main Dashboard Layout */}
      <main className="flex-1 p-4 md:p-6 space-y-4 max-w-[1600px] w-full mx-auto">
        {/* Top Bar: Resource Inventory & Simulation Clock Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <ResourcePanel
              resources={scenario.resources}
              activePlan={scenario.active_plan}
            />
          </div>
          <div className="shrink-0 flex items-center space-x-2">
            <SimulationClock
              isPlaying={isPlaying}
              onTogglePlay={() => setIsPlaying(!isPlaying)}
              speed={speed}
              onSelectSpeed={setSpeed}
              onResetClock={() => setTick(0)}
              tick={tick}
            />
          </div>
        </div>

        {/* Center Grid: Left (Situation) | Center (Disaster Map) | Right (Allocation & Agents) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Panel: Situation Overview (3 Cols) */}
          <div className="lg:col-span-3 h-[480px]">
            <SituationPanel
              zones={scenario.zones}
              selectedZoneId={selectedZoneId}
              onSelectZone={setSelectedZoneId}
            />
          </div>

          {/* Center Panel: Interactive Live Leaflet Satellite Disaster Map (5 Cols) */}
          <div className="lg:col-span-5 h-[480px] relative">
            <DisasterMap
              scenario={scenario}
              activePlan={scenario.active_plan}
              selectedZoneId={selectedZoneId}
              onSelectZone={setSelectedZoneId}
              onSelectItem={(item) => setSelectedInspectorItem(item as any)}
              selectedCoordinates={selectedCoordinates}
              onSelectCoordinates={handleSelectCoordinates}
              isTargetModeActive={isTargetModeActive}
              tick={tick}
            />

            {/* Side Panel Inspector Overlay when item selected */}
            <SidePanelInspector
              selectedItem={selectedInspectorItem as any}
              onClose={() => setSelectedInspectorItem(null)}
            />
          </div>

          {/* Right Panel: AI Recommended Allocation & Live Agent Activity (4 Cols) */}
          <div className="lg:col-span-4 grid grid-rows-2 gap-4 h-[480px]">
            <div className="h-full">
              <AllocationPanel
                plan={scenario.active_plan || null}
                zones={scenario.zones}
                onOpenDecisionTrace={() => setShowTraceModal(true)}
                onOpenDiffModal={() => setShowDiffModal(true)}
                hasDiff={!!latestDiff}
              />
            </div>
            <div className="h-full">
              <AgentActivity
                status={status}
                isReplanning={isReplanning}
                replanMessage={latestDiff?.event.title}
              />
            </div>
          </div>
        </div>

        {/* Bottom Section: Location-Aware Inject Event Panel */}
        <InjectEventPanel
          scenario={scenario}
          onInjectEvent={handleInjectEvent}
          selectedCoordinates={selectedCoordinates}
          onToggleTargetMode={setIsTargetModeActive}
          isTargetModeActive={isTargetModeActive}
          isProcessing={isProcessing}
        />
      </main>

      {/* Live Alerts Footer */}
      <LiveAlerts
        incidents={scenario.incidents}
        latestDiffAlert={latestDiff ? `PLAN v${scenario.plan_version || 2} EFFECTED: ${latestDiff.event.title || latestDiff.event.type}` : null}
      />

      {/* Modals */}
      {showWizardModal && (
        <IncidentLaunchWizardModal
          onLaunchScenario={handleLaunchScenarioFromWizard}
          onClose={() => setShowWizardModal(false)}
          isProcessing={isProcessing}
        />
      )}

      {showDiffModal && (
        <PlanDiffModal
          diff={latestDiff}
          onClose={() => setShowDiffModal(false)}
        />
      )}

      {showTraceModal && (
        <DecisionTraceModal
          trace={trace}
          onClose={() => setShowTraceModal(false)}
        />
      )}
    </div>
  );
}
