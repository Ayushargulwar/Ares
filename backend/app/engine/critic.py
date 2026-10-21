from typing import Tuple, List, Dict
from app.models.schemas import AllocationPlan, Resource, Zone, SeverityLevel

def validate_plan_constraints(
    plan: AllocationPlan,
    resources: Dict[str, Resource],
    zones: List[Zone]
) -> Tuple[bool, List[str]]:
    """
    Hard constraint verification engine.
    Checks:
    1. Over-allocation of resources.
    2. Critical severity zone coverage (Critical zones must receive non-zero rescue/medical allocation).
    3. Blocked road accessibility check.
    """
    notes = []
    is_valid = True

    # Check 1: Max Resource Limits
    rescue_limit = resources.get("rescue_teams", Resource(id="r", type="rescue_teams", name="r", total=8, available=8)).available
    ambulance_limit = resources.get("ambulances", Resource(id="a", type="ambulances", name="a", total=5, available=5)).available

    if plan.total_rescue_teams_used > rescue_limit:
        is_valid = False
        notes.append(f"REJECTED: Rescue team allocation ({plan.total_rescue_teams_used}) exceeds available max ({rescue_limit}).")

    if plan.total_ambulances_used > ambulance_limit:
        is_valid = False
        notes.append(f"REJECTED: Ambulance allocation ({plan.total_ambulances_used}) exceeds available max ({ambulance_limit}).")

    if plan.total_supply_percent_used > 100.0:
        is_valid = False
        notes.append(f"REJECTED: Supply allocation ({plan.total_supply_percent_used}%) exceeds 100%.")

    # Check 2: Critical Zone Neglect
    for z in zones:
        item = plan.items.get(z.id)
        if z.severity == SeverityLevel.CRITICAL:
            if not item or (item.rescue_teams == 0 and item.ambulances == 0):
                is_valid = False
                notes.append(f"REJECTED: Critical zone '{z.name}' has 0 rescue teams and 0 ambulances allocated.")

    # Check 3: Blocked road efficiency warning
    for z in zones:
        item = plan.items.get(z.id)
        if z.accessibility <= 0 and item and item.rescue_teams > 0:
            notes.append(f"WARNING: Zone '{z.name}' road is 100% blocked ({z.accessibility}% access). Heavy ground transport cannot proceed directly; air/water deployment required.")

    if is_valid:
        notes.append("PASSED: All hard mathematical and vulnerability constraints verified successfully.")

    return is_valid, notes
