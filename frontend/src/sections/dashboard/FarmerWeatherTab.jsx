import React from 'react';
import { 
  CloudSun, 
  Sun, 
  Wind, 
  Droplets, 
  Compass, 
  Activity, 
  Calendar,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export default function FarmerWeatherTab({
  weather,
  waterBalance,
  isPunjab,
  lang = 'en'
}) {
  const forecastDays = [
    { day: 'Today', date: '30 Sep', temp: '26°C', cond: 'Partly Cloudy', solar: '820 W/m²', rain: '0%', action: 'Optimal Solar Pumping', safe: true },
    { day: 'Tomorrow', date: '01 Oct', temp: '28°C', cond: 'Clear Sky', solar: '850 W/m²', rain: '5%', action: 'Full Solar Window', safe: true },
    { day: 'Day 3', date: '02 Oct', temp: '27°C', cond: 'Sunny / Haze', solar: '790 W/m²', rain: '10%', action: 'Maintain Schedule', safe: true },
    { day: 'Day 4', date: '03 Oct', temp: '24°C', cond: 'Cloudy / Light Rain', solar: '420 W/m²', rain: '65%', action: 'Rain Inflow Expected — Standby', safe: false },
    { day: 'Day 5', date: '04 Oct', temp: '25°C', cond: 'Scattered Showers', solar: '510 W/m²', rain: '40%', action: 'Soil Recharging Natural', safe: false }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Bar */}
      <div style={{
        background: '#0d181c',
        border: '1.5px solid #1a332d',
        borderRadius: '18px',
        padding: '18px 22px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid #f59e0b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CloudSun size={20} color="#fbbf24" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
              {lang === 'hi' ? 'मौसम व सौर विकिरण टेलीमेट्री' : 'Microclimate & Solar Irradiance Telemetry'}
            </h3>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
              Station: {isPunjab ? 'Mansa Agro-Met AWS (IMD)' : 'Karnal CSSRI Automated Weather Station'} • Real-Time Ingestion
            </span>
          </div>
        </div>

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 12px',
          borderRadius: '9999px',
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid #10b981',
          color: '#34d399',
          fontSize: '0.76rem',
          fontWeight: 800
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
          <span>Live Ingestion Active</span>
        </div>
      </div>

      {/* Row 1: 4 Key Atmospheric Telemetry Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px'
      }}>
        {/* Card 1: Ambient Temp */}
        <div style={{
          background: '#0d181c',
          border: '1.5px solid #1a332d',
          borderRadius: '16px',
          padding: '18px 20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            AMBIENT TEMPERATURE
          </span>
          <div style={{ margin: '8px 0' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ffffff', lineHeight: 1.1 }}>
              26.4°C
            </div>
            <span style={{ fontSize: '0.78rem', color: '#34d399', fontWeight: 600 }}>
              High: 31.0°C • Low: 21.2°C
            </span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '6px' }}>
            Sensor: Calibrated Thermistor Array
          </div>
        </div>

        {/* Card 2: Solar Irradiance */}
        <div style={{
          background: '#0d181c',
          border: '1.5px solid #1a332d',
          borderRadius: '16px',
          padding: '18px 20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            SURFACE SOLAR IRRADIANCE
          </span>
          <div style={{ margin: '8px 0' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fbbf24', lineHeight: 1.1 }}>
              820 W/m²
            </div>
            <span style={{ fontSize: '0.78rem', color: '#f59e0b', fontWeight: 600 }}>
              Peak Solar Noon Window Active
            </span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '6px' }}>
            Pyranometer: Class-A Secondary Standard
          </div>
        </div>

        {/* Card 3: Relative Humidity */}
        <div style={{
          background: '#0d181c',
          border: '1.5px solid #1a332d',
          borderRadius: '16px',
          padding: '18px 20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            RELATIVE HUMIDITY
          </span>
          <div style={{ margin: '8px 0' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#38bdf8', lineHeight: 1.1 }}>
              68%
            </div>
            <span style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600 }}>
              Vapor Pressure Deficit: 1.4 kPa
            </span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '6px' }}>
            Psychrometric Dew Point: 20.1°C
          </div>
        </div>

        {/* Card 4: Wind Velocity */}
        <div style={{
          background: '#0d181c',
          border: '1.5px solid #1a332d',
          borderRadius: '16px',
          padding: '18px 20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            WIND VELOCITY & AZIMUTH
          </span>
          <div style={{ margin: '8px 0' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ffffff', lineHeight: 1.1 }}>
              14 km/h
            </div>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>
              Azimuth: 315° (North-West)
            </span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '6px' }}>
            Anemometer Height: 2.0m Above Ground
          </div>
        </div>
      </div>

      {/* Row 2: Penman-Monteith Evapotranspiration Dual Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '16px'
      }}>
        {/* Card 1: FAO-56 Penman-Monteith Reference vs Crop ETc */}
        <div style={{
          background: '#0d181c',
          border: '1.5px solid #1a332d',
          borderRadius: '16px',
          padding: '18px 20px'
        }}>
          <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            FAO-56 PENMAN-MONTEITH EVAPOTRANSPIRATION
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginTop: '12px' }}>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px 12px', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block' }}>Reference ETo:</span>
              <strong style={{ fontSize: '1.15rem', color: '#ffffff' }}>4.2 mm/d</strong>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px 12px', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block' }}>Crop Factor Kc:</span>
              <strong style={{ fontSize: '1.15rem', color: '#fbbf24' }}>1.15</strong>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px 12px', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block' }}>Actual ETc:</span>
              <strong style={{ fontSize: '1.15rem', color: '#34d399' }}>4.8 mm/d</strong>
            </div>
          </div>
          <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '12px', lineHeight: 1.5 }}>
            Today's crop water demand is 4.8 mm. Daylight solar pump window can replenish this in 42 minutes with zero grid electricity cost.
          </div>
        </div>

        {/* Card 2: 24h Hydrologic Balance */}
        <div style={{
          background: '#0d181c',
          border: '1.5px solid #1a332d',
          borderRadius: '16px',
          padding: '18px 20px'
        }}>
          <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            24-HOUR HYDROLOGIC RECHARGE STATUS
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '12px' }}>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px 12px', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block' }}>Precipitation 24h:</span>
              <strong style={{ fontSize: '1.15rem', color: '#ffffff' }}>0.0 mm</strong>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px 12px', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block' }}>Root Depletion Dr:</span>
              <strong style={{ fontSize: '1.15rem', color: '#34d399' }}>28 mm</strong>
            </div>
          </div>
          <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '12px', lineHeight: 1.5 }}>
            Root moisture is safely below the Readily Available Water limit (RAW = 38 mm). Soil maintains optimal aeration and nutrient mobility.
          </div>
        </div>
      </div>

      {/* Row 3: 5-Day Agro-Meteorological & Solar Pumping Forecast */}
      <div style={{
        background: '#0d181c',
        border: '1.5px solid #1a332d',
        borderRadius: '18px',
        padding: '20px 22px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            5-DAY SOLAR PUMPING & METEOROLOGICAL FORECAST
          </span>
          <span style={{ fontSize: '0.76rem', color: '#94a3b8' }}>
            IMD Numerical Weather Prediction (WRF 3km Resolution)
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
          gap: '12px'
        }}>
          {forecastDays.map((item, idx) => (
            <div
              key={idx}
              style={{
                background: 'rgba(0, 0, 0, 0.25)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '8px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '0.88rem', color: '#ffffff' }}>{item.day}</strong>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{item.date}</span>
              </div>

              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff' }}>{item.temp}</div>
                <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>{item.cond}</div>
              </div>

              <div style={{ fontSize: '0.72rem', color: '#fbbf24' }}>
                Solar: <strong>{item.solar}</strong>
              </div>

              <div style={{ fontSize: '0.72rem', color: item.safe ? '#34d399' : '#f87171' }}>
                Rain Prob: <strong>{item.rain}</strong>
              </div>

              <div style={{
                fontSize: '0.7rem',
                color: item.safe ? '#34d399' : '#fbbf24',
                background: item.safe ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                padding: '4px 6px',
                borderRadius: '6px',
                fontWeight: 600,
                textAlign: 'center'
              }}>
                {item.action}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
