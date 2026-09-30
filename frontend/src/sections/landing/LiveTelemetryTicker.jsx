import React from 'react';
import { Sun, Droplets, Satellite, Zap, ShieldCheck, Activity } from 'lucide-react';

export default function LiveTelemetryTicker({ lang = 'en' }) {
  const tickerItems = [
    {
      icon: Sun,
      color: '#f59e0b',
      text: lang === 'hi' 
        ? "सौर विकिरण: करनाल 718 W/m² (सिंचाई हेतु उत्तम)" 
        : "Solar Irradiance: Karnal 718 W/m² (Peak Pumping)"
    },
    {
      icon: Droplets,
      color: '#0ea5e9',
      text: lang === 'hi' 
        ? "आज की भूजल बचत: 4,820,000 लीटर" 
        : "Groundwater Saved Today: 4,820,000 Litres"
    },
    {
      icon: Zap,
      color: '#10b981',
      text: lang === 'hi' 
        ? "ग्रिड बिजली बचत: ₹3,84,500 (शून्य डीजल)" 
        : "Grid & Diesel Tariff Offset: ₹3,84,500"
    },
    {
      icon: Satellite,
      color: '#34d399',
      text: lang === 'hi' 
        ? "सेंटीनेल-2 उपग्रह स्कैन: 38 मिनट पूर्व (क्लाउड-फ्री 10m)" 
        : "Sentinel-2 Orbit Pass: 38m ago (Cloud-Free 10m)"
    },
    {
      icon: Activity,
      color: '#a855f7',
      text: lang === 'hi' 
        ? "सक्रिय सौर पम्प नेटवर्क: 1,420 पम्प चालू" 
        : "Active Microgrid Solar Pumps: 1,420 Running"
    },
    {
      icon: ShieldCheck,
      color: '#f59e0b',
      text: lang === 'hi' 
        ? "FAO-56 जल संतुलन: 0% फसल जल तनाव" 
        : "FAO-56 Hydrologic Integrity: 0% Water Stress"
    }
  ];

  return (
    <div style={{
      width: '100%',
      background: 'linear-gradient(90deg, rgba(6, 18, 13, 0.98) 0%, rgba(11, 31, 22, 0.95) 50%, rgba(6, 18, 13, 0.98) 100%)',
      borderBottom: '1px solid rgba(16, 185, 129, 0.25)',
      overflow: 'hidden',
      position: 'relative',
      zIndex: 40,
      padding: '8px 0',
      fontSize: '0.82rem',
      fontWeight: 600,
      letterSpacing: '0.02em',
      color: 'var(--text-secondary)'
    }}>
      {/* Edge gradient masks for seamless loop */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '60px',
        height: '100%',
        background: 'linear-gradient(90deg, #06120d 0%, transparent 100%)',
        zIndex: 2,
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '60px',
        height: '100%',
        background: 'linear-gradient(270deg, #06120d 0%, transparent 100%)',
        zIndex: 2,
        pointerEvents: 'none'
      }} />

      <div className="ticker-track">
        {/* Double the list to create infinite marquee */}
        {[...tickerItems, ...tickerItems].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="ticker-item" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '0 28px',
              whiteSpace: 'nowrap'
            }}>
              <span className="pulse-dot" style={{ width: '7px', height: '7px' }} />
              <Icon size={14} color={item.color} />
              <span>{item.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
