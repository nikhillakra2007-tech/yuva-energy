import logging
import uuid
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, Optional
import psycopg
from psycopg.rows import dict_row

from backend.app.agronomy.fao56 import calculate_penman_monteith_et0, calculate_hargreaves_et0
from backend.app.agronomy.water_balance import (
    calculate_effective_rainfall, calculate_root_zone_water_balance
)

logger = logging.getLogger(__name__)

class AgriculturalIntelligenceEngine:
    @staticmethod
    def evaluate_field(
        conn: psycopg.Connection,
        field_id: str,
        farmer_preferred_language: str = "en"
    ) -> Dict[str, Any]:
        """
        Executes an agronomic evaluation for a field:
        1. Queries field spatial area and crop cycle
        2. Retrieves latest weather, soil, and satellite observations
        3. Computes FAO-56 Penman-Monteith ET0 and crop ETc
        4. Calculates root-zone soil water balance, depletion Dr, and CWSI
        5. Formulates actionable recommendation with full traceability chain
        6. Persists farm_states and recommendations
        """
        now = datetime.now(timezone.utc)

        with conn.cursor(row_factory=dict_row) as cur:
            # 1. Fetch Field Info
            cur.execute(
                """
                SELECT f.id, f.farm_id, f.name, f.area_hectares,
                       ST_Y(ST_Centroid(f.boundary::geometry)) as lat,
                       ST_X(ST_Centroid(f.boundary::geometry)) as lon,
                       f.metadata
                FROM fields f
                WHERE f.id = %s
                """,
                (field_id,)
            )
            field = cur.fetchone()
            if not field:
                raise ValueError(f"Field {field_id} not found")

            area_ha = float(field["area_hectares"] or 1.0)
            area_m2 = area_ha * 10000.0
            lat = float(field["lat"] or 28.6)

            # 2. Fetch Active Crop Cycle & Stage
            cur.execute(
                """
                SELECT cc.id as cycle_id, cc.crop_id, c.name as crop_name,
                       cgs.id as stage_id, cgs.stage_code, cgs.stage_name,
                       cgs.kc_coefficient, cgs.rooting_depth_meters, cgs.depletion_fraction_p
                FROM crop_cycles cc
                JOIN crops c ON cc.crop_id = c.id
                LEFT JOIN LATERAL (
                    SELECT cgs_inner.id, cgs_inner.stage_code, cgs_inner.stage_name,
                           cgs_inner.kc_coefficient, cgs_inner.rooting_depth_meters, cgs_inner.depletion_fraction_p
                    FROM crop_growth_stages cgs_inner
                    WHERE cgs_inner.crop_id = cc.crop_id
                    ORDER BY cgs_inner.stage_order ASC LIMIT 1
                ) cgs ON true
                WHERE cc.field_id = %s AND cc.status = 'ACTIVE'
                LIMIT 1
                """,
                (field_id,)
            )
            crop_info = cur.fetchone()

            cycle_id = crop_info["cycle_id"] if crop_info else None
            stage_id = crop_info["stage_id"] if crop_info else None
            crop_name = crop_info["crop_name"] if crop_info else "General Crop"
            stage_name = crop_info["stage_name"] if crop_info else "Mid Season"
            kc = float(crop_info["kc_coefficient"] or 1.05) if crop_info else 1.0
            root_depth_m = float(crop_info["rooting_depth_meters"] or 0.6) if crop_info else 0.6
            p_depletion = float(crop_info["depletion_fraction_p"] or 0.55) if crop_info else 0.55

            # 3. Fetch Latest Weather Observation
            cur.execute(
                """
                SELECT observed_at, temperature_celsius, relative_humidity_percentage,
                       solar_radiation_mj_m2, wind_speed_m_s, precipitation_mm, reference_et0_mm
                FROM weather_observations
                WHERE field_id = %s
                ORDER BY observed_at DESC LIMIT 1
                """,
                (field_id,)
            )
            weather = cur.fetchone()

            temp_c = float(weather["temperature_celsius"]) if weather and weather["temperature_celsius"] is not None else 28.0
            rh_pct = float(weather["relative_humidity_percentage"]) if weather and weather["relative_humidity_percentage"] is not None else 55.0
            solar_mj = float(weather["solar_radiation_mj_m2"]) if weather and weather["solar_radiation_mj_m2"] is not None else 18.5
            wind_ms = float(weather["wind_speed_m_s"]) if weather and weather["wind_speed_m_s"] is not None else 2.5
            precip_mm = float(weather["precipitation_mm"] or 0.0) if weather else 0.0

            # 4. Fetch Latest Soil Observation
            cur.execute(
                """
                SELECT field_capacity_vwc, wilting_point_vwc, available_water_capacity_mm_per_m, soil_texture_class
                FROM soil_observations
                WHERE field_id = %s
                ORDER BY observed_at DESC LIMIT 1
                """,
                (field_id,)
            )
            soil = cur.fetchone()

            fc_vwc = float(soil["field_capacity_vwc"] or 0.28) if soil else 0.28
            wp_vwc = float(soil["wilting_point_vwc"] or 0.12) if soil else 0.12
            soil_texture = soil["soil_texture_class"] if soil else "SANDY_LOAM"

            # 5. Fetch Latest Satellite NDVI
            cur.execute(
                """
                SELECT vi.mean_value as ndvi, so.acquired_at
                FROM satellite_observations so
                JOIN vegetation_indices vi ON vi.satellite_observation_id = so.id AND vi.index_code = 'NDVI'
                WHERE so.field_id = %s AND so.data_quality_status = 'VALID'
                ORDER BY so.acquired_at DESC LIMIT 1
                """,
                (field_id,)
            )
            sat = cur.fetchone()
            latest_ndvi = float(sat["ndvi"]) if sat and sat["ndvi"] is not None else 0.65

            # 6. Fetch Previous Depletion from latest farm_states if available
            cur.execute(
                """
                SELECT current_root_zone_depletion_mm
                FROM farm_states
                WHERE field_id = %s
                ORDER BY evaluated_at DESC LIMIT 1
                """,
                (field_id,)
            )
            prev_state = cur.fetchone()
            prev_depletion_mm = float(prev_state["current_root_zone_depletion_mm"] or 15.0) if prev_state else 15.0

        # --- AGRONOMIC COMPUTATIONS ---
        # 1. FAO-56 Penman-Monteith ET0
        day_of_year = now.timetuple().tm_yday
        et0_res = calculate_penman_monteith_et0(
            temp_celsius=temp_c,
            relative_humidity_percentage=rh_pct,
            solar_radiation_mj_m2=solar_mj,
            wind_speed_m_s=wind_ms,
            elevation_meters=216.0,
            latitude_degrees=lat,
            day_of_year=day_of_year
        )
        et0_mm = et0_res["et0_mm_day"]

        # 2. Crop Evapotranspiration ETc
        etc_mm = round(kc * et0_mm, 2)

        # 3. Effective Rainfall
        peff_mm = calculate_effective_rainfall(precip_mm)

        # 4. Root Zone Water Balance
        wb_res = calculate_root_zone_water_balance(
            field_capacity_vwc=fc_vwc,
            wilting_point_vwc=wp_vwc,
            rooting_depth_meters=root_depth_m,
            previous_depletion_mm=prev_depletion_mm,
            crop_et_etc_mm=etc_mm,
            effective_precipitation_mm=peff_mm,
            irrigation_applied_mm=0.0,
            depletion_fraction_p=p_depletion
        )

        dr_mm = wb_res["root_zone_depletion_mm"]
        taw_mm = wb_res["total_available_water_taw_mm"]
        raw_mm = wb_res["readily_available_water_raw_mm"]
        cwsi = wb_res["crop_water_stress_index_cwsi"]
        soil_moisture_vwc = wb_res["current_soil_moisture_vwc"]

        # 5. Formulate Decision & Traceability
        irrigation_efficiency = 0.88  # High-efficiency micro-irrigation/drip
        pump_flow_rate_l_min = 150.0  # Standard 3HP agricultural solar pump (~9 m3/hr)

        # Recommended volume replenishment
        target_replenish_mm = dr_mm
        gross_water_litres = round((target_replenish_mm * area_m2) / irrigation_efficiency, 0)
        run_duration_min = round(gross_water_litres / pump_flow_rate_l_min, 0)

        # Determine action type and urgency
        if cwsi >= 0.5:
            action_type = "IRRIGATE_IMMEDIATELY"
            urgency = "CRITICAL"
            title = f"Immediate Irrigation Required for {crop_name}"
            msg_en = f"Crop water stress index reached {cwsi:.2f}. Root zone moisture depletion is {dr_mm:.1f}mm (exceeds safe threshold {raw_mm:.1f}mm). Apply {gross_water_litres:,.0f} L immediately to avert yield loss."
            msg_hi = f"{crop_name} के लिए तत्काल सिंचाई की आवश्यकता है। जल तनाव सूचकांक {cwsi:.2f} तक पहुँच गया है। कृपया {gross_water_litres:,.0f} लीटर पानी दें।"
        elif dr_mm >= raw_mm:
            action_type = "SCHEDULE_IRRIGATION"
            urgency = "HIGH"
            title = f"Schedule Daytime Irrigation for {crop_name}"
            msg_en = f"Root zone depletion ({dr_mm:.1f}mm) has surpassed readily available water ({raw_mm:.1f}mm). Schedule a {run_duration_min:.0f}-minute irrigation cycle ({gross_water_litres:,.0f} L) during peak solar hours."
            msg_hi = f"मिट्टी में नमी कम हो गई है। सौर ऊर्जा का लाभ उठाने के लिए दोपहर के समय {run_duration_min:.0f} मिनट ({gross_water_litres:,.0f} लीटर) सिंचाई करें।"
        elif precip_mm >= 15.0:
            action_type = "HOLD_FOR_RAIN"
            urgency = "LOW"
            title = f"Hold Irrigation — Sufficient Precipitation Recorded"
            msg_en = f"Recent rainfall of {precip_mm:.1f}mm ({peff_mm:.1f}mm effective) has adequately replenished the root zone. Hold irrigation."
            msg_hi = f"हाल ही में {precip_mm:.1f} मिमी बारिश हुई है। अभी सिंचाई रोकने की सलाह दी जाती है।"
            gross_water_litres = 0.0
            run_duration_min = 0.0
        else:
            action_type = "SKIP_IRRIGATION"
            urgency = "LOW"
            title = f"Soil Moisture Optimal for {crop_name}"
            msg_en = f"Root zone moisture is at {soil_moisture_vwc:.2%} VWC. Depletion is within safe limits ({dr_mm:.1f}mm / {raw_mm:.1f}mm RAW). No irrigation needed today."
            msg_hi = f"मिट्टी में नमी का स्तर सामान्य है। आज सिंचाई की आवश्यकता नहीं है।"
            gross_water_litres = 0.0
            run_duration_min = 0.0

        # Optimal action window: Tomorrow between 10:00 AM and 2:00 PM local solar peak
        tomorrow = now + timedelta(days=1)
        window_start = tomorrow.replace(hour=4, minute=30, second=0, microsecond=0)  # 10:00 AM IST
        window_end = tomorrow.replace(hour=8, minute=30, second=0, microsecond=0)    # 2:00 PM IST

        # Solar energy alignment
        solar_pct = 85.0 if action_type in ["SCHEDULE_IRRIGATION", "IRRIGATE_IMMEDIATELY"] else None
        energy_kwh = (run_duration_min / 60.0) * 2.2  # 2.2 kW pump
        saved_inr = round(energy_kwh * 0.85 * 7.5, 2) if solar_pct else None  # Rs 7.5/kWh avoided grid tariff

        # Confidence calculation based on telemetry availability
        confidence = 0.92 if (weather and soil and sat) else 0.78

        # Plain language vernacular message selection
        vernacular_msg = msg_hi if farmer_preferred_language.startswith("hi") else msg_en

        # Complete Traceability Chain Artifact
        traceability = {
            "inputs": {
                "field_area_hectares": area_ha,
                "crop_name": crop_name,
                "crop_growth_stage": stage_name,
                "kc_coefficient": kc,
                "rooting_depth_m": root_depth_m,
                "depletion_fraction_p": p_depletion,
                "soil_texture": soil_texture,
                "field_capacity_vwc": fc_vwc,
                "wilting_point_vwc": wp_vwc,
                "current_temperature_c": temp_c,
                "relative_humidity_pct": rh_pct,
                "solar_radiation_mj": solar_mj,
                "wind_speed_ms": wind_ms,
                "canopy_ndvi": latest_ndvi
            },
            "calculations": {
                "reference_et0_method": et0_res["method"],
                "reference_et0_mm": et0_mm,
                "crop_evapotranspiration_etc_mm": etc_mm,
                "effective_precipitation_mm": peff_mm,
                "total_available_water_taw_mm": taw_mm,
                "readily_available_water_raw_mm": raw_mm,
                "root_zone_depletion_mm": dr_mm,
                "crop_water_stress_index_cwsi": cwsi
            },
            "assumptions": {
                "irrigation_system_efficiency": irrigation_efficiency,
                "pump_flow_rate_litres_per_minute": pump_flow_rate_l_min,
                "solar_daylight_fraction": 0.85,
                "grid_power_cost_inr_per_kwh": 7.50
            },
            "outputs": {
                "action_type": action_type,
                "urgency_level": urgency,
                "water_depth_mm": target_replenish_mm,
                "recommended_volume_litres": gross_water_litres,
                "recommended_duration_minutes": run_duration_min,
                "estimated_solar_energy_pct": solar_pct,
                "estimated_cost_savings_inr": saved_inr
            },
            "confidence": confidence,
            "limitations": [
                "Weather inputs derived from Open-Meteo regional numerical weather model; local microclimate stations provide higher fidelity.",
                "Soil moisture hydraulic parameters derived from ISRIC SoilGrids 250m pedotransfer functions; field capacitance probe calibration recommended.",
                "Pump energy calculations assume 3 HP submersible pump operating at rated hydraulic head."
            ]
        }

        # 6. Database Persistence
        farm_state_id = uuid.uuid4()
        rec_id = uuid.uuid4()

        with conn.cursor() as cur:
            # 6a. Insert farm_states
            cur.execute(
                """
                INSERT INTO farm_states (
                    id, field_id, crop_cycle_id, growth_stage_id, evaluated_at,
                    current_canopy_cover_pct, current_ndvi, current_soil_moisture_vwc,
                    current_root_zone_depletion_mm, daily_etc_mm, water_stress_index_cwsi,
                    data_completeness_score, overall_confidence_score, state_summary_text
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """,
                (
                    farm_state_id, field_id, cycle_id, stage_id, now,
                    min(100.0, max(0.0, latest_ndvi * 100.0)), latest_ndvi, soil_moisture_vwc,
                    dr_mm, etc_mm, cwsi,
                    1.0 if (weather and soil and sat) else 0.8,
                    confidence, f"CWSI={cwsi:.2f}, ETc={etc_mm}mm, Dr={dr_mm:.1f}mm/{taw_mm:.1f}mm"
                )
            )

            # 6b. Insert recommendations
            cur.execute(
                """
                INSERT INTO recommendations (
                    id, field_id, action_type, title, message_vernacular, language_code,
                    action_window_start, action_window_end, recommended_duration_minutes,
                    recommended_volume_litres, estimated_solar_energy_pct, estimated_cost_savings_inr,
                    urgency_level, status, confidence_score
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """,
                (
                    rec_id, field_id, action_type, title, vernacular_msg, farmer_preferred_language,
                    window_start, window_end, run_duration_min,
                    gross_water_litres, solar_pct, saved_inr,
                    urgency, "PENDING", confidence
                )
            )

            # 6c. Insert recommendation reasons
            cur.execute(
                """
                INSERT INTO recommendation_reasons (
                    id, recommendation_id, category, headline, detail_text, display_order
                )
                VALUES (%s, %s, %s, %s, %s, %s)
                """,
                (
                    uuid.uuid4(), rec_id, "SOIL_MOISTURE_DEFICIT",
                    "Root Zone Soil Moisture Deficit",
                    f"Moisture depletion is {dr_mm:.1f} mm against readily available threshold of {raw_mm:.1f} mm (CWSI: {cwsi:.2f}).",
                    1
                )
            )
            cur.execute(
                """
                INSERT INTO recommendation_reasons (
                    id, recommendation_id, category, headline, detail_text, display_order
                )
                VALUES (%s, %s, %s, %s, %s, %s)
                """,
                (
                    uuid.uuid4(), rec_id, "SOLAR_GENERATION_PEAK",
                    "Daylight Solar Pump Window",
                    "Scheduled during daytime peak generation hours to reduce grid electricity cost by up to 85%.",
                    2
                )
            )

        return {
            "recommendation_id": str(rec_id),
            "farm_state_id": str(farm_state_id),
            "field_id": field_id,
            "field_name": field["name"],
            "title": title,
            "message": vernacular_msg,
            "action_type": action_type,
            "urgency_level": urgency,
            "recommended_volume_litres": gross_water_litres,
            "recommended_duration_minutes": run_duration_min,
            "action_window_start": window_start.isoformat(),
            "action_window_end": window_end.isoformat(),
            "confidence_score": confidence,
            "traceability": traceability
        }
