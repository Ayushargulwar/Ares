import math
from typing import List, Dict, Tuple, Any
from app.models.schemas import DisasterScenario, NearestResourceInfo

def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculates Haversine distance in kilometers between two GPS coordinates.
    """
    R = 6371.0  # Earth's radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)

def calculate_nearest_resources(
    lat: float,
    lng: float,
    scenario: DisasterScenario
) -> Tuple[List[NearestResourceInfo], int, List[NearestResourceInfo]]:
    """
    Given disaster coordinates (lat, lng), calculates:
    1. Nearest hospitals sorted by distance
    2. Count of ambulances within 10km radius
    3. Nearest response units (ambulances, rescue teams, boats, choppers) sorted by distance
    """
    nearest_hospitals: List[NearestResourceInfo] = []
    nearest_units: List[NearestResourceInfo] = []
    ambulances_count_nearby = 0

    # 1. Evaluate Facilities (Hospitals & Shelters)
    if scenario.facilities:
        for f in scenario.facilities:
            f_lat = f.coordinates.get("lat", 27.67)
            f_lng = f.coordinates.get("lng", 85.34)
            dist = haversine_distance_km(lat, lng, f_lat, f_lng)
            
            beds_avail = f.capacity - f.current_occupancy
            cap_label = f"{beds_avail} beds free" if beds_avail > 0 else "FULL"
            
            info = NearestResourceInfo(
                name=f.name,
                type=f.type,
                distance_km=dist,
                capacity_or_eta=cap_label,
                status=f.status,
                coordinates=f.coordinates
            )
            
            if f.type == "hospital":
                nearest_hospitals.append(info)

    # Sort hospitals by distance
    nearest_hospitals.sort(key=lambda x: x.distance_km)

    # 2. Evaluate Response Units
    if scenario.units:
        for u in scenario.units:
            u_lat = u.current_position.get("lat", 27.68)
            u_lng = u.current_position.get("lng", 85.31)
            dist = haversine_distance_km(lat, lng, u_lat, u_lng)

            if u.type == "ambulance":
                if dist <= 12.0 and u.status != "blocked":
                    ambulances_count_nearby += 1

            eta_mins = round((dist / max(10.0, u.speed)) * 60)
            eta_label = f"{eta_mins} mins ETA ({dist} km)"

            nearest_units.append(NearestResourceInfo(
                name=u.name,
                type=u.type,
                distance_km=dist,
                capacity_or_eta=eta_label,
                status=u.status,
                coordinates=u.current_position
            ))

    # Sort units by distance
    nearest_units.sort(key=lambda x: x.distance_km)

    return nearest_hospitals, ambulances_count_nearby, nearest_units
