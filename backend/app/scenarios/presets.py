from datetime import datetime
from app.models.schemas import (
    DisasterScenario, DisasterType, Zone, SeverityLevel, Resource, Incident, Coordinates, ResponseUnit, Facility
)

def get_nepal_flood_scenario() -> DisasterScenario:
    now = datetime.now().isoformat()
    return DisasterScenario(
        id="scenario-flood-01",
        title="Nepal Monsoon Crisis — Bagmati & Seti Basin",
        type=DisasterType.FLOOD,
        description="Extreme cloudburst over Nepal central hills triggered catastrophic flash floods, landslides, and river breach across Kathmandu Valley, Kavre, and Pokhara corridor.",
        status="ACTIVE",
        plan_version=1,
        priority_weights={
            "severity": 0.35,
            "population": 0.25,
            "urgency": 0.20,
            "accessibility": 0.10,
            "risk": 0.10
        },
        zones=[
            Zone(
                id="zone-a",
                name="Zone A — Balkhu & Bagmati River Corridor (Kathmandu)",
                population_affected=6800,
                severity=SeverityLevel.CRITICAL,
                severity_score=98.0,
                urgency=95.0,
                accessibility=75.0,
                risk_score=92.0,
                risk_factors=["Bagmati river breach submerged residential settlements", "Submerged power grid", "Kathmandu maternity hospital flooded"],
                coordinates=Coordinates(x=27.6830, y=85.3050),  # x = lat, y = lng
                connected_roads=["Prithvi Highway", "Arniko Highway"]
            ),
            Zone(
                id="zone-b",
                name="Zone B — Chobhar Gorge & Dakshinkali Sector",
                population_affected=4500,
                severity=SeverityLevel.HIGH,
                severity_score=82.0,
                urgency=88.0,
                accessibility=30.0,
                risk_score=85.0,
                risk_factors=["Severe debris flow blocked highway access", "Bridge superstructure damaged", "Isolated mountain hamlets"],
                coordinates=Coordinates(x=27.6500, y=85.2900),  # x = lat, y = lng
                connected_roads=["Dakshinkali Highway", "Ring Road South"]
            ),
            Zone(
                id="zone-c",
                name="Zone C — Bhaktapur & Hanumante Basin",
                population_affected=3200,
                severity=SeverityLevel.MODERATE,
                severity_score=65.0,
                urgency=60.0,
                accessibility=85.0,
                risk_score=55.0,
                risk_factors=["Hanumante river inundation in historic town square", "Displaced weavers and artisan families"],
                coordinates=Coordinates(x=27.6720, y=85.4280),  # x = lat, y = lng
                connected_roads=["Arniko Highway", "Bhaktapur Main Feeder"]
            )
        ],
        facilities=[
            Facility(
                id="shelter-1",
                name="Central Flood Relief Shelter (Lekhnath)",
                type="shelter",
                capacity=800,
                current_occupancy=450,
                status="active",
                coordinates={"lat": 27.675, "lng": 85.345}
            ),
            Facility(
                id="shelter-2",
                name="Bhaktapur Community Shelter",
                type="shelter",
                capacity=700,
                current_occupancy=650,
                status="active",
                coordinates={"lat": 27.670, "lng": 85.420}
            ),
            Facility(
                id="hospital-1",
                name="Kathmandu Emergency Trauma Center",
                type="hospital",
                capacity=300,
                current_occupancy=210,
                status="active",
                coordinates={"lat": 27.688, "lng": 85.315}
            ),
            Facility(
                id="hospital-2",
                name="Patan Field Hospital",
                type="hospital",
                capacity=200,
                current_occupancy=140,
                status="active",
                coordinates={"lat": 27.665, "lng": 85.320}
            )
        ],
        units=[
            ResponseUnit(
                id="unit-rescue-1",
                name="NDRF Rescue Alpha",
                type="rescue_team",
                capacity=15,
                speed=45.0,
                terrain_access=["road"],
                status="en_route",
                current_position={"lat": 27.695, "lng": 85.335},
                base_position={"lat": 27.695, "lng": 85.335},
                target_id="inc-nepal-101",
                target_name="Bagmati Embankment Collapse at Balkhu Bridge",
                target_position={"lat": 27.683, "lng": 85.305},
                planned_route=[
                    {"lat": 27.695, "lng": 85.335},
                    {"lat": 27.690, "lng": 85.320},
                    {"lat": 27.683, "lng": 85.305}
                ],
                eta_seconds=420
            ),
            ResponseUnit(
                id="unit-boat-1",
                name="Amphibious Swift Boat 01",
                type="boat",
                capacity=20,
                speed=30.0,
                terrain_access=["water", "road"],
                status="en_route",
                current_position={"lat": 27.688, "lng": 85.312},
                base_position={"lat": 27.688, "lng": 85.312},
                target_id="inc-nepal-101",
                target_name="Bagmati Embankment Collapse at Balkhu Bridge",
                target_position={"lat": 27.683, "lng": 85.305},
                planned_route=[
                    {"lat": 27.688, "lng": 85.312},
                    {"lat": 27.685, "lng": 85.308},
                    {"lat": 27.683, "lng": 85.305}
                ],
                eta_seconds=300
            ),
            ResponseUnit(
                id="unit-ambulance-1",
                name="MedVac Mobile 01",
                type="ambulance",
                capacity=4,
                speed=60.0,
                terrain_access=["road"],
                status="en_route",
                current_position={"lat": 27.672, "lng": 85.330},
                base_position={"lat": 27.672, "lng": 85.330},
                target_id="inc-nepal-102",
                target_name="Mass Landslide at Chobhar Cut",
                target_position={"lat": 27.650, "lng": 85.290},
                planned_route=[
                    {"lat": 27.672, "lng": 85.330},
                    {"lat": 27.660, "lng": 85.305},
                    {"lat": 27.650, "lng": 85.290}
                ],
                eta_seconds=540
            ),
            ResponseUnit(
                id="unit-rescue-2",
                name="NDRF Rescue Bravo",
                type="rescue_team",
                capacity=12,
                speed=45.0,
                terrain_access=["road"],
                status="idle",
                current_position={"lat": 27.668, "lng": 85.410},
                base_position={"lat": 27.668, "lng": 85.410},
                target_id=None,
                target_name=None,
                target_position=None,
                planned_route=[],
                eta_seconds=0
            ),
            ResponseUnit(
                id="unit-heli-1",
                name="Air-Relief Chopper Sky 1",
                type="helicopter",
                capacity=25,
                speed=120.0,
                terrain_access=["air"],
                status="en_route",
                current_position={"lat": 27.700, "lng": 85.350},
                base_position={"lat": 27.700, "lng": 85.350},
                target_id="inc-nepal-101",
                target_name="Bagmati Embankment Collapse at Balkhu Bridge",
                target_position={"lat": 27.683, "lng": 85.305},
                planned_route=[
                    {"lat": 27.700, "lng": 85.350},
                    {"lat": 27.683, "lng": 85.305}
                ],
                eta_seconds=180
            )
        ],
        flood_polygons=[
            [
                {"lat": 27.690, "lng": 85.295},
                {"lat": 27.695, "lng": 85.315},
                {"lat": 27.675, "lng": 85.325},
                {"lat": 27.670, "lng": 85.300}
            ],
            [
                {"lat": 27.655, "lng": 85.280},
                {"lat": 27.660, "lng": 85.300},
                {"lat": 27.645, "lng": 85.305},
                {"lat": 27.640, "lng": 85.285}
            ]
        ],
        resources={
            "rescue_teams": Resource(
                id="res-rescue",
                type="rescue_teams",
                name="Nepal Disaster Response Force (NDRF) Teams",
                total=8,
                available=8,
                assigned=0,
                unit_label="teams"
            ),
            "ambulances": Resource(
                id="res-ambulance",
                type="ambulances",
                name="Emergency Ambulances & Field Medics",
                total=5,
                available=5,
                assigned=0,
                unit_label="units"
            ),
            "supply_units": Resource(
                id="res-supply",
                type="supply_units",
                name="Helicopter & Ground Ration Supplies",
                total=3,
                available=3,
                assigned=0,
                unit_label="units"
            ),
            "shelter_capacity": Resource(
                id="res-shelter",
                type="shelter_capacity",
                name="Relief Camp Shelter Beds",
                total=1500,
                available=1100,
                assigned=400,
                unit_label="beds"
            )
        },
        incidents=[
            Incident(
                id="inc-nepal-101",
                zone_id="zone-a",
                title="Bagmati Embankment Collapse at Balkhu Bridge",
                description="Water rising 4.2m above danger mark. Submerged low-lying squatter settlements.",
                severity=SeverityLevel.CRITICAL,
                status="active",
                affected_people=6800,
                coordinates={"lat": 27.6830, "lng": 85.3050},
                timestamp=now
            ),
            Incident(
                id="inc-nepal-102",
                zone_id="zone-b",
                title="Mass Landslide at Chobhar Cut",
                description="Highway to Dakshinkali completely blocked by 5,000 cubic meters of mud and rock debris.",
                severity=SeverityLevel.HIGH,
                status="active",
                affected_people=4500,
                coordinates={"lat": 27.6500, "lng": 85.2900},
                timestamp=now
            )
        ],
        created_at=now,
        updated_at=now
    )

