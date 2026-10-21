from datetime import datetime
import math
from typing import Dict, Any, List
from app.models.schemas import (
    DisasterScenario, DisasterType, Zone, SeverityLevel, Resource, Incident, Coordinates, ResponseUnit, Facility
)

CITY_PRESETS = {
    "Delhi": {
        "lat": 28.6139,
        "lng": 77.2090,
        "hospitals": ["AIIMS Emergency Trauma Center", "Safdarjung Field Hospital"],
        "shelters": ["Yamuna Flood Relief Shelter", "Rajghat Community Camp"],
        "zone_names": ["Yamuna River Corridor (ISBT)", "Lajpat & Ring Road Sector", "Rohini & North Basin"]
    },
    "Mumbai": {
        "lat": 19.0760,
        "lng": 72.8777,
        "hospitals": ["KEM Hospital Emergency Ward", "Lilavati Field Trauma Center"],
        "shelters": ["Dharavi Relief Shelter", "Bandra Sports Complex Shelter"],
        "zone_names": ["Mithi River & Kurla Sector", "Dharavi High Density Zone", "Andheri West Corridor"]
    },
    "Kathmandu": {
        "lat": 27.6750,
        "lng": 85.3450,
        "hospitals": ["Kathmandu Emergency Trauma Center", "Patan Field Hospital"],
        "shelters": ["Central Relief Shelter (Lekhnath)", "Bhaktapur Community Shelter"],
        "zone_names": ["Zone A — Balkhu & Bagmati Corridor", "Zone B — Chobhar Gorge Sector", "Zone C — Bhaktapur & Hanumante Basin"]
    },
    "Kolkata": {
        "lat": 22.5726,
        "lng": 88.3639,
        "hospitals": ["SSKM Emergency Medical Center", "Calcutta Medical College Unit"],
        "shelters": ["Howrah Bridge Relief Camp", "Salt Lake Stadium Shelter"],
        "zone_names": ["Hooghly Embankment Sector", "Howrah Station Basin", "Salt Lake Inundation Zone"]
    }
}

