from typing import List, Dict, Tuple
from app.models.schemas import Zone

DEFAULT_WEIGHTS = {
    "severity": 0.35,
    "population": 0.25,
    "urgency": 0.20,
    "accessibility": 0.10, # Note: Lower accessibility can increase rescue urgency, but for routing high accessibility makes deployment faster
    "risk": 0.10
}

def calculate_zone_priority(zone: Zone, max_population: int = 5000, weights: Dict[str, float] = None) -> Tuple[float, Dict[str, float]]:
    """
    Calculates deterministic priority score for a zone (0 to 100 scale).
    Formula:
      Score = w1 * severity_score + w2 * norm_pop + w3 * urgency + w4 * (100 - accessibility) + w5 * risk_score
      (Note: We use (100 - accessibility) so hard-to-access high-vulnerability zones get priority weight, 
       or accessibility coefficient adjusted appropriately).
    """
    if weights is None:
        weights = DEFAULT_WEIGHTS

    norm_pop = min(100.0, (zone.population_affected / max(1, max_population)) * 100.0)
    
    # Accessibility impact: Hard to reach zones have higher emergency urgency modifier
    access_modifier = 100.0 - zone.accessibility if zone.accessibility < 50 else (100.0 - zone.accessibility * 0.5)

    factors = {
        "severity": round(zone.severity_score * weights.get("severity", 0.35), 2),
        "population": round(norm_pop * weights.get("population", 0.25), 2),
        "urgency": round(zone.urgency * weights.get("urgency", 0.20), 2),
        "accessibility": round(access_modifier * weights.get("accessibility", 0.10), 2),
        "risk": round(zone.risk_score * weights.get("risk", 0.10), 2)
    }

    raw_total = sum(factors.values())
    priority_score = round(min(100.0, max(0.0, raw_total)), 2)

    return priority_score, factors

def compute_all_zone_priorities(zones: List[Zone], weights: Dict[str, float] = None) -> List[Zone]:
    """
    Computes priority scores for all zones in place.
    """
    if not zones:
        return zones

    max_pop = max(z.population_affected for z in zones) if zones else 5000

    for zone in zones:
        score, factors = calculate_zone_priority(zone, max_population=max_pop, weights=weights)
        zone.priority_score = score
        zone.priority_factors = factors

    return zones
