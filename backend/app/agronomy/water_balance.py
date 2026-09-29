import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

def calculate_effective_rainfall(precipitation_mm: float) -> float:
    """
    USDA Soil Conservation Service (SCS) method for daily effective rainfall (P_eff).
    Only precipitation that infiltrates and remains stored in the crop root zone is effective.
    Runoff and deep percolation are subtracted.
    """
    p = max(0.0, precipitation_mm)
    if p <= 8.3:
        # Light rainfall is immediately intercepted by canopy or evaporated from soil surface
        return 0.0
    elif p <= 75.0:
        # USDA-SCS standard empirical polynomial
        peff = (p * (125.0 - 0.2 * p)) / 125.0
        return round(max(0.0, peff), 2)
    else:
        # Excess precipitation beyond 75mm results in heavy surface runoff
        peff = (0.1 * p) + 12.5
        return round(max(0.0, peff), 2)

def calculate_root_zone_water_balance(
    field_capacity_vwc: float,
    wilting_point_vwc: float,
    rooting_depth_meters: float,
    previous_depletion_mm: float,
    crop_et_etc_mm: float,
    effective_precipitation_mm: float,
    irrigation_applied_mm: float = 0.0,
    depletion_fraction_p: float = 0.55
) -> Dict[str, Any]:
    """
    FAO-56 Daily Root Zone Water Balance model.
    Inputs:
        - field_capacity_vwc (theta_FC): volumetric water content at field capacity (e.g. 0.30)
        - wilting_point_vwc (theta_WP): volumetric water content at permanent wilting point (e.g. 0.14)
        - rooting_depth_meters (Zr): active effective crop rooting depth in meters (e.g. 0.6m)
        - previous_depletion_mm (Dr,prev): root zone moisture depletion from previous day
        - crop_et_etc_mm (ETc): unadjusted crop evapotranspiration (Kc * ET0)
        - effective_precipitation_mm (Peff): infiltration from rainfall
        - irrigation_applied_mm (I): water applied via irrigation
        - depletion_fraction_p (p): fraction of TAW that crop can extract without water stress (0.2 - 0.8)

    Equations:
        TAW = 1000 * (theta_FC - theta_WP) * Zr  [Total Available Water, mm]
        RAW = p * TAW                             [Readily Available Water, mm]
        Dr = Dr,prev - Peff - I + ETc             [Root Zone Depletion, mm]
        Ks = (TAW - Dr) / ((1 - p) * TAW) if Dr > RAW else 1.0  [Water Stress Coefficient]
        ETc,adj = Ks * ETc                        [Stress-adjusted ETc]
        CWSI = 1.0 - (ETc,adj / ETc)              [Crop Water Stress Index: 0.0=optimal, 1.0=severe stress]
    """
    Zr = max(0.1, rooting_depth_meters)
    # Available water capacity in volumetric terms
    theta_awc = max(0.02, field_capacity_vwc - wilting_point_vwc)

    # 1. Total Available Water (mm)
    taw = 1000.0 * theta_awc * Zr

    # 2. Readily Available Water (mm)
    p = max(0.1, min(0.85, depletion_fraction_p))
    raw = p * taw

    # 3. Mass balance water depletion
    raw_depletion = previous_depletion_mm - effective_precipitation_mm - irrigation_applied_mm + crop_et_etc_mm
    # Bounds: 0 <= Dr <= TAW (deep drainage removes water above FC, root uptake halts at WP)
    dr = max(0.0, min(taw, raw_depletion))

    # 4. Water stress coefficient Ks
    if dr <= raw:
        ks = 1.0
    else:
        # Transpiration reduction factor
        ks = (taw - dr) / ((1.0 - p) * taw) if (1.0 - p) * taw > 0 else 0.0
        ks = max(0.0, min(1.0, ks))

    # 5. Adjusted crop evapotranspiration
    etc_adj = ks * crop_et_etc_mm

    # 6. Crop Water Stress Index (CWSI)
    cwsi = 1.0 - (etc_adj / crop_et_etc_mm) if crop_et_etc_mm > 0 else 0.0
    cwsi = max(0.0, min(1.0, round(cwsi, 3)))

    # 7. Current effective root zone soil moisture VWC
    # Soil moisture theta = theta_FC - (Dr / (1000 * Zr))
    current_vwc = field_capacity_vwc - (dr / (1000.0 * Zr))
    current_vwc = max(wilting_point_vwc, min(field_capacity_vwc, current_vwc))

    # 8. Irrigation deficit (mm to replenish root zone to field capacity)
    irrigation_deficit_mm = dr

    return {
        "total_available_water_taw_mm": round(taw, 2),
        "readily_available_water_raw_mm": round(raw, 2),
        "root_zone_depletion_mm": round(dr, 2),
        "depletion_percentage_of_taw": round((dr / taw * 100.0) if taw > 0 else 0.0, 1),
        "is_water_stressed": dr > raw,
        "water_stress_coefficient_ks": round(ks, 3),
        "adjusted_etc_mm": round(etc_adj, 2),
        "crop_water_stress_index_cwsi": cwsi,
        "current_soil_moisture_vwc": round(current_vwc, 4),
        "irrigation_deficit_mm": round(irrigation_deficit_mm, 2)
    }