def generate_procedural_scenario(
    city_name: str,
    disaster_type: DisasterType,
    lat: float,
    lng: float
) -> DisasterScenario:
    now = datetime.now().isoformat()
    scen_id = f"scenario-proc-{int(datetime.now().timestamp())}"
    
    city_data = CITY_PRESETS.get(city_name, {
        "lat": lat,
        "lng": lng,
        "hospitals": [f"{city_name} General Trauma Center", f"{city_name} Field Medical Unit"],
        "shelters": [f"{city_name} Central Relief Camp", f"{city_name} Community Shelter"],
        "zone_names": [f"{city_name} Central Sector", f"{city_name} North Corridor", f"{city_name} South Basin"]
    })

    z_names = city_data["zone_names"]
    hosp_names = city_data["hospitals"]
    shelter_names = city_data["shelters"]

    # Generate 3 zones around target coordinates
    zones = [
        Zone(
            id=f"{scen_id}-z1",
            name=z_names[0],
            population_affected=7500 if disaster_type == DisasterType.FLOOD else 6200,
            severity=SeverityLevel.CRITICAL,
            severity_score=98.0,
            urgency=95.0,
            accessibility=70.0,
            risk_score=92.0,
            risk_factors=[f"{disaster_type.value} breach in urban center", "Submerged power grid"],
            coordinates=Coordinates(x=lat + 0.008, y=lng - 0.015),
            connected_roads=["Main Express Highway", "Central Arterial Feeder"]
        ),
        Zone(
            id=f"{scen_id}-z2",
            name=z_names[1],
            population_affected=4800,
            severity=SeverityLevel.HIGH,
            severity_score=82.0,
            urgency=88.0,
            accessibility=40.0,
            risk_score=85.0,
            risk_factors=["Severe debris flow blocking transport", "Infrastructure damage"],
            coordinates=Coordinates(x=lat - 0.012, y=lng - 0.020),
            connected_roads=["Ring Road South", "Airport Highway"]
        ),
        Zone(
            id=f"{scen_id}-z3",
            name=z_names[2],
            population_affected=3100,
            severity=SeverityLevel.MODERATE,
            severity_score=65.0,
            urgency=60.0,
            accessibility=85.0,
            risk_score=55.0,
            risk_factors=["Inundation in artisan market square"],
            coordinates=Coordinates(x=lat - 0.005, y=lng + 0.025),
            connected_roads=["East Feeder Bypass"]
        )
    ]

    # Generate Facilities
    facilities = [
        Facility(
            id=f"{scen_id}-hosp-1",
            name=hosp_names[0],
            type="hospital",
            capacity=350,
            current_occupancy=240,
            status="active",
            coordinates={"lat": lat + 0.012, "lng": lng - 0.005}
        ),
        Facility(
            id=f"{scen_id}-hosp-2",
            name=hosp_names[1],
            type="hospital",
            capacity=250,
            current_occupancy=170,
            status="active",
            coordinates={"lat": lat - 0.015, "lng": lng - 0.010}
        ),
        Facility(
            id=f"{scen_id}-sh-1",
            name=shelter_names[0],
            type="shelter",
            capacity=900,
            current_occupancy=520,
            status="active",
            coordinates={"lat": lat + 0.002, "lng": lng + 0.018}
        ),
        Facility(
            id=f"{scen_id}-sh-2",
            name=shelter_names[1],
            type="shelter",
            capacity=750,
            current_occupancy=680,
            status="active",
            coordinates={"lat": lat - 0.008, "lng": lng + 0.030}
        )
    ]

    # Generate Response Units
    units = [
        ResponseUnit(
            id=f"{scen_id}-u-rescue-1",
            name=f"{city_name} NDRF Rescue Alpha",
            type="rescue_team",
            capacity=15,
            speed=45.0,
            terrain_access=["road"],
            status="en_route",
            current_position={"lat": lat + 0.020, "lng": lng - 0.010},
            base_position={"lat": lat + 0.020, "lng": lng - 0.010},
            target_name=z_names[0],
            target_position={"lat": lat + 0.008, "lng": lng - 0.015},
            planned_route=[
                {"lat": lat + 0.020, "lng": lng - 0.010},
                {"lat": lat + 0.014, "lng": lng - 0.012},
                {"lat": lat + 0.008, "lng": lng - 0.015}
            ],
            eta_seconds=360
        ),
        ResponseUnit(
            id=f"{scen_id}-u-boat-1",
            name=f"{city_name} Swift Water Boat 01",
            type="boat",
            capacity=20,
            speed=30.0,
            terrain_access=["water", "road"],
            status="en_route",
            current_position={"lat": lat + 0.010, "lng": lng - 0.008},
            base_position={"lat": lat + 0.010, "lng": lng - 0.008},
            target_name=z_names[0],
            target_position={"lat": lat + 0.008, "lng": lng - 0.015},
            planned_route=[
                {"lat": lat + 0.010, "lng": lng - 0.008},
                {"lat": lat + 0.008, "lng": lng - 0.015}
            ],
            eta_seconds=240
        ),
        ResponseUnit(
            id=f"{scen_id}-u-amb-1",
            name=f"{city_name} MedVac Mobile 01",
            type="ambulance",
            capacity=4,
            speed=60.0,
            terrain_access=["road"],
            status="en_route",
            current_position={"lat": lat - 0.002, "lng": lng - 0.005},
            base_position={"lat": lat - 0.002, "lng": lng - 0.005},
            target_name=z_names[1],
            target_position={"lat": lat - 0.012, "lng": lng - 0.020},
            planned_route=[
                {"lat": lat - 0.002, "lng": lng - 0.005},
                {"lat": lat - 0.008, "lng": lng - 0.012},
                {"lat": lat - 0.012, "lng": lng - 0.020}
            ],
            eta_seconds=480
        ),
        ResponseUnit(
            id=f"{scen_id}-u-heli-1",
            name=f"{city_name} Air Chopper Sky 1",
            type="helicopter",
            capacity=25,
            speed=120.0,
            terrain_access=["air"],
            status="en_route",
            current_position={"lat": lat + 0.025, "lng": lng + 0.010},
            base_position={"lat": lat + 0.025, "lng": lng + 0.010},
            target_name=z_names[0],
            target_position={"lat": lat + 0.008, "lng": lng - 0.015},
            planned_route=[
                {"lat": lat + 0.025, "lng": lng + 0.010},
                {"lat": lat + 0.008, "lng": lng - 0.015}
            ],
            eta_seconds=150
        )
    ]

    # Generate Flood Polygons
    flood_polygons = [
        [
            {"lat": lat + 0.015, "lng": lng - 0.025},
            {"lat": lat + 0.020, "lng": lng - 0.005},
            {"lat": lat + 0.002, "lng": lng + 0.005},
            {"lat": lat - 0.005, "lng": lng - 0.020}
        ]
    ]

    incidents = [
        Incident(
            id=f"{scen_id}-inc-101",
            zone_id=f"{scen_id}-z1",
            title=f"Catastrophic {disaster_type.value} Breach in {city_name}",
            description=f"Water/impact levels 4.2m above danger line in {z_names[0]}.",
            severity=SeverityLevel.CRITICAL,
            status="active",
            affected_people=7500,
            coordinates={"lat": lat + 0.008, "lng": lng - 0.015},
            timestamp=now
        )
    ]

    return DisasterScenario(
        id=scen_id,
        title=f"{city_name} {disaster_type.value.title()} Crisis",
        type=disaster_type,
        description=f"Emergency {disaster_type.value.lower()} disaster response operations activated for {city_name} metropolitan sector.",
        status="ACTIVE",
        plan_version=1,
        zones=zones,
        facilities=facilities,
        units=units,
        flood_polygons=flood_polygons,
        incidents=incidents,
        resources={
            "rescue_teams": Resource(id="res-rescue", type="rescue_teams", name=f"{city_name} NDRF Teams", total=8, available=8, assigned=0, unit_label="teams"),
            "ambulances": Resource(id="res-ambulance", type="ambulances", name="Emergency Ambulances", total=5, available=5, assigned=0, unit_label="units"),
            "supply_units": Resource(id="res-supply", type="supply_units", name="Ration Supply Units", total=3, available=3, assigned=0, unit_label="units"),
            "shelter_capacity": Resource(id="res-shelter", type="shelter_capacity", name="Relief Camp Shelter Beds", total=1650, available=1200, assigned=450, unit_label="beds")
        },
        created_at=now,
        updated_at=now
    )
