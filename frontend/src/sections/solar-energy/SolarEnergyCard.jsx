import React from 'react';
import { Sun, Zap, DollarSign, Clock, CheckCircle } from 'lucide-react';

export default function SolarEnergyCard({ weather, lang = 'en' }) {
  const t = {
    en: {
      title: "Solar Irrigation & Grid Decoupling",
      pvStatus: "Solar PV Generation",
      peakWindow: "Optimal Solar Pumping Window",
      peakTime: "11:00 AM – 03:30 PM",
      peakDesc: "100% solar drive available. Pumping during this window eliminates all grid electricity and diesel consumption.",
      savingsSummary: "Cumulative Season Impact",
      gridAvoided: "Grid Power Avoided",
      dieselSaved: "Diesel Fuel Saved",
      costSavings: "Direct Cost Saved",
      carbonOffset: "CO₂ Prevented",
      solarReady: "Solar Array Operating Nominally"
    },
    hi: {
      title: "सौर सिंचाई एवं ग्रिड बिजली बचत",
      pvStatus: "सौर ऊर्जा उत्पादन",
      peakWindow: "सर्वश्रेष्ठ सौर पम्पिंग समय",
      peakTime: "सुबह 11:00 – दोपहर 03:30",
      peakDesc: "100% सौर ऊर्जा उपलब्ध। इस समय पम्प चलाने से ग्रिड बिजली और डीजल का खर्च पूरी तरह बचता है।",
      savingsSummary: "इस मौसम की कुल बचत",
      gridAvoided: "ग्रिड बिजली बचत",
      dieselSaved: "डीजल बचत",
      costSavings: "कुल आर्थिक बचत",
      carbonOffset: "CO₂ बचत",
      solarReady: "सौर पैनल सामान्य रूप से कार्यरत"
    }
  }[lang] || {};

  // PV calculations based on solar irradiance
  const solarRadiation = weather?.solar_radiation_w_m2 || 650;
  // Assume a 5 HP (3.7 kW) pump backed by a 5.0 kWp solar PV array
  const currentPvKw = Math.min(5.0, (solarRadiation / 1000) * 5.0 * 0.82);

  // Cumulative metrics for demonstration
  const gridAvoidedKwh = 1420;
  const dieselLiters = 412;
  const directSavingsInr = 38500;
  const co2AvoidedKg = 1160;

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1.5px solid var(--border-card)',
      borderRadius: 'var(--radius-xl)',
      padding: '24px',
      boxShadow: 'var(--shadow-card)',
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'rgba(217, 119, 6, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Sun size={20} color="var(--solar-amber)" />
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            {t.title}
          </h3>
        </div>
        <span className="badge badge-solar">
          <CheckCircle size={13} />
          {t.solarReady}
        </span>
      </div>

      {/* Real-Time Generation Spotlight */}
      <div style={{
        background: 'var(--bg-surface-elevated)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '18px',
        marginBottom: '18px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{t.pvStatus}</span>
          <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--solar-amber)' }}>
            {currentPvKw.toFixed(2)} <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>kW / 5.0 kWp</span>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
          <Clock size={16} color="var(--solar-amber)" />
          <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>{t.peakWindow}:</strong>
          <span style={{ fontSize: '0.88rem', color: 'var(--solar-amber)', fontWeight: 700 }}>{t.peakTime}</span>
        </div>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: 1.45, margin: 0 }}>
          {t.peakDesc}
        </p>
      </div>

      {/* Environmental & Financial ROI Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(2, 1fr)', 
        gap: '12px',
        marginTop: 'auto'
      }}>
        {/* Cost Savings */}
        <div style={{ 
          background: 'var(--bg-surface-elevated)', 
          border: '1px solid var(--border-subtle)', 
          borderRadius: 'var(--radius-md)', 
          padding: '14px' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary-emerald)' }}>
            <DollarSign size={16} />
            <span style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase' }}>{t.costSavings}</span>
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
            ₹{directSavingsInr.toLocaleString('en-IN')}
          </div>
        </div>

        {/* Grid Power Avoided */}
        <div style={{ 
          background: 'var(--bg-surface-elevated)', 
          border: '1px solid var(--border-subtle)', 
          borderRadius: 'var(--radius-md)', 
          padding: '14px' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--solar-amber)' }}>
            <Zap size={16} />
            <span style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase' }}>{t.gridAvoided}</span>
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
            {gridAvoidedKwh} <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>kWh</span>
          </div>
        </div>

        {/* Diesel Fuel Saved */}
        <div style={{ 
          background: 'var(--bg-surface-elevated)', 
          border: '1px solid var(--border-subtle)', 
          borderRadius: 'var(--radius-md)', 
          padding: '14px' 
        }}>
          <div style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>
            ⛽ {t.dieselSaved}
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
            {dieselLiters} <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>L</span>
          </div>
        </div>

        {/* CO2 Emissions Avoided */}
        <div style={{ 
          background: 'var(--bg-surface-elevated)', 
          border: '1px solid var(--border-subtle)', 
          borderRadius: 'var(--radius-md)', 
          padding: '14px' 
        }}>
          <div style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>
            🌱 {t.carbonOffset}
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
            {co2AvoidedKg} <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>kg</span>
          </div>
        </div>
      </div>
    </div>
  );
}
