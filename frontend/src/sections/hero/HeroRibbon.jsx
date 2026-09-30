import React from 'react';
import { Sun, CloudRain, Wind, Droplets, Thermometer, Zap, Clock, ShieldCheck, AlertCircle } from 'lucide-react';

export default function HeroRibbon({ 
  field, 
  weather, 
  waterBalance, 
  lang = 'en', 
  onEvaluate, 
  isEvaluating 
}) {
  const t = {
    en: {
      fieldOverview: "Real-Time Agro-Solar Intelligence",
      temp: "Ambient Temp",
      humidity: "Rel. Humidity",
      wind: "Wind Speed",
      solar: "Solar Irradiance",
      et0: "Reference ET₀",
      solarWindow: "Solar Pumping Window",
      activeWindow: "11:00 AM - 03:30 PM (Peak Solar)",
      gridAvoided: "Zero Grid Tariff Zone",
      statusOptimal: "Water Status: Adequate",
      statusWarning: "Water Status: Moderate Stress",
      statusCritical: "Water Status: Depletion Exceeded RAW",
      evalEngine: "Re-evaluate Agronomic Engine",
      evaluating: "Computing Balances...",
      cropStage: "Crop Stage",
      rootDepth: "Root Depth",
      awc: "Available Water Capacity"
    },
    hi: {
      fieldOverview: "सजीव कृषि-सौर बुद्धिमत्ता",
      temp: "परिवेशी तापमान",
      humidity: "सापेक्ष आर्द्रता",
      wind: "हवा की गति",
      solar: "सौर विकिरण",
      et0: "संदर्भ वाष्पोत्सर्जन (ET₀)",
      solarWindow: "सौर पम्पिंग समय",
      activeWindow: "सुबह 11:00 - दोपहर 03:30 (सर्वश्रेष्ठ धूप)",
      gridAvoided: "ग्रिड बिजली की पूरी बचत (₹0 दर)",
      statusOptimal: "जल स्थिति: पर्याप्त",
      statusWarning: "जल स्थिति: मध्यम तनाव",
      statusCritical: "जल स्थिति: सिंचाई आवश्यक (RAW समाप्त)",
      evalEngine: "गणना पुनः चलाएं",
      evaluating: "गणना जारी...",
      cropStage: "फसल चरण",
      rootDepth: "जड़ गहराई",
      awc: "उपलब्ध जल क्षमता"
    }
  }[lang] || {};

  const tempVal = weather?.temperature_c != null ? `${weather.temperature_c.toFixed(1)}°C` : '29.4°C';
  const humidityVal = weather?.relative_humidity_pct != null ? `${Math.round(weather.relative_humidity_pct)}%` : '58%';
  const windVal = weather?.wind_speed_ms != null ? `${weather.wind_speed_ms.toFixed(1)} m/s` : '2.3 m/s';
  const solarVal = weather?.solar_radiation_w_m2 != null ? `${Math.round(weather.solar_radiation_w_m2)} W/m²` : '680 W/m²';
  const et0Val = waterBalance?.et0_fao56_mm_day != null ? `${waterBalance.et0_fao56_mm_day.toFixed(2)} mm/day` : '4.65 mm/day';

  // Stress indicator
  const cwsi = waterBalance?.cwsi != null ? waterBalance.cwsi : 0.22;
  const isCritical = cwsi > 0.65;
  const isWarning = cwsi > 0.40 && cwsi <= 0.65;

  return (
    <div style={{ marginBottom: '28px' }}>
      {/* Top Banner Ribbon */}
      <div 
        style={{ 
          padding: '26px 32px',
          background: 'var(--bg-surface)',
          border: '1.5px solid var(--border-card)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-card)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <div className="pulse-dot"></div>
              <span style={{ fontSize: '0.88rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary-emerald)', fontWeight: 800 }}>
                {t.fieldOverview}
              </span>
              <span style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>•</span>
              <span style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                {field ? `${field.name} (${field.area_hectares} ha)` : 'Main Plot (2.4 ha)'}
              </span>
            </div>
            
            <h2 style={{ fontSize: '1.9rem', fontWeight: 800, letterSpacing: '-0.025em', marginBottom: '6px', color: 'var(--text-primary)' }}>
              {field?.crop_name ? field.crop_name : 'Basmati Rice (Pusa 1121)'} 
              <span style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-secondary)', marginLeft: '12px' }}>
                Stage: {field?.crop_growth_stage || 'Mid-Season Vegetative'} (Kc: {waterBalance?.kc_actual || 1.15})
              </span>
            </h2>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', maxWidth: '780px', lineHeight: 1.6 }}>
              Dual crop-coefficient FAO-56 mass balance synchronized with Open-Meteo microclimate, SoilGrids hydraulics, and solar generation.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div className={`badge ${isCritical ? 'badge-critical' : isWarning ? 'badge-warning' : 'badge-optimal'}`} style={{ padding: '8px 16px', fontSize: '0.88rem' }}>
              {isCritical ? <AlertCircle size={15} /> : <ShieldCheck size={15} />}
              {isCritical ? t.statusCritical : isWarning ? t.statusWarning : t.statusOptimal}
            </div>

            <button 
              className="btn-primary" 
              onClick={onEvaluate} 
              disabled={isEvaluating}
              style={{ padding: '10px 20px', fontSize: '0.92rem' }}
            >
              <Zap size={16} />
              {isEvaluating ? t.evaluating : t.evalEngine}
            </button>
          </div>
        </div>

        {/* Telemetry Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', 
          gap: '16px', 
          marginTop: '22px',
          paddingTop: '20px',
          borderTop: '1px solid var(--border-subtle)'
        }}>
          {/* Temperature */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              width: '38px', height: '38px', borderRadius: '10px', 
              background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#dc2626' 
            }}>
              <Thermometer size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>{t.temp}</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{tempVal}</div>
            </div>
          </div>

          {/* Humidity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              width: '38px', height: '38px', borderRadius: '10px', 
              background: 'rgba(2, 132, 199, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--sky-blue)' 
            }}>
              <Droplets size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>{t.humidity}</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{humidityVal}</div>
            </div>
          </div>

          {/* Wind Speed */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              width: '38px', height: '38px', borderRadius: '10px', 
              background: 'rgba(100, 116, 139, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-tertiary)' 
            }}>
              <Wind size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>{t.wind}</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{windVal}</div>
            </div>
          </div>

          {/* Solar Radiation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              width: '38px', height: '38px', borderRadius: '10px', 
              background: 'rgba(217, 119, 6, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--solar-amber)' 
            }}>
              <Sun size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>{t.solar}</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--solar-amber)' }}>{solarVal}</div>
            </div>
          </div>

          {/* ET0 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              width: '38px', height: '38px', borderRadius: '10px', 
              background: 'rgba(5, 150, 105, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--primary-emerald)' 
            }}>
              <CloudRain size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>{t.et0}</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-emerald)' }}>{et0Val}</div>
            </div>
          </div>
        </div>

        {/* Solar Synchronization Bar */}
        <div style={{ 
          marginTop: '18px', 
          padding: '12px 18px', 
          background: 'var(--bg-surface-elevated)', 
          border: '1px solid var(--border-subtle)', 
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Clock size={16} color="var(--solar-amber)" />
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--solar-amber)' }}>
              {t.solarWindow}:
            </span>
            <span style={{ fontSize: '0.88rem', color: 'var(--text-primary)', fontWeight: 600 }}>
              {t.activeWindow}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={15} color="var(--primary-emerald)" />
            <span style={{ fontSize: '0.85rem', color: 'var(--primary-emerald)', fontWeight: 700 }}>
              {t.gridAvoided}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
