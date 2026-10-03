import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  RotateCcw, 
  Droplets, 
  Leaf, 
  Sun, 
  CloudSun, 
  Activity, 
  ShieldCheck, 
  Maximize2, 
  Zap,
  ArrowRight
} from 'lucide-react';
import satelliteImg from '../../assets/satellite_farm_multispectral.jpg';

export default function AgriShowcaseDashboard({ onEnterConsole, lang = 'en' }) {
  const [crop, setCrop] = useState('cotton');
  const [acreage, setAcreage] = useState(45);
  const [waterSource, setWaterSource] = useState('open_well');
  const [energySource, setEnergySource] = useState('diesel');
  const [isScanning, setIsScanning] = useState(true);

  // Crops configuration
  const crops = [
    { id: 'cotton', nameEn: 'Cotton', nameHi: 'कपास', baseFactor: 1.15 },
    { id: 'wheat', nameEn: 'Wheat', nameHi: 'गेहूं', baseFactor: 0.95 },
    { id: 'sugarcane', nameEn: 'Sugarcane', nameHi: 'गन्ना', baseFactor: 1.45 },
    { id: 'maize', nameEn: 'Maize', nameHi: 'मक्का', baseFactor: 0.85 },
    { id: 'rice', nameEn: 'Rice', nameHi: 'धान (बासमती)', baseFactor: 1.30 }
  ];

  // Dynamic calculations mirroring Image 1
  const selectedCropObj = crops.find(c => c.id === crop) || crops[0];
  const energyMultiplier = energySource === 'diesel' ? 1.4 : 1.0;
  const annualSavings = Math.round(acreage * 7680 * selectedCropObj.baseFactor * energyMultiplier);
  const waterSavedLiters = ((acreage * 0.284 * selectedCropObj.baseFactor)).toFixed(1);
  const carbonAvoided = ((annualSavings / 24300)).toFixed(1);

  // Field vigor diagnostics based on acreage
  const highVigorAcres = Math.round(acreage * 0.689);
  const medVigorAcres = Math.round(acreage * 0.244);
  const lowVigorAcres = Math.max(1, acreage - highVigorAcres - medVigorAcres);

  const handleRecalculate = () => {
    setIsScanning(false);
    setTimeout(() => setIsScanning(true), 100);
  };

  return (
    <section style={{
      maxWidth: '1760px',
      width: '96%',
      margin: '0 auto 56px auto',
      padding: '0 36px'
    }}>
      {/* Outer Container matching Image 1 */}
      <div style={{
        background: '#0d181c',
        border: '1.5px solid #1a332d',
        borderRadius: '24px',
        padding: '28px 34px',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5)',
        color: '#ffffff'
      }}>
        {/* Top Header Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
          marginBottom: '22px',
          paddingBottom: '16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #10b981 0%, #f59e0b 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Leaf size={18} color="#ffffff" />
            </div>
            <h2 style={{
              fontSize: '1.35rem',
              fontWeight: 800,
              fontFamily: 'var(--font-heading)',
              color: '#ffffff',
              margin: 0,
              letterSpacing: '-0.02em'
            }}>
              <span style={{ color: '#10b981' }}>KisanUrja</span> Showcase Dashboard
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '0.86rem', color: '#94a3b8' }}>
            <span>Project: <strong style={{ color: '#e2e8f0' }}>National Model Farmland</strong></span>
            <span>User: <strong style={{ color: '#e2e8f0' }}>Baljit Singh / Rohit Sharma</strong></span>
            <button
              onClick={onEnterConsole}
              style={{
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid #10b981',
                color: '#34d399',
                padding: '6px 14px',
                borderRadius: '9999px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>Launch Live Console</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* 2-Column Main Showcase Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: '24px',
          alignItems: 'stretch'
        }}>
          {/* LEFT COLUMN: Solar Irrigation & Yield Value Calculator */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.65)',
            border: '1.5px solid #233831',
            borderRadius: '18px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <h3 style={{
                fontSize: '1.15rem',
                fontWeight: 800,
                color: '#f59e0b',
                marginBottom: '18px',
                letterSpacing: '-0.01em'
              }}>
                Solar Irrigation & Yield Value Calculator
              </h3>

              {/* Crop Type Selector */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '0.84rem', color: '#cbd5e1', marginBottom: '8px', fontWeight: 600 }}>
                  Crop Type:
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {crops.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCrop(c.id)}
                      style={{
                        padding: '7px 16px',
                        borderRadius: '9999px',
                        fontSize: '0.84rem',
                        fontWeight: 700,
                        border: crop === c.id ? '1.5px solid #10b981' : '1px solid rgba(255, 255, 255, 0.15)',
                        background: crop === c.id ? '#10b981' : 'rgba(255, 255, 255, 0.04)',
                        color: crop === c.id ? '#ffffff' : '#cbd5e1',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {lang === 'hi' ? c.nameHi : c.nameEn}
                    </button>
                  ))}
                </div>
              </div>

              {/* Farm Size (Acreage) Slider */}
              <div style={{ marginBottom: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '0.84rem', color: '#cbd5e1', fontWeight: 600 }}>
                    Farm Size (Acreage):
                  </label>
                  <span style={{
                    background: 'rgba(16, 185, 129, 0.2)',
                    color: '#34d399',
                    padding: '4px 12px',
                    borderRadius: '8px',
                    fontWeight: 800,
                    fontSize: '0.92rem',
                    border: '1px solid rgba(16, 185, 129, 0.4)'
                  }}>
                    {acreage} Acres
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={acreage}
                  onChange={(e) => setAcreage(parseInt(e.target.value) || 1)}
                  style={{
                    width: '100%',
                    accentColor: '#10b981',
                    cursor: 'pointer',
                    height: '6px'
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>
                  <span>0</span>
                  <span>20</span>
                  <span>40</span>
                  <span>60</span>
                  <span>80</span>
                  <span>100</span>
                </div>
              </div>

              {/* Water Source Selector */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '0.84rem', color: '#cbd5e1', marginBottom: '8px', fontWeight: 600 }}>
                  Water Source:
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {[
                    { id: 'open_well', label: 'Open Well' },
                    { id: 'borewell', label: 'Borewell' },
                    { id: 'river', label: 'River / Canal' }
                  ].map((w) => (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => setWaterSource(w.id)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '9999px',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        border: waterSource === w.id ? '1.5px solid #10b981' : '1px solid rgba(255, 255, 255, 0.12)',
                        background: waterSource === w.id ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                        color: waterSource === w.id ? '#34d399' : '#94a3b8',
                        cursor: 'pointer'
                      }}
                    >
                      {w.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Current Energy Selector */}
              <div style={{ marginBottom: '22px' }}>
                <label style={{ display: 'block', fontSize: '0.84rem', color: '#cbd5e1', marginBottom: '8px', fontWeight: 600 }}>
                  Current Energy:
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[
                    { id: 'grid', label: 'Grid Electric' },
                    { id: 'diesel', label: 'Diesel' }
                  ].map((e) => (
                    <button
                      key={e.id}
                      type="button"
                      onClick={() => setEnergySource(e.id)}
                      style={{
                        padding: '6px 16px',
                        borderRadius: '9999px',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        border: energySource === e.id ? '1.5px solid #10b981' : '1px solid rgba(255, 255, 255, 0.12)',
                        background: energySource === e.id ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                        color: energySource === e.id ? '#34d399' : '#94a3b8',
                        cursor: 'pointer'
                      }}
                    >
                      {e.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Savings Result Card */}
            <div>
              <div style={{
                background: 'rgba(0, 0, 0, 0.45)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '14px',
                padding: '16px 20px',
                marginBottom: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '14px'
              }}>
                <div>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block' }}>
                    Estimated Annual Savings
                  </span>
                  <div style={{ fontSize: '1.65rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', marginTop: '2px' }}>
                    ₹{annualSavings.toLocaleString('en-IN')} <span style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 500 }}>(INR)</span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    In Solar Cost vs {energySource === 'diesel' ? 'Diesel Genset' : 'Grid Tariff'}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Droplets size={16} color="#38bdf8" />
                    <div>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Groundwater Saved: </span>
                      <strong style={{ fontSize: '0.88rem', color: '#38bdf8' }}>{waterSavedLiters} Lakh Liters</strong>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Leaf size={16} color="#34d399" />
                    <div>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Emissions Avoided: </span>
                      <strong style={{ fontSize: '0.88rem', color: '#34d399' }}>{carbonAvoided} Tons CO₂e</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recalculate Button */}
              <button
                type="button"
                onClick={handleRecalculate}
                style={{
                  width: '100%',
                  background: '#10b981',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 20px',
                  fontSize: '0.96rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4)',
                  transition: 'background-color 0.2s'
                }}
              >
                <RotateCcw size={16} />
                <span>Recalculate Savings</span>
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Copernicus Sentinel-2 Satellite Canopy Scanner */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.65)',
            border: '1.5px solid #233831',
            borderRadius: '18px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  color: '#f59e0b',
                  margin: 0,
                  letterSpacing: '-0.01em'
                }}>
                  Copernicus Sentinel-2 Satellite Canopy Scanner <span style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 600 }}>(10m Resolution)</span>
                </h3>
              </div>

              {/* Visual Satellite Map Canvas with Scan Beam Animation */}
              <div style={{
                position: 'relative',
                width: '100%',
                height: '280px',
                borderRadius: '14px',
                overflow: 'hidden',
                border: '1.5px solid #1a332d',
                marginBottom: '16px'
              }}>
                <img
                  src={satelliteImg}
                  alt="Sentinel-2 Satellite Farm Field View"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    filter: 'brightness(0.92) contrast(1.08)'
                  }}
                />

                {/* SVG Polygon Overlay showing field parcel */}
                <svg
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none'
                  }}
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  {/* Field Polygon Area */}
                  <polygon
                    points="32,18 78,28 68,82 22,72"
                    fill="rgba(16, 185, 129, 0.38)"
                    stroke="#10b981"
                    strokeWidth="2"
                    strokeDasharray="3 1"
                  />
                  {/* Inner Vigor Gradient Contours */}
                  <polygon
                    points="35,24 74,32 66,65 26,58"
                    fill="rgba(245, 158, 11, 0.28)"
                    stroke="#f59e0b"
                    strokeWidth="1"
                  />
                  <polygon
                    points="42,34 68,40 62,56 34,50"
                    fill="rgba(239, 68, 68, 0.25)"
                    stroke="#ef4444"
                    strokeWidth="1"
                  />
                </svg>

                {/* Animated Horizontal Laser Scanline */}
                {isScanning && (
                  <div
                    style={{
                      position: 'absolute',
                      left: '18%',
                      width: '64%',
                      height: '3px',
                      background: 'linear-gradient(90deg, transparent, #f59e0b, #10b981, transparent)',
                      boxShadow: '0 0 16px 3px rgba(245, 158, 11, 0.8)',
                      animation: 'scanSweep 3.2s ease-in-out infinite',
                      pointerEvents: 'none'
                    }}
                  >
                    <div style={{
                      position: 'absolute',
                      top: '-10px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'rgba(0, 0, 0, 0.75)',
                      color: '#fbbf24',
                      fontSize: '0.68rem',
                      fontWeight: 900,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      letterSpacing: '0.08em',
                      border: '1px solid #f59e0b'
                    }}>
                      SCANNING...
                    </div>
                  </div>
                )}

                {/* Bottom Left: Field ID Overlay */}
                <div style={{
                  position: 'absolute',
                  bottom: '10px',
                  left: '12px',
                  background: 'rgba(0, 0, 0, 0.75)',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: '#e2e8f0',
                  border: '1px solid rgba(255, 255, 255, 0.15)'
                }}>
                  Field ID: MH_P_45
                </div>

                {/* Bottom Right: Mini NDVI Legend Bar */}
                <div style={{
                  position: 'absolute',
                  bottom: '10px',
                  right: '12px',
                  background: 'rgba(0, 0, 0, 0.8)',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <span style={{ fontSize: '0.62rem', color: '#94a3b8' }}>-0.1</span>
                  <div style={{
                    width: '60px',
                    height: '6px',
                    borderRadius: '2px',
                    background: 'linear-gradient(90deg, #ef4444 0%, #f59e0b 50%, #10b981 100%)'
                  }} />
                  <span style={{ fontSize: '0.62rem', color: '#34d399' }}>1.0</span>
                </div>
              </div>
            </div>

            {/* Field Vigor Diagnostics Stats Bar */}
            <div style={{
              background: 'rgba(0, 0, 0, 0.45)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              padding: '14px 18px'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '10px',
                fontSize: '0.82rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                paddingBottom: '6px'
              }}>
                <strong style={{ color: '#e2e8f0' }}>Field Vigor Diagnostics</strong>
                <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                  Date: <strong>18 Oct 2026</strong> | Cloud Cover: <strong>2.1%</strong>
                </span>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '10px',
                fontSize: '0.78rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#10b981', display: 'inline-block' }} />
                  <div>
                    <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.7rem' }}>High Vigor Area:</span>
                    <strong style={{ color: '#34d399' }}>{highVigorAcres} Acres (68.9%)</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#f59e0b', display: 'inline-block' }} />
                  <div>
                    <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.7rem' }}>Medium Vigor:</span>
                    <strong style={{ color: '#fbbf24' }}>{medVigorAcres} Acres (24.4%)</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#ef4444', display: 'inline-block' }} />
                  <div>
                    <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.7rem' }}>Low / Stressed:</span>
                    <strong style={{ color: '#f87171' }}>{lowVigorAcres} Acres (6.7%)</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Global Animation Keyframes */}
      <style>{`
        @keyframes scanSweep {
          0% { top: 18%; opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { top: 78%; opacity: 0; }
        }
      `}</style>
    </section>
  );
}
