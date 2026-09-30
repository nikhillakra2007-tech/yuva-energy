import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Sun, 
  CloudRain, 
  Flame, 
  RotateCcw, 
  Activity, 
  Droplets, 
  Layers, 
  Zap, 
  Calculator,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export default function ScientificDetailModal({
  isOpen,
  onClose,
  field,
  weather,
  waterBalance,
  soil,
  lang = 'en',
  onSimulateWeather
}) {
  const [activeSim, setActiveSim] = useState('RESET');

  // Prevent background scrolling while modal is open
  useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const t = {
    en: {
      modalTitle: "Deep Agronomic & Scientific Telemetry Console",
      modalSub: "Dual Crop-Coefficient FAO-56 equations, pedotransfer soil mechanics, and real-time environmental simulation.",
      closeBtn: "Close Scientific View",
      simTitle: "Live Environmental & Telemetry Stress Simulator",
      simSub: "Trigger simulated conditions to observe live reactive shifts in crop transpiration, depletion, and solar pump dispatch:",
      simSun: "☀️ Peak Sun (820 W/m²)",
      simRain: "🌧️ Active Rainfall (18mm)",
      simHeat: "🏜️ Dry Heatwave (CWSI Stress)",
      simReset: "🔄 Reset Baseline",
      activeSimLabel: "Simulated Scenario",
      faoTitle: "FAO-56 Dual Crop-Coefficient Water Balance Equations",
      soilTitle: "Pedotransfer Soil Hydraulics (ISRIC 250m)",
      solarTitle: "Solar PV Irrigation Hydraulics (PM-KUSUM)",
      metrics: {
        et0: "Reference Evapotranspiration (ET₀)",
        etcAdj: "Adjusted Crop ET (ETc,adj)",
        dr: "Root Zone Depletion (Dr)",
        raw: "Readily Available Water (RAW)",
        taw: "Total Available Water (TAW)",
        cwsi: "Crop Water Stress Index (CWSI)",
        ks: "Transpiration Reduction Factor (Ks)",
        kcb: "Basal Crop Coefficient (Kcb)",
        fc: "Field Capacity (θ_FC)",
        wp: "Wilting Point (θ_WP)",
        ksat: "Hydraulic Conductivity (Ksat)",
        pumpRating: "Solar Pump Rating",
        arrayCapacity: "Solar PV Array Capacity",
        dischargeRate: "Operating Flow Rate"
      }
    },
    hi: {
      modalTitle: "गहन कृषि विज्ञान व टेलीमेट्री कंसोल",
      modalSub: "FAO-56 दोहरा फसल गुणांक, मृदा जल विज्ञान और सजीव मौसम सिमुलेटर।",
      closeBtn: "वैज्ञानिक दृश्य बंद करें",
      simTitle: "सजीव मौसम व तनाव सिम्युलेटर",
      simSub: "बटन दबाकर मौसम बदलकर देखें कि फसल जल तनाव और सौर पम्प की स्थिति तुरंत कैसे बदलती है:",
      simSun: "☀️ प्रखर धूप (820 W/m²)",
      simRain: "🌧️ भारी बारिश (18mm)",
      simHeat: "🏜️ तेज गर्मी व लू",
      simReset: "🔄 सामान्य स्थिति",
      activeSimLabel: "सक्रिय परिस्थिति",
      faoTitle: "FAO-56 जल संतुलन गणितीय सूत्र",
      soilTitle: "मृदा जल धारण क्षमता व हाइड्रोलिक्स",
      solarTitle: "सौर पंपिंग ऊर्जा विनिर्देश (PM-KUSUM)",
      metrics: {
        et0: "संदर्भ वाष्पोत्सर्जन (ET₀)",
        etcAdj: "समायोजित फसल वाष्पोत्सर्जन (ETc,adj)",
        dr: "जड़ क्षेत्र जल कमी (Dr)",
        raw: "आसानी से उपलब्ध जल (RAW)",
        taw: "कुल उपलब्ध जल (TAW)",
        cwsi: "फसल जल तनाव सूचकांक (CWSI)",
        ks: "तनाव गुणांक (Ks)",
        kcb: "फसल आधार गुणांक (Kcb)",
        fc: "क्षेत्र क्षमता (θ_FC)",
        wp: "म्लान बिंदु (θ_WP)",
        ksat: "हाइड्रोलिक चालकता (Ksat)",
        pumpRating: "सौर पम्प क्षमता",
        arrayCapacity: "सौर पैनल क्षमता",
        dischargeRate: "जल निर्वहन दर"
      }
    }
  }[lang] || {};

  const handleSimClick = (mode) => {
    setActiveSim(mode);
    if (onSimulateWeather) onSimulateWeather(mode);
  };

  const dr = waterBalance?.depletion_dr_mm != null ? waterBalance.depletion_dr_mm : 18.2;
  const raw = waterBalance?.raw_mm != null ? waterBalance.raw_mm : 38.4;
  const taw = waterBalance?.taw_mm != null ? waterBalance.taw_mm : 82.5;
  const cwsi = waterBalance?.cwsi != null ? waterBalance.cwsi : 0.18;
  const etcAdj = waterBalance?.etc_adj_mm_day != null ? waterBalance.etc_adj_mm_day : 4.8;
  const et0 = waterBalance?.et0_fao56_mm_day != null ? waterBalance.et0_fao56_mm_day : 4.65;
  const ks = waterBalance?.ks != null ? waterBalance.ks : 1.0;

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1100, padding: '20px' }}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '920px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '32px 36px',
          background: 'var(--bg-surface)',
          border: '1.5px solid var(--border-card)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-elevated)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '18px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(5, 150, 105, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Calculator size={20} color="var(--primary-emerald)" />
              </div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                {t.modalTitle}
              </h2>
            </div>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', margin: 0, maxWidth: '720px' }}>
              {t.modalSub}
            </p>
          </div>

          <button
            onClick={onClose}
            className="btn-secondary"
            style={{ padding: '8px 14px', borderRadius: 'var(--radius-full)' }}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* =========================================================================
            SECTION 1: INTERACTIVE SIMULATOR (Live Changes in Data Demo)
            ========================================================================= */}
        <div style={{
          background: 'var(--bg-surface-elevated)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '22px',
          marginBottom: '28px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} color="var(--solar-amber)" />
              <strong style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                {t.simTitle}
              </strong>
            </div>

            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-full)',
              padding: '4px 14px',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
              fontWeight: 600
            }}>
              <span>{t.activeSimLabel}: </span>
              <span style={{ color: 'var(--primary-emerald)', fontWeight: 800 }}>
                {activeSim === 'SUNNY_PEAK' ? t.simSun : activeSim === 'RAIN_FALL' ? t.simRain : activeSim === 'HEAT_STRESS' ? t.simHeat : t.simReset}
              </span>
            </div>
          </div>

          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            {t.simSub}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <button
              type="button"
              onClick={() => handleSimClick('SUNNY_PEAK')}
              style={{
                padding: '12px 16px',
                fontSize: '0.95rem',
                fontWeight: 700,
                background: activeSim === 'SUNNY_PEAK' ? 'rgba(217, 119, 6, 0.14)' : 'var(--bg-surface)',
                border: activeSim === 'SUNNY_PEAK' ? '2px solid var(--solar-amber)' : '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              <Sun size={18} color="var(--solar-amber)" />
              <span>{t.simSun}</span>
            </button>

            <button
              type="button"
              onClick={() => handleSimClick('RAIN_FALL')}
              style={{
                padding: '12px 16px',
                fontSize: '0.95rem',
                fontWeight: 700,
                background: activeSim === 'RAIN_FALL' ? 'rgba(2, 132, 199, 0.14)' : 'var(--bg-surface)',
                border: activeSim === 'RAIN_FALL' ? '2px solid var(--sky-blue)' : '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              <CloudRain size={18} color="var(--sky-blue)" />
              <span>{t.simRain}</span>
            </button>

            <button
              type="button"
              onClick={() => handleSimClick('HEAT_STRESS')}
              style={{
                padding: '12px 16px',
                fontSize: '0.95rem',
                fontWeight: 700,
                background: activeSim === 'HEAT_STRESS' ? 'rgba(220, 38, 38, 0.14)' : 'var(--bg-surface)',
                border: activeSim === 'HEAT_STRESS' ? '2px solid #dc2626' : '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              <Flame size={18} color="#dc2626" />
              <span>{t.simHeat}</span>
            </button>

            <button
              type="button"
              onClick={() => handleSimClick('RESET')}
              style={{
                padding: '12px 16px',
                fontSize: '0.95rem',
                fontWeight: 700,
                background: activeSim === 'RESET' ? 'rgba(5, 150, 105, 0.14)' : 'var(--bg-surface)',
                border: activeSim === 'RESET' ? '2px solid var(--primary-emerald)' : '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              <RotateCcw size={16} />
              <span>{t.simReset}</span>
            </button>
          </div>
        </div>

        {/* =========================================================================
            SECTION 2: FAO-56 EQUATIONS & REAL-TIME HYDROLOGY
            ========================================================================= */}
        <div style={{ marginBottom: '28px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Droplets size={18} color="var(--primary-emerald)" />
            {t.faoTitle}
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '14px'
          }}>
            <div style={{ background: 'var(--bg-surface-elevated)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>{t.metrics.et0}</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                {et0.toFixed(2)} <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>mm/day</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Penman-Monteith (ASCE standardized)
              </div>
            </div>

            <div style={{ background: 'var(--bg-surface-elevated)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>{t.metrics.etcAdj}</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--sky-blue)', marginTop: '4px' }}>
                {etcAdj.toFixed(2)} <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>mm/day</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                (Ks × Kcb + Ke) × ET₀
              </div>
            </div>

            <div style={{ background: 'var(--bg-surface-elevated)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>{t.metrics.dr}</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: dr >= raw ? '#dc2626' : 'var(--primary-emerald)', marginTop: '4px' }}>
                {dr.toFixed(1)} <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>mm</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Threshold RAW: {raw.toFixed(1)} mm
              </div>
            </div>

            <div style={{ background: 'var(--bg-surface-elevated)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>{t.metrics.cwsi}</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: cwsi > 0.4 ? '#dc2626' : 'var(--primary-emerald)', marginTop: '4px' }}>
                {cwsi.toFixed(2)}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {cwsi > 0.4 ? 'Water stress trigger reached' : 'Optimal transpiration regime'}
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            SECTION 3: PEDOTRANSFER & SOIL HYDRAULICS
            ========================================================================= */}
        <div style={{ marginBottom: '28px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={18} color="var(--primary-emerald)" />
            {t.soilTitle}
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '14px'
          }}>
            <div style={{ background: 'var(--bg-surface)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t.metrics.fc}:</span>
              <strong style={{ display: 'block', fontSize: '1.1rem', color: 'var(--text-primary)', marginTop: '2px' }}>
                {soil?.field_capacity ? `${(soil.field_capacity * 100).toFixed(1)}%` : '28.4% vol'}
              </strong>
            </div>

            <div style={{ background: 'var(--bg-surface)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t.metrics.wp}:</span>
              <strong style={{ display: 'block', fontSize: '1.1rem', color: 'var(--text-primary)', marginTop: '2px' }}>
                {soil?.wilting_point ? `${(soil.wilting_point * 100).toFixed(1)}%` : '14.2% vol'}
              </strong>
            </div>

            <div style={{ background: 'var(--bg-surface)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t.metrics.taw}:</span>
              <strong style={{ display: 'block', fontSize: '1.1rem', color: 'var(--text-primary)', marginTop: '2px' }}>
                {taw.toFixed(1)} mm
              </strong>
            </div>

            <div style={{ background: 'var(--bg-surface)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t.metrics.ksat}:</span>
              <strong style={{ display: 'block', fontSize: '1.1rem', color: 'var(--text-primary)', marginTop: '2px' }}>
                14.8 mm/hr (Moderate Drip Infiltration)
              </strong>
            </div>
          </div>
        </div>

        {/* Footer Close Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
          <button
            onClick={onClose}
            className="btn-primary"
            style={{ padding: '12px 28px', fontSize: '1rem' }}
          >
            {t.closeBtn}
          </button>
        </div>
      </div>
    </div>
  );
}
