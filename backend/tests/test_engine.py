import pytest
from app.scenarios.presets import get_urban_flood_scenario
from app.engine.priority import compute_all_zone_priorities
from app.engine.optimizer import allocate_resources_deterministic
from app.engine.critic import validate_plan_constraints
from app.state.manager import ScenarioStateManager
from app.models.schemas import SimulationEvent, EventType

def test_resource_limits_never_exceeded():
    scen = get_urban_flood_scenario()
    compute_all_zone_priorities(scen.zones, scen.priority_weights)
    plan, candidates = allocate_resources_deterministic(scen.zones, scen.resources, scen.id)
    
    max_rescue = scen.resources["rescue_teams"].available
    max_amb = scen.resources["ambulances"].available
    
    assert plan.total_rescue_teams_used <= max_rescue, f"Allocated {plan.total_rescue_teams_used} > max {max_rescue}"
    assert plan.total_ambulances_used <= max_amb, f"Allocated {plan.total_ambulances_used} > max {max_amb}"
    assert plan.total_supply_percent_used <= 100.0, "Supply % exceeded 100%"

def test_road_block_event_triggers_replanning_and_diff():
    mgr = ScenarioStateManager()
    scen_id = "scenario-flood-01"
    
    event = SimulationEvent(
        id="evt-test-1",
        type=EventType.ROAD_BLOCK,
        title="Road Blocked",
        description="Road to Zone A is blocked",
        target_zone_id="zone-a",
        timestamp="2026-10-01T23:55:00"
    )
    
    scen, diff = mgr.simulate_event_and_replan(scen_id, event)
    
    assert diff is not None
    assert "zone-a" in diff.invalidated_assumptions[0].lower() or "road" in diff.why_plan_changed.lower()
    assert len(diff.invalidated_assumptions) > 0

def test_population_increase_elevates_priority():
    scen = get_urban_flood_scenario()
    compute_all_zone_priorities(scen.zones, scen.priority_weights)
    zone_c = next(z for z in scen.zones if z.id == "zone-c")
    initial_score = zone_c.priority_score
    
    # Increase population in Zone C from 1500 to 5000
    zone_c.population_affected = 5000
    compute_all_zone_priorities(scen.zones, scen.priority_weights)
    new_score = zone_c.priority_score
    
    assert new_score > initial_score, f"New score {new_score} should be higher than {initial_score}"

def test_critic_validates_plan():
    scen = get_urban_flood_scenario()
    compute_all_zone_priorities(scen.zones, scen.priority_weights)
    plan, _ = allocate_resources_deterministic(scen.zones, scen.resources, scen.id)
    is_valid, notes = validate_plan_constraints(plan, scen.resources, scen.zones)
    
    assert is_valid is True
    assert any("PASSED" in note for note in notes)
