import logging
from typing import List, Tuple, Dict, Any, Optional
from datetime import datetime, timedelta, timezone
from shapely.geometry import shape

from backend.app.ingestion.base import (
    BaseIngestionProvider, NormalizedSatelliteRecord, ProvenanceInfo, DataMode
)

logger = logging.getLogger(__name__)

class Sentinel2SatelliteProvider(BaseIngestionProvider):
    provider_code = "COPERNICUS_ESA"
    provider_name = "European Space Agency Copernicus (Sentinel-2)"
    collection_code = "SENTINEL_2_L2A"

    def fetch_and_normalize(
        self, field_boundary_geojson: Dict[str, Any], max_cloud_cover: float = 35.0
    ) -> Tuple[List[NormalizedSatelliteRecord], ProvenanceInfo]:
        """
        Query Sentinel-2 granules intersecting field polygon, filtering out high cloud coverage,
        and computing spectral canopy indices (NDVI, EVI, NDRE).
        """
        geom = shape(field_boundary_geojson)
        centroid = geom.centroid
        lon, lat = centroid.x, centroid.y

        now = datetime.now(timezone.utc)
        # Check acquisitions over past 30 days
        start_date = now - timedelta(days=30)

        # STAC / Copernicus Earth Search simulation or test fixture
        mode = DataMode.TEST_FIXTURE
        records = self._simulate_granule_acquisitions(lat, lon, start_date, now, max_cloud_cover)

        prov = ProvenanceInfo(
            source_code=self.provider_code,
            source_name=self.provider_name,
            retrieved_at=now,
            period_start=start_date,
            period_end=now,
            mode=mode,
            is_current=True,
            record_count=len(records),
            metadata={
                "collection": self.collection_code,
                "cloud_filter_max_pct": max_cloud_cover,
                "bands_used": ["B04_RED", "B08_NIR", "B02_BLUE", "B05_RED_EDGE"]
            }
        )
        return records, prov

    def _simulate_granule_acquisitions(
        self, lat: float, lon: float, start: datetime, end: datetime, max_cloud: float
    ) -> List[NormalizedSatelliteRecord]:
        """
        Generates realistic 5-day revisit Sentinel-2 granules with spectral band reflectances.
        """
        records = []
        current = start + timedelta(days=2)
        granule_counter = 1

        while current <= end:
            cloud_pct = round(12.0 + (granule_counter * 7.5) % 30.0, 1)
            if cloud_pct <= max_cloud:
                scene_id = f"S2A_MSIL2A_{current.strftime('%Y%m%d')}_T43RER_R055_{granule_counter:03d}"
                # Simulated surface reflectances for active crop canopy
                # NIR: 0.42 to 0.58, Red: 0.05 to 0.09, Blue: 0.03 to 0.06, RedEdge: 0.22 to 0.28
                nir = 0.45 + (granule_counter * 0.03) % 0.15
                red = 0.07 + (granule_counter * 0.01) % 0.04
                blue = 0.04
                re = 0.24 + (granule_counter * 0.02) % 0.05

                # NDVI = (NIR - Red) / (NIR + Red)
                ndvi = round((nir - red) / (nir + red), 4)

                # EVI = 2.5 * (NIR - Red) / (NIR + 6*Red - 7.5*Blue + 1)
                evi_denom = (nir + 6.0 * red - 7.5 * blue + 1.0)
                evi = round(2.5 * (nir - red) / evi_denom, 4) if evi_denom != 0 else ndvi

                # NDRE = (NIR - RE) / (NIR + RE)
                ndre = round((nir - re) / (nir + re), 4)

                records.append(NormalizedSatelliteRecord(
                    provider_scene_id=scene_id,
                    acquired_at=current,
                    cloud_cover_percentage=cloud_pct,
                    valid_pixel_percentage=round(100.0 - cloud_pct, 1),
                    ndvi_mean=ndvi,
                    ndvi_median=ndvi,
                    ndvi_min=round(ndvi - 0.08, 4),
                    ndvi_max=round(ndvi + 0.06, 4),
                    evi_mean=evi,
                    ndre_mean=ndre,
                    confidence_score=round(max(0.6, 1.0 - (cloud_pct / 100.0)), 3),
                    provenance=DataMode.TEST_FIXTURE.value
                ))
            granule_counter += 1
            current += timedelta(days=5)

        return records
