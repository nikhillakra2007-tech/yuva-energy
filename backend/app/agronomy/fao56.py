import math
import logging
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)

def calculate_penman_monteith_et0(
    temp_celsius: float,
    relative_humidity_percentage: float,
    solar_radiation_mj_m2: float,
    wind_speed_m_s: float,
    elevation_meters: float = 200.0,
    latitude_degrees: float = 28.6,
    day_of_year: int = 180,
    temp_min_celsius: Optional[float] = None,
    temp_max_celsius: Optional[float] = None
) -> Dict[str, Any]:
    """
    FAO-56 Penman-Monteith equation for standard daily reference evapotranspiration (ET0).
    References:
        Allen, R. G., et al. (1998). Crop evapotranspiration: Guidelines for computing crop water requirements.
        FAO Irrigation and Drainage Paper No. 56, Rome, Italy.

    Formula:
        ET0 = [ 0.408 * Delta * (Rn - G) + gamma * (900 / (T + 273)) * u2 * (es - ea) ] /
              [ Delta + gamma * (1 + 0.34 * u2) ]

    Returns dictionary containing:
        - et0_mm_day: Reference evapotranspiration in mm/day (physically clamped 0.0 - 25.0)
        - method: 'FAO_56_PENMAN_MONTEITH'
        - intermediate_metrics: net_radiation_mj, slope_vapor_pressure_kpa, psychrometric_constant_kpa, vapor_pressure_deficit_kpa
    """
    # 1. Atmospheric pressure P (kPa) at elevation z (m)
    P = 101.3 * math.pow((293.0 - 0.0065 * elevation_meters) / 293.0, 5.26)

    # 2. Psychrometric constant gamma (kPa/°C)
    gamma = 0.000665 * P

    # 3. Mean temperature T (°C)
    T = temp_celsius

    # 4. Saturation vapor pressure es (kPa)
    # Using T_max and T_min if available, else mean temperature
    if temp_min_celsius is not None and temp_max_celsius is not None:
        es_tmax = 0.6108 * math.exp((17.27 * temp_max_celsius) / (temp_max_celsius + 237.3))
        es_tmin = 0.6108 * math.exp((17.27 * temp_min_celsius) / (temp_min_celsius + 237.3))
        es = (es_tmax + es_tmin) / 2.0
    else:
        es = 0.6108 * math.exp((17.27 * T) / (T + 237.3))

    # 5. Actual vapor pressure ea (kPa) from relative humidity
    ea = es * (max(0.0, min(100.0, relative_humidity_percentage)) / 100.0)

    # 6. Slope of vapor pressure curve Delta (kPa/°C)
    delta = (4098.0 * (0.6108 * math.exp((17.27 * T) / (T + 237.3)))) / math.pow(T + 237.3, 2)

    # 7. Net Radiation Rn (MJ/m2/day)
    # Net solar radiation Rns with albedo 0.23 for reference grass
    Rs = max(0.0, solar_radiation_mj_m2)
    Rns = (1.0 - 0.23) * Rs

    # Extraterrestrial radiation Ra (MJ/m2/day) for clear-sky Rso calculation
    phi = math.radians(latitude_degrees)
    dr = 1.0 + 0.033 * math.cos(2.0 * math.pi * day_of_year / 365.0)
    delta_solar = 0.409 * math.sin((2.0 * math.pi * day_of_year / 365.0) - 1.39)
    omega_s = math.acos(max(-1.0, min(1.0, -math.tan(phi) * math.tan(delta_solar))))
    Gsc = 0.0820  # Solar constant MJ/m2/min
    Ra = (24.0 * 60.0 / math.pi) * Gsc * dr * (
        omega_s * math.sin(phi) * math.sin(delta_solar) +
        math.cos(phi) * math.cos(delta_solar) * math.sin(omega_s)
    )
    Ra = max(0.1, Ra)

    # Clear-sky solar radiation Rso
    Rso = (0.75 + (2e-5 * elevation_meters)) * Ra
    rel_solar = max(0.3, min(1.0, Rs / Rso if Rso > 0 else 0.7))

    # Net longwave radiation Rnl
    sigma = 4.903e-9  # Stefan-Boltzmann constant MJ/K4/m2/day
    T_kelvin = T + 273.16
    Rnl = sigma * math.pow(T_kelvin, 4) * (0.34 - 0.14 * math.sqrt(max(0.0, ea))) * (1.35 * rel_solar - 0.35)
    Rnl = max(0.0, Rnl)

    Rn = Rns - Rnl
    # Soil heat flux G is negligible for daily periods (G ≈ 0)
    G = 0.0

    # 8. Wind speed at 2m height u2 (m/s)
    u2 = max(0.1, min(25.0, wind_speed_m_s))

    # 9. Penman-Monteith numerator & denominator
    num = 0.408 * delta * (Rn - G) + gamma * (900.0 / (T + 273.0)) * u2 * (es - ea)
    den = delta + gamma * (1.0 + 0.34 * u2)

    et0 = num / den if den > 0 else 0.0
    # Physical plausibility clamp
    et0_clamped = max(0.0, min(25.0, round(et0, 2)))

    return {
        "et0_mm_day": et0_clamped,
        "method": "FAO_56_PENMAN_MONTEITH",
        "intermediate_metrics": {
            "atmospheric_pressure_kpa": round(P, 2),
            "psychrometric_constant_kpa": round(gamma, 4),
            "saturation_vapor_pressure_kpa": round(es, 3),
            "actual_vapor_pressure_kpa": round(ea, 3),
            "vapor_pressure_deficit_kpa": round(max(0.0, es - ea), 3),
            "slope_delta_kpa": round(delta, 4),
            "net_radiation_mj_m2": round(Rn, 2),
            "wind_speed_2m_m_s": round(u2, 2)
        }
    }

def calculate_hargreaves_et0(
    temp_mean_celsius: float,
    temp_min_celsius: float,
    temp_max_celsius: float,
    latitude_degrees: float = 28.6,
    day_of_year: int = 180
) -> Dict[str, Any]:
    """
    Hargreaves-Samani (1985) temperature-based reference ET0 equation as robust fallback.
    Formula:
        ET0 = 0.0023 * (T_mean + 17.8) * (T_max - T_min)^0.5 * Ra
    """
    t_diff = max(0.1, temp_max_celsius - temp_min_celsius)
    phi = math.radians(latitude_degrees)
    dr = 1.0 + 0.033 * math.cos(2.0 * math.pi * day_of_year / 365.0)
    delta_solar = 0.409 * math.sin((2.0 * math.pi * day_of_year / 365.0) - 1.39)
    omega_s = math.acos(max(-1.0, min(1.0, -math.tan(phi) * math.tan(delta_solar))))
    Gsc = 0.0820
    Ra = (24.0 * 60.0 / math.pi) * Gsc * dr * (
        omega_s * math.sin(phi) * math.sin(delta_solar) +
        math.cos(phi) * math.cos(delta_solar) * math.sin(omega_s)
    )
    # Convert Ra to equivalent water depth in mm/day (1 MJ/m2 ≈ 0.408 mm)
    Ra_mm = max(0.1, Ra * 0.408)

    et0 = 0.0023 * (temp_mean_celsius + 17.8) * math.sqrt(t_diff) * Ra_mm
    et0_clamped = max(0.0, min(25.0, round(et0, 2)))

    return {
        "et0_mm_day": et0_clamped,
        "method": "HARGREAVES_SAMANI",
        "intermediate_metrics": {
            "temp_range_celsius": round(t_diff, 2),
            "extraterrestrial_radiation_mm": round(Ra_mm, 2)
        }
    }
