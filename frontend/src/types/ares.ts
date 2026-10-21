export interface Zone {
  id: string;
  name: string;
  population_affected: number;
  severity: "CRITICAL" | "HIGH" | "MODERATE" | "LOW";
  severity_score: number;
  urgency: number;
  accessibility: number;
  risk_score: number;
  risk_factors: string[];
  priority_score?: number;
  priority_factors?: Record<string, number>;
  coordinates: {
    x: number;  // Lat
    y: number;  // Lng
  };
  connected_roads?: string[];
}

export interface Resource {
  id: string;
  type: string;
  name: string;
  total: number;
  available: number;
  assigned: number;
  unit_label: string;
}

export interface ResponseUnit {
  id: string;
  name: string;
  type: "rescue_team" | "ambulance" | "boat" | "helicopter" | string;
  capacity: number;
  speed: number;
  terrain_access: string[];
  status: "idle" | "en_route" | "rescuing" | "blocked" | string;
  current_position: { lat: number; lng: number };
  base_position: { lat: number; lng: number };
  target_id?: string;
  target_name?: string;
  target_position?: { lat: number; lng: number };
  planned_route: { lat: number; lng: number }[];
  eta_seconds: number;
}

export interface Facility {
  id: string;
  name: string;
  type: "shelter" | "hospital" | string;
  capacity: number;
  current_occupancy: number;
  status: "active" | "full" | "offline" | string;
  coordinates: { lat: number; lng: number };
}

export interface Incident {
  id: string;
  zone_id: string;
  title: string;
  description: string;
  severity: "CRITICAL" | "HIGH" | "MODERATE" | "LOW" | string;
  status: "active" | "assigned" | "resolved" | string;
  affected_people: number;
  coordinates: { lat: number; lng: number };
  timestamp: string;
}

export interface AllocationItem {
  zone_id: string;
  zone_name: string;
  rescue_teams: number;
  ambulances: number;
  supply_percent: number;
  shelter_capacity_assigned: number;
  priority_score: number;
  rationale: string;
}

export interface AllocationPlan {
  id: string;
  scenario_id: string;
  version: number;
  timestamp: string;
  items: Record<string, AllocationItem>;
  total_rescue_teams_used: number;
  total_ambulances_used: number;
  total_supply_percent_used: number;
  total_shelter_assigned: number;
  feasibility_score: number;
  constraint_satisfaction_pct: number;
  summary: string;
  critic_approved: boolean;
  critic_notes: string[];
  alternatives_evaluated: number;
  expected_coverage_pct: number;
}

export interface DecisionTraceStep {
  step_index: number;
  stage: string;
  agent_name: string;
  status: string;
  input_summary: string;
  output_summary: string;
  reasoning_details?: Record<string, any>;
  timestamp: string;
}

export interface DecisionTrace {
  scenario_id: string;
  plan_id: string;
  steps: DecisionTraceStep[];
  candidate_plans_count: number;
  selected_plan_reason: string;
  constraints_enforced: string[];
}

export interface SimulationEvent {
  id: string;
  type: "ROAD_BLOCK" | "BRIDGE_COLLAPSE" | "FLOOD_LEVEL_RISE" | "SHELTER_FULL" | "HOSPITAL_OFFLINE" | "UNIT_BREAKDOWN" | "POPULATION_INCREASE" | "RESOURCE_LOSS" | "SEVERITY_ESCALATION" | "NEW_INCIDENT" | string;
  title?: string;
  description?: string;
  target_id?: string;
  target_zone_id?: string;
  coordinates?: { lat: number; lng: number };
  payload?: Record<string, any>;
  scenario_id?: string;
  timestamp?: string;
}

export interface NearestResourceInfo {
  name: string;
  type: string;  // "hospital", "shelter", "ambulance", "rescue_team"
  distance_km: number;
  capacity_or_eta: string;
  status: string;
  coordinates: { lat: number; lng: number };
}

export interface ResourceChangeItem {
  zone_id: string;
  zone_name: string;
  resource_type: string;
  old_value: any;
  new_value: any;
  change_delta: any;
}

export interface PlanDiff {
  event: SimulationEvent;
  old_plan_id: str;
  new_plan_id: str;
  plan_version: number;
  timestamp: string;
  changes: ResourceChangeItem[];
  units_rerouted: string[];
  people_affected_change: number;
  eta_change_seconds: number;
  nearest_hospitals: NearestResourceInfo[];
  nearest_ambulances_count: number;
  nearest_units: NearestResourceInfo[];
  invalidated_assumptions: string[];
  why_plan_changed: string;
  toast_message: string;
}

export interface DisasterScenario {
  id: string;
  title: string;
  type: string;
  description: string;
  status: string;
  plan_version: number;
  zones: Zone[];
  resources: Record<string, Resource>;
  units: ResponseUnit[];
  facilities: Facility[];
  flood_polygons: { lat: number; lng: number }[][];
  incidents: Incident[];
  active_plan?: AllocationPlan;
  previous_plan?: AllocationPlan;
  latest_diff?: PlanDiff;
  priority_weights: Record<string, number>;
  human_approved: boolean;
  created_at: string;
  updated_at: string;
}

export interface AgentStatusItem {
  name: string;
  role: string;
  status: string;
  message: string;
  timestamp: string;
}

export interface AgentWorkflowStatus {
  scenario_id: string;
  current_stage: string;
  agents: AgentStatusItem[];
}