get_urban_flood_scenario = get_nepal_flood_scenario

def get_earthquake_scenario() -> DisasterScenario:
    now = datetime.now().isoformat()
    return DisasterScenario(
        id="scenario-quake-02",
        title="Nepal Seismic Crisis — Gorkha & Mustang Fault",
        type=DisasterType.EARTHQUAKE,
        description="Magnitude 7.4 seismic strike caused landslides, mountain road blockages, and building collapses.",
        status="ACTIVE",
        plan_version=1,
        priority_weights={
            "severity": 0.40,
            "population": 0.25,
            "urgency": 0.15,
            "accessibility": 0.10,
            "risk": 0.10
        },
        zones=[
            Zone(
                id="zone-eq-1",
                name="Zone 1 — Gorkha Epicenter Sector",
                population_affected=5200,
                severity=SeverityLevel.CRITICAL,
                severity_score=98.0,
                urgency=95.0,
                accessibility=25.0,
                risk_score=90.0,
                risk_factors=["Historic stone masonry collapsed", "Mountain pass blocked"],
                coordinates=Coordinates(x=28.0000, y=84.6250)
            ),
            Zone(
                id="zone-eq-2",
                name="Zone 2 — Pokhara Valley Sector",
                population_affected=3800,
                severity=SeverityLevel.HIGH,
                severity_score=72.0,
                urgency=68.0,
                accessibility=80.0,
                risk_score=50.0,
                risk_factors=["Ground liquefaction near Phewa lake", "Bridge structural cracks"],
                coordinates=Coordinates(x=28.2096, y=83.9856)
            )
        ],
        resources={
            "rescue_teams": Resource(id="res-r", type="rescue_teams", name="Search & Rescue", total=12, available=12, assigned=0, unit_label="teams"),
            "ambulances": Resource(id="res-a", type="ambulances", name="Medical Units", total=10, available=10, assigned=0, unit_label="units"),
            "supply_units": Resource(id="res-s", type="supply_units", name="Food & Water Trucks", total=5, available=5, assigned=0, unit_label="units"),
            "shelter_capacity": Resource(id="res-sh", type="shelter_capacity", name="Camp Tents", total=2000, available=1500, assigned=500, unit_label="beds")
        },
        facilities=[],
        units=[],
        incidents=[],
        created_at=now,
        updated_at=now
    )

PRESET_SCENARIOS = {
    "scenario-flood-01": get_nepal_flood_scenario,
    "scenario-quake-02": get_earthquake_scenario
}
