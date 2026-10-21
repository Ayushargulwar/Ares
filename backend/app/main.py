import sys
import os

# Ensure backend root directory is in sys.path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any, List
from datetime import datetime

from app.models.schemas import (
    DisasterScenario, AllocationPlan, DecisionTrace, AgentWorkflowStatus,
    SimulationEvent, PlanDiff, EventType, DisasterType
)
from app.state.manager import get_state_manager
from app.scenarios.presets import PRESET_SCENARIOS, get_nepal_flood_scenario
from app.scenarios.procedural import generate_procedural_scenario, CITY_PRESETS
from app.engine.proximity import calculate_nearest_resources

app = FastAPI(
    title="ARES — Autonomous Disaster Response & Resource Allocation Engine",
    description="Agentic Decision-Support Platform for Dynamic Disaster Response",
    version="1.0.0"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

state_mgr = get_state_manager()

@app.get("/")
def read_root():
    return {
        "status": "ONLINE",
        "system": "ARES Engine Core",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/scenarios", response_model=List[Dict[str, Any]])
def list_preset_scenarios():
    return [
        {"id": "scenario-flood-01", "title": "Kathmandu — Bagmati Flood Crisis", "type": "FLOOD", "city": "Kathmandu", "lat": 27.675, "lng": 85.345},
        {"id": "scenario-delhi-01", "title": "Delhi — Yamuna Basin Breach", "type": "FLOOD", "city": "Delhi", "lat": 28.6139, "lng": 77.2090},
        {"id": "scenario-mumbai-01", "title": "Mumbai — Coastal Storm Surge", "type": "CYCLONE", "city": "Mumbai", "lat": 19.0760, "lng": 72.8777},
        {"id": "scenario-kolkata-01", "title": "Kolkata — Hooghly Inundation", "type": "FLOOD", "city": "Kolkata", "lat": 22.5726, "lng": 88.3639}
    ]

@app.post("/api/scenario/generate", response_model=DisasterScenario)
def generate_city_scenario(payload: Dict[str, Any] = Body(...)):
    city_name = payload.get("city_name") or "Delhi"
    disaster_type_str = payload.get("disaster_type") or "FLOOD"
    
    preset = CITY_PRESETS.get(city_name, {"lat": 28.6139, "lng": 77.2090})
    lat = float(payload.get("lat", preset["lat"]))
    lng = float(payload.get("lng", preset["lng"]))

    try:
        d_type = DisasterType(disaster_type_str)
    except Exception:
        d_type = DisasterType.FLOOD

    scen = generate_procedural_scenario(city_name, d_type, lat, lng)
    state_mgr.save_scenario(scen)
    state_mgr.run_initial_plan(scen.id)
    return scen

@app.get("/api/scenario/{scenario_id}", response_model=DisasterScenario)
def get_scenario(scenario_id: str):
    scen = state_mgr.get_scenario(scenario_id)
    if not scen:
        raise HTTPException(status_code=404, detail=f"Scenario '{scenario_id}' not found")
    return scen

@app.post("/api/scenario/load/{scenario_id}", response_model=DisasterScenario)
def load_scenario(scenario_id: str):
    if scenario_id in PRESET_SCENARIOS:
        scen_factory = PRESET_SCENARIOS[scenario_id]
        scen = scen_factory()
        state_mgr.save_scenario(scen)
        state_mgr.run_initial_plan(scenario_id)
        return scen
    
    # Check if city preset
    for city, data in CITY_PRESETS.items():
        if city.lower() in scenario_id.lower():
            scen = generate_procedural_scenario(city, DisasterType.FLOOD, data["lat"], data["lng"])
            state_mgr.save_scenario(scen)
            state_mgr.run_initial_plan(scen.id)
            return scen

    scen = state_mgr.get_scenario(scenario_id)
    if scen:
        return scen
    raise HTTPException(status_code=404, detail=f"Scenario '{scenario_id}' not found")

@app.post("/api/scenario/{scenario_id}/plan", response_model=DisasterScenario)
def generate_plan(scenario_id: str):
    scen = state_mgr.get_scenario(scenario_id)
    if not scen:
        raise HTTPException(status_code=404, detail=f"Scenario '{scenario_id}' not found")
    state_mgr.run_initial_plan(scenario_id)
    return state_mgr.get_scenario(scenario_id)

@app.post("/events/inject")
@app.post("/api/events/inject")
def inject_event(payload: Dict[str, Any] = Body(...)):
    event_type_str = payload.get("type") or payload.get("eventType") or "ROAD_BLOCK"
    target_id = payload.get("target_id") or payload.get("target_zone_id")
    scenario_id = payload.get("scenario_id") or "scenario-flood-01"
    
    coords = None
    if "coordinates" in payload:
        coords = payload["coordinates"]
    elif "lat" in payload and "lng" in payload:
        coords = {"lat": float(payload["lat"]), "lng": float(payload["lng"])}
    
    try:
        e_type = EventType(event_type_str)
    except Exception:
        e_type = EventType.ROAD_BLOCK

    event = SimulationEvent(
        id=f"evt-inj-{int(datetime.now().timestamp())}",
        type=e_type,
        title=payload.get("title") or event_type_str.replace("_", " ").title(),
        description=payload.get("description") or f"Injected event at location: {event_type_str}",
        target_id=target_id,
        target_zone_id=target_id,
        coordinates=coords,
        payload=payload,
        scenario_id=scenario_id,
        timestamp=datetime.now().isoformat()
    )
    
    scen = state_mgr.get_scenario(scenario_id)
    if not scen:
        raise HTTPException(status_code=404, detail=f"Scenario '{scenario_id}' not found")
        
    updated_scenario, diff = state_mgr.simulate_event_and_replan(scenario_id, event)
    return {
        "scenario": updated_scenario,
        "diff": diff,
        "nearest_hospitals": diff.nearest_hospitals,
        "nearest_ambulances_count": diff.nearest_ambulances_count,
        "nearest_units": diff.nearest_units,
        "toast_message": diff.toast_message,
        "message": f"Plan v{updated_scenario.plan_version} generated."
    }

@app.post("/api/scenario/{scenario_id}/simulate-event", response_model=Dict[str, Any])
def simulate_event(scenario_id: str, event: SimulationEvent):
    scen = state_mgr.get_scenario(scenario_id)
    if not scen:
        raise HTTPException(status_code=404, detail=f"Scenario '{scenario_id}' not found")
    
    updated_scenario, diff = state_mgr.simulate_event_and_replan(scenario_id, event)
    return {
        "scenario": updated_scenario,
        "diff": diff,
        "toast_message": diff.toast_message,
        "message": "Event simulated successfully. Replanning complete."
    }

@app.get("/api/scenario/{scenario_id}/decision-trace", response_model=DecisionTrace)
def get_decision_trace(scenario_id: str):
    trace = state_mgr.get_trace(scenario_id)
    if not trace:
        raise HTTPException(status_code=404, detail=f"Decision trace for '{scenario_id}' not found")
    return trace

@app.get("/api/scenario/{scenario_id}/agent-status", response_model=AgentWorkflowStatus)
def get_agent_status(scenario_id: str):
    status = state_mgr.get_status(scenario_id)
    if not status:
        raise HTTPException(status_code=404, detail=f"Agent status for '{scenario_id}' not found")
    return status

@app.post("/api/scenario/{scenario_id}/approve")
def approve_plan(scenario_id: str):
    scen = state_mgr.get_scenario(scenario_id)
    if not scen:
        raise HTTPException(status_code=404, detail=f"Scenario '{scenario_id}' not found")
    scen.human_approved = True
    state_mgr.save_scenario(scen)
    return {"status": "APPROVED", "message": "Plan approved by Human Operational Commander."}
