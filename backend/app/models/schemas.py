from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field
from enum import Enum

class DisasterType(str, Enum):
    FLOOD = "FLOOD"
    EARTHQUAKE = "EARTHQUAKE"
    CYCLONE = "CYCLONE"
    WILDFIRE = "WILDFIRE"

class SeverityLevel(str, Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MODERATE = "MODERATE"
    LOW = "LOW"

class EventType(str, Enum):
    ROAD_BLOCK = "ROAD_BLOCK"
    BRIDGE_COLLAPSE = "BRIDGE_COLLAPSE"
    FLOOD_LEVEL_RISE = "FLOOD_LEVEL_RISE"
    SHELTER_FULL = "SHELTER_FULL"
    HOSPITAL_OFFLINE = "HOSPITAL_OFFLINE"
    UNIT_BREAKDOWN = "UNIT_BREAKDOWN"
    POPULATION_INCREASE = "POPULATION_INCREASE"
    RESOURCE_LOSS = "RESOURCE_LOSS"
    SEVERITY_ESCALATION = "SEVERITY_ESCALATION"
    NEW_INCIDENT = "NEW_INCIDENT"

class Coordinates(BaseModel):
    x: float  # Percentage on map grid or Latitude
    y: float  # Percentage on map grid or Longitude
    polygon: Optional[List[List[float]]] = None

class Zone(BaseModel):
    id: str
    name: str
    population_affected: int
    severity: SeverityLevel
    severity_score: float = Field(..., ge=0, le=100)
    urgency: float = Field(..., ge=0, le=100)
    accessibility: float = Field(..., ge=0, le=100)  # 100 = completely accessible, 0 = completely blocked
    risk_score: float = Field(default=50.0, ge=0, le=100)
    risk_factors: List[str] = Field(default_factory=list)
    priority_score: Optional[float] = None
    priority_factors: Optional[Dict[str, float]] = None
    coordinates: Coordinates
    connected_roads: List[str] = Field(default_factory=list)

class Resource(BaseModel):
    id: str
    type: str  # rescue_teams, ambulances, supply_units, shelter_capacity, boats, helicopters
    name: str
    total: int
    available: int
    assigned: int = 0
    unit_label: str = "units"

class ResponseUnit(BaseModel):
    id: str
    name: str
    type: str  # "rescue_team", "ambulance", "boat", "helicopter"
    capacity: int = 10
    speed: float = 40.0  # km/h
    terrain_access: List[str] = Field(default_factory=lambda: ["road"])  # "road", "water", "air"
    status: str = "idle"  # "idle", "en_route", "rescuing", "blocked"
    current_position: Dict[str, float]  # {"lat": 27.683, "lng": 85.305}
    base_position: Dict[str, float]
    target_id: Optional[str] = None
    target_name: Optional[str] = None
    target_position: Optional[Dict[str, float]] = None
    planned_route: List[Dict[str, float]] = Field(default_factory=list)
    eta_seconds: int = 0

class Facility(BaseModel):
    id: str
    name: str
    type: str  # "shelter", "hospital"
    capacity: int
    current_occupancy: int = 0
    status: str = "active"  # "active", "full", "offline"
    coordinates: Dict[str, float]  # {"lat": ..., "lng": ...}

class Incident(BaseModel):
    id: str
    zone_id: str
    title: str
    description: str
    severity: SeverityLevel
    status: str = "active"  # "active", "assigned", "resolved"
    affected_people: int = 500
    coordinates: Dict[str, float] = Field(default_factory=lambda: {"lat": 27.683, "lng": 85.305})
    timestamp: str

class AllocationItem(BaseModel):
    zone_id: str
    zone_name: str
    rescue_teams: int = 0
    ambulances: int = 0
    supply_percent: float = 0.0
    shelter_capacity_assigned: int = 0
    priority_score: float = 0.0
    rationale: str = ""

class AllocationPlan(BaseModel):
    id: str
    scenario_id: str
    version: int = 1
    timestamp: str
    items: Dict[str, AllocationItem]
    total_rescue_teams_used: int
    total_ambulances_used: int
    total_supply_percent_used: float
    total_shelter_assigned: int
    feasibility_score: float = 100.0
    constraint_satisfaction_pct: float = 100.0
    summary: str
    critic_approved: bool = True
    critic_notes: List[str] = Field(default_factory=list)
    alternatives_evaluated: int = 3
    expected_coverage_pct: float = 0.0

class DecisionTraceStep(BaseModel):
    step_index: int
    stage: str
    agent_name: str
    status: str
    input_summary: str
    output_summary: str
    reasoning_details: Optional[Dict[str, Any]] = None
    timestamp: str

class DecisionTrace(BaseModel):
    scenario_id: str
    plan_id: str
    steps: List[DecisionTraceStep]
    candidate_plans_count: int = 3
    selected_plan_reason: str
    constraints_enforced: List[str]

class SimulationEvent(BaseModel):
    id: str
    type: EventType
    title: str = ""
    description: str = ""
    target_id: Optional[str] = None
    target_zone_id: Optional[str] = None
    coordinates: Optional[Dict[str, float]] = None  # {"lat": 27.683, "lng": 85.305}
    payload: Dict[str, Any] = Field(default_factory=dict)
    scenario_id: Optional[str] = None
    timestamp: str = ""

class NearestResourceInfo(BaseModel):
    name: str
    type: str  # "hospital", "shelter", "ambulance", "rescue_team"
    distance_km: float
    capacity_or_eta: str
    status: str
    coordinates: Dict[str, float]

class ResourceChangeItem(BaseModel):
    zone_id: str
    zone_name: str
    resource_type: str
    old_value: Any
    new_value: Any
    change_delta: Any

class PlanDiff(BaseModel):
    event: SimulationEvent
    old_plan_id: str
    new_plan_id: str
    plan_version: int = 1
    timestamp: str
    changes: List[ResourceChangeItem]
    units_rerouted: List[str] = Field(default_factory=list)
    people_affected_change: int = 0
    eta_change_seconds: int = 0
    nearest_hospitals: List[NearestResourceInfo] = Field(default_factory=list)
    nearest_ambulances_count: int = 0
    nearest_units: List[NearestResourceInfo] = Field(default_factory=list)
    invalidated_assumptions: List[str]
    why_plan_changed: str
    toast_message: str = ""

class DisasterScenario(BaseModel):
    id: str
    title: str
    type: DisasterType
    description: str
    status: str = "ACTIVE"
    plan_version: int = 1
    zones: List[Zone]
    resources: Dict[str, Resource]
    units: List[ResponseUnit] = Field(default_factory=list)
    facilities: List[Facility] = Field(default_factory=list)
    flood_polygons: List[List[Dict[str, float]]] = Field(default_factory=list)
    incidents: List[Incident]
    active_plan: Optional[AllocationPlan] = None
    previous_plan: Optional[AllocationPlan] = None
    latest_diff: Optional[PlanDiff] = None
    priority_weights: Dict[str, float] = Field(default_factory=lambda: {
        "severity": 0.35,
        "population": 0.25,
        "urgency": 0.20,
        "accessibility": 0.10,
        "risk": 0.10
    })
    human_approved: bool = False
    created_at: str
    updated_at: str

class AgentStatusItem(BaseModel):
    name: str
    role: str
    status: str
    message: str
    timestamp: str

class AgentWorkflowStatus(BaseModel):
    scenario_id: str
    current_stage: str
    agents: List[AgentStatusItem]
