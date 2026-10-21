from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field
from enum import Enum
from datetime import datetime

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
    POPULATION_INCREASE = "POPULATION_INCREASE"
    RESOURCE_LOSS = "RESOURCE_LOSS"
    SEVERITY_ESCALATION = "SEVERITY_ESCALATION"
    NEW_INCIDENT = "NEW_INCIDENT"

class Coordinates(BaseModel):
    x: float  # Percentage on map grid (0-100)
    y: float  # Percentage on map grid (0-100)
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
    connected_roads: List[str] = Field(default_factory=list)  # IDs of connected zones/routes

class Resource(BaseModel):
    id: str
    type: str  # rescue_teams, ambulances, supply_units, shelter_capacity
    name: str
    total: int
    available: int
    assigned: int = 0
    unit_label: str = "units"

class Incident(BaseModel):
    id: str
    zone_id: str
    title: str
    description: str
    severity: SeverityLevel
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
    feasibility_score: float = 100.0  # 100% feasibility if constraints met
    constraint_satisfaction_pct: float = 100.0
    summary: str
    critic_approved: bool = True
    critic_notes: List[str] = Field(default_factory=list)
    alternatives_evaluated: int = 3
    expected_coverage_pct: float = 0.0

class DecisionTraceStep(BaseModel):
    step_index: int
    stage: str  # UNDERSTAND, ANALYZE, DECIDE, ACT, MONITOR, REPLAN
    agent_name: str
    status: str  # completed, running, waiting, error
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
    title: str
    description: str
    target_zone_id: Optional[str] = None
    payload: Dict[str, Any] = Field(default_factory=dict)
    timestamp: str

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
    timestamp: str
    changes: List[ResourceChangeItem]
    invalidated_assumptions: List[str]
    why_plan_changed: str

class DisasterScenario(BaseModel):
    id: str
    title: str
    type: DisasterType
    description: str
    status: str = "ACTIVE"
    zones: List[Zone]
    resources: Dict[str, Resource]  # Keyed by resource type
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
    status: str  # completed, running, waiting, warning, error
    message: str
    timestamp: str

class AgentWorkflowStatus(BaseModel):
    scenario_id: str
    current_stage: str
    agents: List[AgentStatusItem]
