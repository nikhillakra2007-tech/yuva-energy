import React, { useState } from 'react';
import { 
  Satellite, 
  Layers, 
  Eye, 
  Activity, 
  ShieldAlert, 
  CheckCircle2, 
  Zap, 
  Droplets, 
  Crosshair, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import satelliteImg from '../../assets/satellite_farm_multispectral.jpg';

export default function SatelliteCanopyScanner({ onEnterConsole, lang = 'en' }) {
  const [activeBand, setActiveBand] = useState('ndvi'); // 'ndvi' | 'cwsi' | 'ndre' | 'rgb'
  const [selectedZone, setSelectedZone] = useState('zone2'); // 'zone1' | 'zone2' | 'zone3' | 'zone4'

  const bands = {
    ndvi: {
      name: "NDVI (Canopy Vigor)",
      descEn: "Normalized Difference Vegetation Index (B8 NIR vs B4 Red) at 10-meter ground pixel resolution.",
      descHi: "सेंटीनेल-2 उपग्रह (10 मीटर) द्वारा पत्तियों के क्लोरोफिल और फसल के हरेपन की सटीक जांच।"
    },
    cwsi: {
      name: "CWSI (Water Stress Index)",
      descEn: "Crop Water Stress Index detecting transpiration deficit before leaves show visual curling.",
      descHi: "फसल जल तनाव सूचकांक: पत्तियां मुरझाने से 4 दिन पहले ही पानी की जरूरत पहचानता है।"
    },
    ndre: {
      name: "NDRE (Red Edge)",
      descEn: "Red Edge Chlorophyll index penetrating dense mature canopies without saturation.",
      descHi: "रेड-एज इंडेक्स: घनी फसल में नाइट्रोजन और पोषक तत्वों की गहराई से जांच।"
    },
    rgb: {
      name: "True Color Optical",
      descEn: "Natural surface optical reflectance calibrated for atmospheric aerosols.",
      descHi: "वास्तविक ऑप्टिकल उपग्रह तस्वीर, वायुमंडलीय धूल से मुक्त।"
    }
  };

  const zones = {
    zone1: {
      id: "zone1",
      nameEn: "North Canal Inflow (Plot A)",
      nameHi: "उत्तरी नहर प्रवाह (प्लॉट ए)",
      x: 28, // % coordinates on map
      y: 35,
      ndvi: 0.82,
      cwsi: 0.12,
      soilMoisture: "38.2% (Field Capacity)",
      depletion: "14.2 mm",
      solarIrradiance: "712 W/m²",
      status: "optimal",
      statusEn: "Optimal Hydration",
      statusHi: "आदर्श नमी (पानी पर्याप्त)",
      actionEn: "Solar Pump Standby — No Irrigation Required",
      actionHi: "सौर पम्प स्टैंडबाय — सिंचाई की आवश्यकता नहीं"
    },
    zone2: {
      id: "zone2",
      nameEn: "Central Solar-Agro Estate (Plot B)",
      nameHi: "केंद्रीय एग्रो-सोलर क्षेत्र (प्लॉट बी)",
      x: 58,
      y: 48,
      ndvi: 0.75,
      cwsi: 0.22,
      soilMoisture: "31.5% (Readily Available)",
      depletion: "22.4 mm",
      solarIrradiance: "695 W/m²",
      status: "active",
      statusEn: "Active Solar Pumping",
      statusHi: "सौर पम्प चालू (मुफ्त धूप)",
      actionEn: "Dispatching 28mm via 5HP Solar Pump (45 min run)",
      actionHi: "5HP सौर पम्प से 28mm सिंचाई चालू (45 मिनट चक्र)"
    },
    zone3: {
      id: "zone3",
      nameEn: "South Sand Ridge (Plot C)",
      nameHi: "दक्षिणी रेतीला ढलान (प्लॉट सी)",
      x: 78,
      y: 72,
      ndvi: 0.54,
      cwsi: 0.44,
      soilMoisture: "19.8% (Approaching RAW limit)",
      depletion: "38.6 mm",
      solarIrradiance: "725 W/m²",
      status: "warning",
      statusEn: "Water Deficit Warning",
      statusHi: "नमी की कमी (सिंचाई तुरंत)",
      actionEn: "Immediate Solar Irrigation Recommended (1 hr 15 min)",
      actionHi: "तत्काल सौर सिंचाई जरूरी (1 घंटा 15 मिनट)"
    },
    zone4: {
      id: "zone4",
      nameEn: "Eastern Fruit Orchard Buffer (Plot D)",
      nameHi: "पूर्वी बागवानी क्षेत्र (प्लॉट डी)",
      x: 38,
      y: 78,
      ndvi: 0.68,
      cwsi: 0.25,
      soilMoisture: "28.0% (Moist Loam)",
      depletion: "25.0 mm",
      solarIrradiance: "700 W/m²",
      status: "optimal",
      statusEn: "Stable Canopy Vigor",
      statusHi: "संतुलित फसल विकास",
      actionEn: "Schedule Drip Cycle for Tomorrow 11:30 AM",
      actionHi: "कल सुबह 11:30 बजे ड्रिप सिंचाई का सुझाव"
    }
  };

  const currentZone = zones[selectedZone] || zones.zone2;

  const t = {
    en: {
      pill: "10-Meter Sentinel-2 Multispectral Engine",
      title: "Interactive Satellite Canopy Scanner",
      subtitle: "Click any target waypoint across the field to inspect live multispectral indices, FAO-56 soil moisture, and solar pump dispatch telemetry.",
      scanConfidence: "Spectral Scan Confidence: 99.1%",
      cloudCover: "Cloud Mask: 0.0% (Clear Sky)",
      orbitPass: "Orbit: Sentinel-2B Tile 43RER",
      zoneDetailTitle: "Zone Diagnostics & Agronomy Chain",
      soilStatus: "Soil Moisture State",
      rootDepletion: "Root Zone Depletion (Dr)",
      solarAvailable: "Live Solar Radiation",
      actionTitle: "Automated Microgrid Action",
      viewFullMapCta: "Inspect Full Farm Geospatial Map"
    },
    hi: {
      pill: "10-मीटर सेंटीनेल-2 उपग्रह फसल स्कैनर",
      title: "सटीक उपग्रह फसल व जल संतुलन स्कैनर",
      subtitle: "खेत के किसी भी बिंदु (पॉइंट) पर क्लिक करें और देखें उपग्रह से फसल का स्वास्थ्य, मिट्टी में नमी और सौर पम्प का स्वचालित निर्देश।",
      scanConfidence: "उपग्रह शुद्धता विश्वास: 99.1%",
      cloudCover: "बादल आवरण: 0.0% (साफ धूप)",
      orbitPass: "उपग्रह कक्षा: सेंटीनेल-2B करनाल ग्रिड",
      zoneDetailTitle: "खेत प्लॉट निदान व कृषि सलाह",
      soilStatus: "मिट्टी में मौजूद नमी",
      rootDepletion: "जड़ों में पानी की कमी (Dr)",
      solarAvailable: "वर्तमान सौर ऊर्जा विकिरण",
      actionTitle: "स्वचालित सौर पम्पिंग निर्देश",
      viewFullMapCta: "खेत का पूरा उपग्रह नक्शा खोलें"
    }
  }[lang] || {};

  return (
    <div id="satellite-scanner-section" style={{
      maxWidth: '1760px',
      width: '96%',
      margin: '0 auto',
      padding: '56px 36px 90px 36px'
    }}>
      {/* Section Header */}
      <div style={{ textAlign: 'center', maxWidth: '840px', margin: '0 auto 48px auto' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(14, 165, 233, 0.12)',
          border: '1px solid rgba(14, 165, 233, 0.35)',
          borderRadius: 'var(--radius-full)',
          padding: '6px 18px',
          marginBottom: '16px'
        }}>
          <Satellite size={16} color="var(--sky-blue)" />
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#7dd3fc', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {t.pill}
          </span>
        </div>

        <h2 style={{
          fontSize: 'clamp(2rem, 3.2vw, 2.7rem)',
          fontWeight: 800,
          letterSpacing: '-0.03em',
          marginBottom: '16px'
        }}>
          {t.title}
        </h2>

        <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          {t.subtitle}
        </p>
      </div>

      {/* Main Scanner Container */}
      <div className="glass-panel" style={{
        padding: '32px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '36px',
        alignItems: 'center',
        position: 'relative'
      }}>
        {/* Left Column: Interactive Satellite View with Clickable Hotspots */}
        <div style={{ position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1.5px solid var(--border-subtle)' }}>
          {/* Multispectral Imagery */}
          <div style={{ position: 'relative', width: '100%', height: '420px' }}>
            <img 
              src={satelliteImg} 
              alt="Sentinel-2 multispectral false color crop monitoring"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: activeBand === 'cwsi' ? 'hue-rotate(180deg) saturate(1.4)' : (activeBand === 'ndre' ? 'saturate(1.8) contrast(1.2)' : 'none'),
                transition: 'filter 0.4s ease'
              }}
            />

            {/* Simulated Scanning Grid Overlay */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(16, 185, 129, 0.08) 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(16, 185, 129, 0.08) 40px)',
              pointerEvents: 'none'
            }} />

            {/* Radar Scan Bar Animation */}
            <div className="radar-scan-bar" />

            {/* Top Left Live Satellite Badge */}
            <div style={{
              position: 'absolute',
              top: '16px',
              left: '16px',
              background: 'rgba(6, 18, 13, 0.85)',
              backdropFilter: 'blur(12px)',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-active)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.8rem',
              fontWeight: 700,
              color: '#ffffff'
            }}>
              <span className="pulse-dot" />
              <span>{t.orbitPass}</span>
            </div>

            {/* Clickable Target Hotspots */}
            {Object.values(zones).map((zone) => {
              const isSelected = selectedZone === zone.id;
              const isWarning = zone.status === 'warning';
              return (
                <button
                  key={zone.id}
                  type="button"
                  onClick={() => setSelectedZone(zone.id)}
                  style={{
                    position: 'absolute',
                    top: `${zone.y}%`,
                    left: `${zone.x}%`,
                    transform: 'translate(-50%, -50%)',
                    width: isSelected ? '46px' : '36px',
                    height: isSelected ? '46px' : '36px',
                    borderRadius: '50%',
                    background: isSelected 
                      ? (isWarning ? '#ef4444' : 'var(--primary-emerald)') 
                      : 'rgba(6, 18, 13, 0.85)',
                    border: `2px solid ${isWarning ? '#fca5a5' : '#ffffff'}`,
                    boxShadow: isSelected ? `0 0 24px ${isWarning ? '#ef4444' : 'var(--primary-emerald)'}` : '0 4px 12px rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    zIndex: 10
                  }}
                  title={lang === 'hi' ? zone.nameHi : zone.nameEn}
                >
                  <Crosshair size={isSelected ? 22 : 18} color={isSelected ? '#ffffff' : 'var(--primary-emerald-light)'} />
                </button>
              );
            })}
          </div>

          {/* Band Selector Bar */}
          <div style={{
            background: 'rgba(6, 18, 13, 0.95)',
            padding: '12px 16px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {Object.entries(bands).map(([key, data]) => {
                const isActive = activeBand === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveBand(key)}
                    style={{
                      background: isActive ? 'var(--primary-emerald)' : 'rgba(18, 45, 32, 0.6)',
                      color: isActive ? '#06120d' : 'var(--text-secondary)',
                      border: isActive ? '1px solid var(--primary-emerald-light)' : '1px solid var(--border-subtle)',
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {data.name}
                  </button>
                );
              })}
            </div>

            <span style={{ fontSize: '0.75rem', color: 'var(--primary-emerald-light)', fontWeight: 600 }}>
              {t.scanConfidence}
            </span>
          </div>
        </div>

        {/* Right Column: Dynamic Zone Telemetry Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="pulse-dot" style={{ background: currentZone.status === 'warning' ? '#ef4444' : 'var(--primary-emerald)' }} />
              <span style={{ fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', color: currentZone.status === 'warning' ? '#ef4444' : 'var(--primary-emerald)', letterSpacing: '0.05em' }}>
                {lang === 'hi' ? currentZone.statusHi : currentZone.statusEn}
              </span>
            </div>

            <h3 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#ffffff', marginBottom: '6px' }}>
              {lang === 'hi' ? currentZone.nameHi : currentZone.nameEn}
            </h3>

            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
              {lang === 'hi' ? bands[activeBand].descHi : bands[activeBand].descEn}
            </p>
          </div>

          {/* Key Spectral Gauges */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div style={{
              background: 'rgba(18, 45, 32, 0.6)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '16px'
            }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '4px' }}>
                NDVI Canopy Vigor
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary-emerald-light)', fontFamily: 'var(--font-heading)' }}>
                {currentZone.ndvi} <span style={{ fontSize: '0.8rem', color: 'var(--primary-emerald)' }}>/ 1.0</span>
              </div>
            </div>

            <div style={{
              background: 'rgba(18, 45, 32, 0.6)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '16px'
            }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '4px' }}>
                CWSI Water Stress
              </div>
              <div style={{
                fontSize: '1.6rem',
                fontWeight: 800,
                color: currentZone.cwsi > 0.35 ? '#ef4444' : 'var(--sky-blue)',
                fontFamily: 'var(--font-heading)'
              }}>
                {currentZone.cwsi} <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Index</span>
              </div>
            </div>

            <div style={{
              background: 'rgba(18, 45, 32, 0.6)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '16px'
            }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '4px' }}>
                {t.rootDepletion}
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
                {currentZone.depletion}
              </div>
            </div>

            <div style={{
              background: 'rgba(18, 45, 32, 0.6)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '16px'
            }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '4px' }}>
                {t.solarAvailable}
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--solar-amber)', fontFamily: 'var(--font-heading)' }}>
                {currentZone.solarIrradiance}
              </div>
            </div>
          </div>

          {/* Action Callout Box */}
          <div style={{
            background: currentZone.status === 'warning' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
            border: `1.5px solid ${currentZone.status === 'warning' ? '#ef4444' : 'var(--primary-emerald)'}`,
            borderRadius: 'var(--radius-md)',
            padding: '18px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px'
          }}>
            <Zap size={24} color={currentZone.status === 'warning' ? '#ef4444' : 'var(--solar-amber)'} />
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                {t.actionTitle}
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>
                {lang === 'hi' ? currentZone.actionHi : currentZone.actionEn}
              </div>
            </div>
          </div>

          {/* Button to Console */}
          <button
            type="button"
            onClick={onEnterConsole}
            className="btn-secondary"
            style={{
              padding: '14px',
              fontSize: '0.95rem',
              borderRadius: 'var(--radius-md)',
              justifyContent: 'center'
            }}
          >
            <span>{t.viewFullMapCta}</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
