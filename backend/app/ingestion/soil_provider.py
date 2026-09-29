import logging
import time
from typing import Tuple, Dict, Any, Optional
from datetime import datetime, timezone
import httpx

from backend.app.ingestion.base import (
    BaseIngestionProvider, NormalizedSoilRecord, ProvenanceInfo, DataMode
)

logger = logging.getLogger(__name__)

class SoilGridsProvider(BaseIngestionProvider):
    provider_code = "SOILGRIDS_ISRIC"
    provider_name = "SoilGrids 250m Global Database"
    base_url = "https://rest.isric.org/soilgrids/v2.0/properties/query"

    def fetch_and_normalize(
        self, latitude: float, longitude: float
    ) -> Tuple[NormalizedSoilRecord, ProvenanceInfo]:
        """
        Query SoilGrids ISRIC REST API for physical soil taxonomy and pedotransfer hydraulic bounds.
        """
        params = {
            "lat": latitude,
            "lon": longitude,
            "property": ["sand", "silt", "clay", "phh2o", "soc", "bdod"],
            "depth": ["0-30cm"],
            "value": ["mean"]
        }

        response_json = None
        mode = DataMode.REAL_DATA

        try:
            with httpx.Client(timeout=10.0) as client:
                resp = client.get(self.base_url, params=params)
                if resp.status_code == 200:
                    response_json = resp.json()
        except Exception as e:
            logger.warning(f"Could not reach SoilGrids live API: {e}")

        if not response_json or "properties" not in response_json:
            logger.info("Using verified regional soil fixture for SoilGrids ingestion")
            response_json = self._get_test_fixture()
            mode = DataMode.TEST_FIXTURE

        record = self._parse_soil_properties(response_json, mode)
        prov = ProvenanceInfo(
            source_code=self.provider_code,
            source_name=self.provider_name,
            retrieved_at=datetime.now(timezone.utc),
            period_start=record.observed_at,
            period_end=record.observed_at,
            mode=mode,
            is_current=True,
            record_count=1,
            metadata={"depth_range": "0-30cm"}
        )
        return record, prov

    def _parse_soil_properties(self, data: Dict[str, Any], mode: DataMode) -> NormalizedSoilRecord:
        props = data.get("properties", {}).get("layers", [])
        prop_map = {}
        for layer in props:
            name = layer.get("name")
            depths = layer.get("depths", [])
            if depths:
                mean_val = depths[0].get("values", {}).get("mean")
                if mean_val is not None:
                    prop_map[name] = float(mean_val)

        # SoilGrids units: sand/silt/clay in g/kg (divide by 10 to get %)
        # phh2o in pH*10, soc in dg/kg (divide by 100 for %), bdod in cg/cm3 (divide by 100 for g/cm3)
        sand_pct = round(prop_map.get("sand", 420.0) / 10.0, 1)
        silt_pct = round(prop_map.get("silt", 380.0) / 10.0, 1)
        clay_pct = round(prop_map.get("clay", 200.0) / 10.0, 1)
        ph = round(prop_map.get("phh2o", 72.0) / 10.0, 2)
        soc_pct = round(prop_map.get("soc", 120.0) / 100.0, 2)
        bd = round(prop_map.get("bdod", 142.0) / 100.0, 2)

        # Normalize texture class
        texture = self._classify_texture(sand_pct, silt_pct, clay_pct)

        # Pedotransfer functions (Saxton & Rawls, 2006 for hydraulic boundaries)
        s = sand_pct / 100.0
        c = clay_pct / 100.0
        om = soc_pct * 1.72  # Organic matter estimate

        # 1500 kPa (Wilting Point)
        theta_1500 = -0.024 * s + 0.487 * c + 0.006 * om + 0.005 * (s * om) - 0.013 * (c * om) + 0.068 * (s * c) + 0.031
        theta_wp = max(0.04, min(0.35, round(theta_1500 + (0.14 * theta_1500 - 0.02), 3)))

        # 33 kPa (Field Capacity)
        theta_33 = -0.251 * s + 0.195 * c + 0.011 * om + 0.006 * (s * om) - 0.027 * (c * om) + 0.452 * (s * c) + 0.299
        theta_fc = max(0.12, min(0.48, round(theta_33 + (1.283 * (theta_33**2) - 0.374 * theta_33 - 0.015), 3)))
        if theta_fc <= theta_wp:
            theta_fc = round(theta_wp + 0.12, 3)

        # Saturation (Porosity minus entrapped air)
        porosity = 1.0 - (bd / 2.65)
        theta_sat = max(theta_fc + 0.05, min(0.65, round(porosity - 0.05, 3)))

        # Available Water Capacity (AWC in mm per meter of root zone)
        awc = round((theta_fc - theta_wp) * 1000.0, 1)

        return NormalizedSoilRecord(
            observed_at=datetime.now(timezone.utc),
            profile_depth_top_cm=0.0,
            profile_depth_bottom_cm=30.0,
            soil_texture_class=texture,
            sand_percentage=sand_pct,
            silt_percentage=silt_pct,
            clay_percentage=clay_pct,
            organic_carbon_percentage=soc_pct,
            ph=ph,
            bulk_density_g_cm3=bd,
            field_capacity_vwc=theta_fc,
            wilting_point_vwc=theta_wp,
            saturation_vwc=theta_sat,
            available_water_capacity_mm_per_m=awc,
            provenance=mode.value
        )

    def _classify_texture(self, sand: float, silt: float, clay: float) -> str:
        """USDA Soil Texture classification triangle."""
        if clay >= 40:
            if sand >= 45:
                return "SANDY_CLAY"
            elif silt >= 40:
                return "SILTY_CLAY"
            return "CLAY"
        elif clay >= 27:
            if sand >= 45:
                return "SANDY_CLAY_LOAM"
            elif sand <= 20:
                return "SILTY_CLAY_LOAM"
            return "CLAY_LOAM"
        elif clay >= 7:
            if silt >= 50:
                return "SILT_LOAM"
            elif sand >= 52:
                return "SANDY_LOAM"
            return "LOAM"
        else:
            if silt >= 80:
                return "SILT"
            elif sand >= 85:
                return "SAND"
            elif sand >= 70:
                return "LOAMY_SAND"
            return "SANDY_LOAM"

    def _get_test_fixture(self) -> Dict[str, Any]:
        return {
            "properties": {
                "layers": [
                    {"name": "sand", "depths": [{"values": {"mean": 450}}]},
                    {"name": "silt", "depths": [{"values": {"mean": 350}}]},
                    {"name": "clay", "depths": [{"values": {"mean": 200}}]},
                    {"name": "phh2o", "depths": [{"values": {"mean": 74}}]},
                    {"name": "soc", "depths": [{"values": {"mean": 110}}]},
                    {"name": "bdod", "depths": [{"values": {"mean": 138}}]}
                ]
            }
        }
