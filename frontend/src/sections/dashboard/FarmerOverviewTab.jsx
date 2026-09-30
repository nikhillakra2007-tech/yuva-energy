import React from 'react';
import { 
  CheckCircle2, 
  Leaf, 
  Zap, 
  CloudSun, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export default function FarmerOverviewTab({
  currentProfile,
  fieldTabs,
  selectedFieldTab,
  setSelectedFieldTab,
  onNavigateToTab,
  isPunjab,
  lang = 'en'
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* ROW 1: TOP 3 CARDS (Farm Console + Verified Farmer Card + Solar Pump Telemetry) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '18px',
        alignItems: 'stretch'
      }}>
        {/* Top Card 1: Farm Console Field Selector */}
        <div style={{
          background: '#0d181c',
          border: '1.5px solid #1a332d',
          borderRadius: '18px',
          padding: '18px 20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
        }}>
          <div>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              FARM CONSOLE
            </span>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', margin: '4px 0 14px 0' }}>
              Active Field Plots
            </h3>

            {/* Field Tabs */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {fieldTabs.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelectedFieldTab(f.id)}
                  style={{
                    flex: 1,
                    minWidth: '85px',
                    padding: '10px 12px',
                    borderRadius: '12px',
                    background: selectedFieldTab === f.id ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                    border: selectedFieldTab === f.id ? '1.5px solid #10b981' : '1px solid rgba(255, 255, 255, 0.1)',
                    color: selectedFieldTab === f.id ? '#34d399' : '#cbd5e1',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.18s'
                  }}
                >
                  <Leaf size={16} color={selectedFieldTab === f.id ? '#10b981' : '#64748b'} style={{ margin: '0 auto 4px auto' }} />
                  <span style={{ fontSize: '0.84rem', fontWeight: 700, display: 'block' }}>{f.crop}</span>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{f.area}</span>
                </button>
              ))}
            </div>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '14px',
            paddingTop: '12px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            fontSize: '0.82rem'
          }}>
            <span style={{ color: '#34d399', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
              Status: Optimal Hydration
            </span>

            <button
              onClick={() => onNavigateToTab('fields')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#38bdf8',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span>Inspect Map</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Top Card 2: Verified Farmer Identity Card */}
        <div style={{
          background: '#0d181c',
          border: '1.5px solid #1a332d',
          borderRadius: '18px',
          padding: '18px 20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                VERIFIED FARMER IDENTITY CARD
              </span>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '3px 8px',
                borderRadius: '9999px',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid #10b981',
                color: '#34d399',
                fontSize: '0.7rem',
                fontWeight: 800
              }}>
                <CheckCircle2 size={12} />
                <span>Verified: {isPunjab ? 'Punjab' : 'Haryana'}</span>
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #f59e0b 0%, #10b981 100%)',
                padding: '2px',
                flexShrink: 0
              }}>
                <div style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  background: '#132328',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.4rem'
                }}>
                  👨‍🌾
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                    {isPunjab ? 'Baljit Singh' : 'Rajesh Kumar'}
                  </h4>
                  <CheckCircle2 size={16} color="#38bdf8" />
                </div>
                <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '2px' }}>
                  Farmer ID: <strong style={{ color: '#cbd5e1' }}>YUE77410</strong> • +91 98120 44521
                </div>
                <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                  📍 {isPunjab ? 'Mansa, Punjab, India' : 'Karnal, Haryana, India'}
                </div>
              </div>
            </div>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '12px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            fontSize: '0.78rem'
          }}>
            <div>
              <span style={{ color: '#94a3b8' }}>Annual Tariff Saved: </span>
              <strong style={{ color: '#34d399' }}>₹94,200/yr saved</strong>
            </div>
            <div style={{
              padding: '2px 8px',
              borderRadius: '6px',
              background: 'rgba(245, 158, 11, 0.15)',
              color: '#fbbf24',
              fontWeight: 800,
              fontSize: '0.72rem'
            }}>
              PM-KUSUM Component C
            </div>
          </div>
        </div>

        {/* Top Card 3: Solar Pump Telemetry */}
        <div style={{
          background: '#0d181c',
          border: '1.5px solid #1a332d',
          borderRadius: '18px',
          padding: '18px 20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                SOLAR PUMP TELEMETRY
              </span>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 8px',
                borderRadius: '9999px',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid #10b981',
                color: '#34d399',
                fontSize: '0.7rem',
                fontWeight: 800
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                Active
              </span>
            </div>

            <div style={{ marginTop: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>
                  7.5 HP Solar Pump
                </h3>
                <span style={{ fontSize: '0.9rem', color: '#34d399', fontWeight: 800 }}>
                  6.8 HP Output
                </span>
              </div>
              <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '2px' }}>
                System Status: <strong style={{ color: '#34d399' }}>Operational</strong> • Speed: 1450 RPM
              </div>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px',
            marginTop: '12px',
            paddingTop: '12px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <div style={{ background: 'rgba(0,0,0,0.25)', padding: '8px 10px', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'block' }}>Solar Irradiance:</span>
              <strong style={{ fontSize: '0.88rem', color: '#fbbf24' }}>820 W/m² (Peak)</strong>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.25)', padding: '8px 10px', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'block' }}>Motor Current:</span>
              <strong style={{ fontSize: '0.88rem', color: '#38bdf8' }}>14.5 A @ 415V</strong>
            </div>
          </div>
        </div>
      </div>

      {/* ROW 2: MIDDLE 4 TELEMETRY GAUGES */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '18px',
        alignItems: 'stretch'
      }}>
        {/* Card 1: WATER BALANCE GAUGES */}
        <div style={{
          background: '#0d181c',
          border: '1.5px solid #1a332d',
          borderRadius: '18px',
          padding: '18px 20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              WATER BALANCE GAUGES
            </span>

            {/* 3 Concentric / Radial Rings */}
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '14px 0 10px 0' }}>
              {/* Ring 1: Moisture */}
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  border: '4px solid #10b981',
                  background: 'rgba(16, 185, 129, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 6px auto',
                  fontWeight: 900,
                  fontSize: '0.92rem',
                  color: '#ffffff'
                }}>
                  78%
                </div>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block' }}>Moisture</span>
                <strong style={{ fontSize: '0.75rem', color: '#34d399' }}>Adequate</strong>
              </div>

              {/* Ring 2: Content */}
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  border: '4px solid #38bdf8',
                  background: 'rgba(56, 189, 248, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 6px auto',
                  fontWeight: 900,
                  fontSize: '0.8rem',
                  color: '#ffffff'
                }}>
                  310mm
                </div>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block' }}>Content</span>
                <strong style={{ fontSize: '0.75rem', color: '#38bdf8' }}>Optimal</strong>
              </div>

              {/* Ring 3: Availability */}
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  border: '4px solid #f59e0b',
                  background: 'rgba(245, 158, 11, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 6px auto',
                  fontWeight: 900,
                  fontSize: '0.92rem',
                  color: '#ffffff'
                }}>
                  92%
                </div>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block' }}>Availability</span>
                <strong style={{ fontSize: '0.75rem', color: '#fbbf24' }}>Abundant</strong>
              </div>
            </div>
          </div>

          <div style={{ fontSize: '0.72rem', color: '#64748b', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '6px' }}>
            Pedotransfer SoilGrids 250m Active
          </div>
        </div>

        {/* Card 2: FAO-56 ROOT ZONE DEPLETION */}
        <div style={{
          background: '#0d181c',
          border: '1.5px solid #1a332d',
          borderRadius: '18px',
          padding: '18px 20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                FAO-56 ROOT ZONE
              </span>
              <span style={{ fontSize: '0.72rem', color: '#38bdf8' }}>Max Depth 1.2m</span>
            </div>

            {/* Vertical Bar Representation */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: '74px', margin: '12px 0 6px 0' }}>
              {/* Bar 1 */}
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.68rem', color: '#cbd5e1', display: 'block', marginBottom: '2px' }}>1.2m</span>
                <div style={{ width: '22px', height: '54px', background: '#10b981', borderRadius: '4px' }} />
                <span style={{ fontSize: '0.66rem', color: '#94a3b8', display: 'block', marginTop: '3px' }}>Root Zr</span>
              </div>

              {/* Bar 2 */}
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.68rem', color: '#cbd5e1', display: 'block', marginBottom: '2px' }}>38mm</span>
                <div style={{ width: '22px', height: '42px', background: '#f59e0b', borderRadius: '4px' }} />
                <span style={{ fontSize: '0.66rem', color: '#94a3b8', display: 'block', marginTop: '3px' }}>RAW Lim</span>
              </div>

              {/* Bar 3 */}
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.68rem', color: '#cbd5e1', display: 'block', marginBottom: '2px' }}>28mm</span>
                <div style={{ width: '22px', height: '28px', background: '#38bdf8', borderRadius: '4px' }} />
                <span style={{ fontSize: '0.66rem', color: '#94a3b8', display: 'block', marginTop: '3px' }}>Current</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '6px' }}>
            <span style={{ color: '#cbd5e1' }}>Depletion: <strong>28mm / 82mm TAW</strong></span>
            <span style={{ color: '#34d399', fontWeight: 700 }}>Safe Zone</span>
          </div>
        </div>

        {/* Card 3: CWSI WATER STRESS INDEX */}
        <div style={{
          background: '#0d181c',
          border: '1.5px solid #1a332d',
          borderRadius: '18px',
          padding: '18px 20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            CWSI WATER STRESS INDEX
          </span>

          {/* Semi-circular Speedometer SVG */}
          <div style={{ textAlign: 'center', margin: '4px 0' }}>
            <svg width="130" height="70" viewBox="0 0 130 70" style={{ margin: '0 auto', display: 'block' }}>
              <path d="M 15 65 A 50 50 0 0 1 115 65" fill="none" stroke="#1e293b" strokeWidth="10" strokeLinecap="round" />
              <path d="M 15 65 A 50 50 0 0 1 60 17" fill="none" stroke="#10b981" strokeWidth="10" strokeLinecap="round" />
              <path d="M 60 17 A 50 50 0 0 1 95 30" fill="none" stroke="#f59e0b" strokeWidth="10" strokeLinecap="round" />
              <path d="M 95 30 A 50 50 0 0 1 115 65" fill="none" stroke="#ef4444" strokeWidth="10" strokeLinecap="round" />
              {/* Pointer Needle pointing to Low Stress */}
              <circle cx="65" cy="65" r="5" fill="#ffffff" />
              <line x1="65" y1="65" x2="42" y2="30" stroke="#34d399" strokeWidth="3.5" strokeLinecap="round" />
            </svg>

            <div style={{ marginTop: '4px' }}>
              <strong style={{ fontSize: '1.05rem', color: '#34d399' }}>Low Stress</strong>
              <span style={{ fontSize: '0.76rem', color: '#cbd5e1', display: 'block' }}>CWSI: <strong>0.21</strong></span>
            </div>
          </div>

          <div style={{ fontSize: '0.72rem', color: '#64748b', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '6px' }}>
            Stress Limit: CWSI &gt; 0.45
          </div>
        </div>

        {/* Card 4: REAL-TIME WEATHER */}
        <div style={{
          background: '#0d181c',
          border: '1.5px solid #1a332d',
          borderRadius: '18px',
          padding: '18px 20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              REAL-TIME WEATHER
            </span>
            <span style={{ fontSize: '0.74rem', color: '#e2e8f0', fontWeight: 700 }}>
              {isPunjab ? 'Mansa' : (currentProfile.district || 'Karnal')}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', margin: '8px 0' }}>
            <CloudSun size={38} color="#fbbf24" />
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ffffff', lineHeight: 1.1 }}>
                26°C
              </div>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Partly Cloudy</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: '#cbd5e1', background: 'rgba(0,0,0,0.3)', padding: '6px 10px', borderRadius: '8px' }}>
            <span>Wind: <strong>14 km/h NW</strong></span>
            <span>Humidity: <strong>68%</strong></span>
          </div>

          {/* 3-Day Forecast mini icons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#94a3b8', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '6px' }}>
            <span>Today: <strong>26°C</strong></span>
            <span>Tomorrow: <strong>28°C</strong></span>
            <span>Day 3: <strong>27°C</strong></span>
          </div>
        </div>
      </div>

      {/* ROW 3: ACTIONABLE AGRONOMIC ADVISORY (Bottom 3 Cards) */}
      <div style={{
        background: '#0d181c',
        border: '1.5px solid #1a332d',
        borderRadius: '18px',
        padding: '20px 22px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            ACTIONABLE AGRONOMIC ADVISORY
          </span>
          <span style={{ fontSize: '0.76rem', color: '#94a3b8' }}>
            AI Guidance Powered by FAO-56 Dual Crop Model
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px'
        }}>
          {/* Advisory 1: Irrigation Schedule */}
          <div style={{
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            borderLeft: '4px solid #10b981',
            borderRadius: '12px',
            padding: '14px 16px',
            cursor: 'pointer'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
              <strong style={{ fontSize: '0.86rem', color: '#ffffff' }}>1. IRRIGATION SCHEDULE</strong>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#cbd5e1', margin: '4px 0 6px 0' }}>
              Today, 11:30 AM – 1:15 PM IST • {isPunjab ? 'Field A (Wheat)' : 'Field A (Basmati)'}
            </p>
            <span style={{ fontSize: '0.74rem', color: '#34d399', fontWeight: 700 }}>
              Recommended: Optimal daylight solar pumping (₹0 Grid Cost)
            </span>
          </div>

          {/* Advisory 2: Fertilizer Application */}
          <div style={{
            background: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            borderLeft: '4px solid #f59e0b',
            borderRadius: '12px',
            padding: '14px 16px',
            cursor: 'pointer'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} />
              <strong style={{ fontSize: '0.86rem', color: '#ffffff' }}>2. FERTILIZER APPLICATION</strong>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#cbd5e1', margin: '4px 0 6px 0' }}>
              Applied 24 hrs ago • Field B (Cotton)
            </p>
            <span style={{ fontSize: '0.74rem', color: '#fbbf24', fontWeight: 700 }}>
              Status: Optimal soil moisture for root uptake
            </span>
          </div>

          {/* Advisory 3: Pest / Stress Alert */}
          <div style={{
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            borderLeft: '4px solid #ef4444',
            borderRadius: '12px',
            padding: '14px 16px',
            cursor: 'pointer'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
              <strong style={{ fontSize: '0.86rem', color: '#ffffff' }}>3. PEST & STRESS ALERT</strong>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#cbd5e1', margin: '4px 0 6px 0' }}>
              Aphid Risk Moderate • Field C
            </p>
            <span style={{ fontSize: '0.74rem', color: '#f87171', fontWeight: 700 }}>
              Monitor canopy foliage during afternoon scouting
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
