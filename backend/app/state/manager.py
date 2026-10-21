from typing import Dict, Optional, List, Tuple, Any
from datetime import datetime
from app.models.schemas import (
    DisasterScenario, AllocationPlan, SimulationEvent, EventType,
    PlanDiff, ResourceChangeItem, DecisionTrace, AgentWorkflowStatus, Zone, SeverityLevel, Resource, Coordinates, ResponseUnit, Facility, Incident, NearestResourceInfo, DisasterType
)
from app.scenarios.presets import get_nepal_flood_scenario, PRESET_SCENARIOS
from app.scenarios.procedural import generate_procedural_scenario
from app.agents.orchestrator import AgentOrchestrator
from app.engine.proximity import calculate_nearest_resources

class ScenarioStateManager:
    """
    Manages active scenario state, event simulations, replanning loops,
    and plan diff generation.
    """
    def __init__(self):
        self._scenarios: Dict[str, DisasterScenario] = {}
        self._traces: Dict[str, DecisionTrace] = {}
        self._statuses: Dict[str, AgentWorkflowStatus] = {}

        # Pre-load preset scenarios on startup
        delhi = generate_procedural_scenario("Delhi", DisasterType.FLOOD, 28.6139, 77.2090)
        delhi.id = "scenario-delhi-01"
        self.save_scenario(delhi)
        self.run_initial_plan(delhi.id)

        mumbai = generate_procedural_scenario("Mumbai", DisasterType.CYCLONE, 19.0760, 72.8777)
        mumbai.id = "scenario-mumbai-01"
        self.save_scenario(mumbai)
        self.run_initial_plan(mumbai.id)

        nepal = get_nepal_flood_scenario()
        self.save_scenario(nepal)
        self.run_initial_plan(nepal.id)

    def get_scenario(self, scenario_id: str) -> Optional[DisasterScenario]:
        return self._scenarios.get(scenario_id)

    def save_scenario(self, scenario: DisasterScenario):
        scenario.updated_at = datetime.now().isoformat()
        self._scenarios[scenario.id] = scenario

    def get_trace(self, scenario_id: str) -> Optional[DecisionTrace]:
        return self._traces.get(scenario_id)

    def get_status(self, scenario_id: str) -> Optional[AgentWorkflowStatus]:
        return self._statuses.get(scenario_id)

    def run_initial_plan(self, scenario_id: str) -> Tuple[AllocationPlan, DecisionTrace]:
        scenario = self.get_scenario(scenario_id)
        if not scenario:
            raise ValueError(f"Scenario {scenario_id} not found")

        plan, trace, status = AgentOrchestrator.run_full_pipeline(scenario)
        scenario.active_plan = plan
        scenario.previous_plan = None
        scenario.latest_diff = None
        self._traces[scenario_id] = trace
        self._statuses[scenario_id] = status
        self.save_scenario(scenario)
        return plan, trace

    def simulate_event_and_replan(self, scenario_id: str, event: SimulationEvent) -> Tuple[DisasterScenario, PlanDiff]:
        scenario = self.get_scenario(scenario_id)
        if not scenario:
            raise ValueError(f"Scenario {scenario_id} not found")

        old_plan = scenario.active_plan
        invalidated_assumptions = []
        units_rerouted = []
        people_affected_change = 0
        eta_change_seconds = 0
        toast_msg = ""

        # Increment Plan Version (v1 -> v2 -> v3)
        scenario.plan_version += 1
        new_version_str = f"v{scenario.plan_version}"

        target_id = event.target_id or event.target_zone_id

        # Determine Target Coordinates for Proximity Calculation
        target_lat = 28.6139
        target_lng = 77.2090

        if event.coordinates:
            target_lat = event.coordinates.get("x", 28.6139) if "x" in event.coordinates else event.coordinates.get("lat", 28.6139)
            target_lng = event.coordinates.get("y", 77.2090) if "y" in event.coordinates else event.coordinates.get("lng", 77.2090)
        elif event.payload and "coordinates" in event.payload:
            coords = event.payload["coordinates"]
            target_lat = coords.get("lat", 28.6139)
            target_lng = coords.get("lng", 77.2090)
        elif target_id:
            for z in scenario.zones:
                if z.id == target_id or target_id in z.id:
                    target_lat = z.coordinates.x
                    target_lng = z.coordinates.y
                    break
            for f in scenario.facilities:
                if f.id == target_id or target_id in f.id:
                    target_lat = f.coordinates.get("lat", 28.6139)
                    target_lng = f.coordinates.get("lng", 77.2090)
                    break

        # 1. ROAD_BLOCK / BRIDGE_COLLAPSE
        if event.type in [EventType.ROAD_BLOCK, EventType.BRIDGE_COLLAPSE]:
            target_zid = target_id or (scenario.zones[0].id if scenario.zones else "zone-a")
            target_name = target_zid
            for z in scenario.zones:
                if z.id == target_zid or target_zid in z.id:
                    target_name = z.name.split(" — ")[0]
                    z.accessibility = 0.0
                    z.risk_factors.append("Bridge & access road collapse")
                    invalidated_assumptions.append(f"Bridge connectivity broken for '{z.name}' (Accessibility: 0%). Ground transport impassable.")

            for u in scenario.units:
                if u.terrain_access == ["road"] and u.status != "idle":
                    u.status = "en_route"
                    units_rerouted.append(u.name)
                    u.planned_route = [
                        u.current_position,
                        {"lat": target_lat + 0.015, "lng": target_lng + 0.020},
                        {"lat": target_lat, "lng": target_lng}
                    ]
                    u.eta_seconds += 360
                    eta_change_seconds += 360

            toast_msg = f"Plan {new_version_str} generated: Bridge collapse at {target_name}, {len(units_rerouted)} units rerouted."

        # 2. FLOOD_LEVEL_RISE
        elif event.type == EventType.FLOOD_LEVEL_RISE:
            target_zid = target_id or (scenario.zones[0].id if scenario.zones else "zone-a")
            target_name = target_zid
            for z in scenario.zones:
                if z.id == target_zid or target_zid in z.id:
                    target_name = z.name.split(" — ")[0]
                    z.severity = SeverityLevel.CRITICAL
                    z.severity_score = 98.0
                    z.urgency = 95.0
                    z.population_affected += 1200
                    people_affected_change += 1200
                    invalidated_assumptions.append(f"Water level surged +1.8m in '{z.name}'. Population exposure escalated (+1,200 people).")

            scenario.flood_polygons.append([
                {"lat": target_lat + 0.005, "lng": target_lng - 0.010},
                {"lat": target_lat + 0.010, "lng": target_lng + 0.010},
                {"lat": target_lat - 0.005, "lng": target_lng + 0.015},
                {"lat": target_lat - 0.010, "lng": target_lng - 0.005}
            ])

            for u in scenario.units:
                if "boat" in u.type or "helicopter" in u.type:
                    units_rerouted.append(u.name)
                    u.status = "en_route"
                    u.target_name = f"Water Surge in {target_name}"
                    u.target_position = {"lat": target_lat, "lng": target_lng}
                    u.planned_route = [u.current_position, u.target_position]
                    u.eta_seconds = 240

            toast_msg = f"Plan {new_version_str} generated: Flood surge at ({target_lat:.3f}, {target_lng:.3f}), +1,200 people affected."

        # 3. SHELTER_FULL
        elif event.type == EventType.SHELTER_FULL:
            target_fid = target_id or (scenario.facilities[0].id if scenario.facilities else "shelter-1")
            shelter_name = target_fid
            for f in scenario.facilities:
                if f.id == target_fid or target_fid in f.id:
                    f.status = "full"
                    f.current_occupancy = f.capacity
                    shelter_name = f.name
                    invalidated_assumptions.append(f"Shelter capacity exhausted at '{f.name}' ({f.capacity}/{f.capacity} beds occupied). Directing evacuees to secondary facilities.")

            for u in scenario.units:
                if u.type in ["rescue_team", "ambulance"]:
                    units_rerouted.append(u.name)
                    u.target_name = "Secondary Relief Shelter"
                    u.target_position = {"lat": target_lat + 0.010, "lng": target_lng + 0.015}
                    u.planned_route = [u.current_position, u.target_position]
                    u.eta_seconds += 180
                    eta_change_seconds += 180

            toast_msg = f"Plan {new_version_str} generated: {shelter_name} full, evacuees rerouted."

        # 4. HOSPITAL_OFFLINE
        elif event.type == EventType.HOSPITAL_OFFLINE:
            target_fid = target_id or (scenario.facilities[0].id if scenario.facilities else "hospital-1")
            hosp_name = target_fid
            for f in scenario.facilities:
                if f.id == target_fid or target_fid in f.id:
                    f.status = "offline"
                    hosp_name = f.name
                    invalidated_assumptions.append(f"Hospital operational failure at '{f.name}' due to power grid submergence. Re-routing medical evacuations to Patan/Safdarjung Field Hospital.")

            for u in scenario.units:
                if u.type == "ambulance":
                    units_rerouted.append(u.name)
                    u.target_name = "Secondary Field Hospital"
                    u.target_position = {"lat": target_lat - 0.010, "lng": target_lng - 0.010}
                    u.planned_route = [u.current_position, u.target_position]
                    u.eta_seconds += 240
                    eta_change_seconds += 240

            toast_msg = f"Plan {new_version_str} generated: {hosp_name} offline, medical transports rerouted."

        # 5. UNIT_BREAKDOWN
        elif event.type == EventType.UNIT_BREAKDOWN:
            target_uid = target_id or (scenario.units[0].id if scenario.units else "unit-rescue-1")
            unit_name = target_uid
            for u in scenario.units:
                if u.id == target_uid or target_uid in u.id:
                    u.status = "blocked"
                    u.speed = 0.0
                    unit_name = u.name
                    invalidated_assumptions.append(f"Mechanical failure on Response Unit '{u.name}'. Unit marked blocked. Re-assigning target workload to backup teams.")

            for u in scenario.units:
                if u.id != target_uid and u.status == "idle":
                    units_rerouted.append(u.name)
                    u.status = "en_route"
                    u.target_name = "Emergency Rescue Target"
                    u.target_position = {"lat": target_lat, "lng": target_lng}
                    u.planned_route = [u.current_position, u.target_position]
                    u.eta_seconds = 360

            toast_msg = f"Plan {new_version_str} generated: Mechanical breakdown on {unit_name}, backup team deployed."

        # 6. POPULATION_INCREASE
        elif event.type == EventType.POPULATION_INCREASE:
            target_zid = target_id or (scenario.zones[0].id if scenario.zones else "zone-a")
            add_pop = event.payload.get("additional_population", 500)
            for z in scenario.zones:
                if z.id == target_zid or target_zid in z.id:
                    old_p = z.population_affected
                    z.population_affected += add_pop
                    people_affected_change += add_pop
                    z.urgency = min(100.0, z.urgency + 20.0)
                    invalidated_assumptions.append(f"Population baseline invalidated for '{z.name}' ({old_p} -> {z.population_affected} residents affected).")
            toast_msg = f"Plan {new_version_str} generated: +{add_pop} civilians displaced."

        # 7. RESOURCE_LOSS
        elif event.type == EventType.RESOURCE_LOSS:
            loss_teams = event.payload.get("rescue_teams_lost", 2)
            res = scenario.resources.get("rescue_teams")
            if res:
                old_avail = res.available
                res.available = max(0, res.available - loss_teams)
                invalidated_assumptions.append(f"NDRF rescue team availability assumption broken ({old_avail} -> {res.available} teams available).")
            toast_msg = f"Plan {new_version_str} generated: 2 rescue teams re-routed to secondary emergency."

        # 8. SEVERITY_ESCALATION
        elif event.type == EventType.SEVERITY_ESCALATION:
            target_zid = target_id or (scenario.zones[0].id if scenario.zones else "zone-a")
            for z in scenario.zones:
                if z.id == target_zid or target_zid in z.id:
                    z.severity = SeverityLevel.CRITICAL
                    z.severity_score = 96.0
                    z.urgency = 92.0
                    invalidated_assumptions.append(f"Severity level escalated for '{z.name}' (HIGH -> CRITICAL).")
            toast_msg = f"Plan {new_version_str} generated: Zone escalated to CRITICAL."

        # 9. NEW_INCIDENT
        elif event.type == EventType.NEW_INCIDENT:
            new_z_id = f"zone-d-{int(datetime.now().timestamp())}"
            new_zone = Zone(
                id=new_z_id,
                name="New Emergency Outbreak Sector",
                population_affected=2800,
                severity=SeverityLevel.CRITICAL,
                severity_score=95.0,
                urgency=92.0,
                accessibility=10.0,
                risk_score=95.0,
                risk_factors=["Flash flood inundation washed away primary feeder road"],
                coordinates=Coordinates(x=target_lat, y=target_lng)
            )
            scenario.zones.append(new_zone)
            people_affected_change += 2800
            invalidated_assumptions.append(f"Disaster boundary expanded: New Emergency reported at ({target_lat:.3f}, {target_lng:.3f}) with 2,800 affected residents.")
            toast_msg = f"Plan {new_version_str} generated: New emergency reported at ({target_lat:.3f}, {target_lng:.3f})."

        # Calculate Proximity: Nearest Hospitals & Nearest Ambulances
        nearest_hospitals, ambulances_count_nearby, nearest_units = calculate_nearest_resources(
            target_lat, target_lng, scenario
        )

        closest_hosp_name = nearest_hospitals[0].name if nearest_hospitals else "AIIMS Emergency Trauma Center"
        closest_hosp_dist = nearest_hospitals[0].distance_km if nearest_hospitals else 1.2
        closest_hosp_cap = nearest_hospitals[0].capacity_or_eta if nearest_hospitals else "90 beds free"

        enhanced_toast = (
            f"Plan {new_version_str} generated at ({target_lat:.3f}°N, {target_lng:.3f}°E). "
            f"Nearest Hosp: {closest_hosp_name} ({closest_hosp_dist}km, {closest_hosp_cap}). "
            f"{ambulances_count_nearby} Ambulances within 10km radius."
        )

        # Execute Deterministic Agent Replanning Pipeline
        new_plan, trace, status = AgentOrchestrator.run_full_pipeline(scenario)
        new_plan.version = scenario.plan_version
        
        # Calculate Plan Diff
        changes: List[ResourceChangeItem] = []
        if old_plan and new_plan:
            all_zids = set(old_plan.items.keys()).union(set(new_plan.items.keys()))
            for zid in all_zids:
                old_item = old_plan.items.get(zid)
                new_item = new_plan.items.get(zid)
                zname = new_item.zone_name if new_item else (old_item.zone_name if old_item else zid)
                
                old_r = old_item.rescue_teams if old_item else 0
                new_r = new_item.rescue_teams if new_item else 0
                if old_r != new_r:
                    changes.append(ResourceChangeItem(
                        zone_id=zid,
                        zone_name=zname,
                        resource_type="Rescue Teams",
                        old_value=old_r,
                        new_value=new_r,
                        change_delta=new_r - old_r
                    ))

                old_a = old_item.ambulances if old_item else 0
                new_a = new_item.ambulances if new_item else 0
                if old_a != new_a:
                    changes.append(ResourceChangeItem(
                        zone_id=zid,
                        zone_name=zname,
                        resource_type="Ambulances",
                        old_value=old_a,
                        new_value=new_a,
                        change_delta=new_a - old_a
                    ))

        why_changed = f"Event '{event.title or event.type}' triggered Plan {new_version_str} generation at ({target_lat:.3f}°N, {target_lng:.3f}°E). " + " ".join(invalidated_assumptions)
        
        diff = PlanDiff(
            event=event,
            old_plan_id=old_plan.id if old_plan else "none",
            new_plan_id=new_plan.id,
            plan_version=scenario.plan_version,
            timestamp=datetime.now().isoformat(),
            changes=changes,
            units_rerouted=units_rerouted,
            people_affected_change=people_affected_change,
            eta_change_seconds=eta_change_seconds,
            nearest_hospitals=nearest_hospitals,
            nearest_ambulances_count=ambulances_count_nearby,
            nearest_units=nearest_units,
            invalidated_assumptions=invalidated_assumptions,
            why_plan_changed=why_changed,
            toast_message=enhanced_toast
        )

        scenario.previous_plan = old_plan
        scenario.active_plan = new_plan
        scenario.latest_diff = diff
        scenario.human_approved = False
        
        self._traces[scenario_id] = trace
        self._statuses[scenario_id] = status
        self.save_scenario(scenario)

        return scenario, diff

_state_manager_instance = None

def get_state_manager() -> ScenarioStateManager:
    global _state_manager_instance
    if _state_manager_instance is None:
        _state_manager_instance = ScenarioStateManager()
    return _state_manager_instance
