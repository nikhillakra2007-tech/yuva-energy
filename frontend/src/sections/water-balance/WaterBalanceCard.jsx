import React from 'react';
import { Droplets, Layers } from 'lucide-react';

export default function WaterBalanceCard({ waterBalance, soil, lang = 'en' }) {
  const t = {
    en: {
      title: "Root Zone Water Balance (FAO-56)",
      depletionTitle: "Root Zone Depletion (Dr)",
      withinRaw: "Safe Zone (Within RAW)",
      exceededRaw: "Stress Zone (Exceeded RAW)",
      rawLabel: "Readily Available Water (RAW)",
      tawLabel: "Total Available Water (TAW)",
      soilHydraulics: "Soil Hydraulic Profile",
      fc: "Field Capacity (θ_FC)",
      wp: "Wilting Point (θ_WP)",
      awc: "Available Water (AWC)",
      rootDepth: "Effective Root Depth (Zr)",
      stressIndex: "Crop Water Stress Index (CWSI)",
      stressLow: "Low Transpiration Stress",
      stressHigh: "Stomatal Closure / Wilting Risk",
      transpirationRate: "Adjusted Crop ET (ETc,adj)",
      reductionFactor: "Stress Coefficient (Ks)"
    },
    hi: {
      title: "जड़ क्षेत्र जल संतुलन (FAO-56)",
      depletionTitle: "जड़ क्षेत्र जल कमी (Dr)",
      withinRaw: "सुरक्षित क्षेत्र (RAW के भीतर)",
      exceededRaw: "तनाव क्षेत्र (सिंचाई आवश्यक)",
      rawLabel: "आसानी से उपलब्ध जल (RAW)",
      tawLabel: "कुल उपलब्ध जल (TAW)",
      soilHydraulics: "मृदा जल धारण क्षमता",
      fc: "क्षेत्र क्षमता (θ_FC)",
      wp: "म्लान बिंदु (θ_WP)",
      awc: "उपलब्ध जल क्षमता (AWC)",
      rootDepth: "प्रभावी जड़ गहराई (Zr)",
      stressIndex: "फसल जल तनाव सूचकांक (CWSI)",
      stressLow: "कम वाष्पोत्सर्जन तनाव",
      stressHigh: "मुरझाने का जोखिम",
      transpirationRate: "समायोजित फसल वाष्पोत्सर्जन (ETc,adj)",
      reductionFactor: "तनाव गुणांक (Ks)"
    }
  }[lang] || {};

  // Hydrology values from waterBalance prop or defaults
  const dr = waterBalance?.depletion_dr_mm != null ? waterBalance.depletion_dr_mm : 22.4;
  const raw = waterBalance?.raw_mm != null ? waterBalance.raw_mm : 42.0;
  const taw = waterBalance?.taw_mm != null ? waterBalance.taw_mm : 84.0;
  const ks = waterBalance?.ks != null ? waterBalance.ks : 1.0;
  const cwsi = waterBalance?.cwsi != null ? waterBalance.cwsi : 0.18;
  const etcAdj = waterBalance?.etc_adj_mm_day != null ? waterBalance.etc_adj_mm_day : 4.8;
  const rootDepthM = waterBalance?.root_depth_m != null ? waterBalance.root_depth_m : 0.65;

  // Percentage calculations
  const rawPct = Math.min(100, Math.max(0, (raw / taw) * 100));
  const drPct = Math.min(100, Math.max(0, (dr / taw) * 100));
  const isStressed = dr >= raw;

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
            background: 'rgba(5, 150, 105, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Droplets size={20} color="var(--primary-emerald)" />
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            {t.title}
          </h3>
        </div>
        <span className={`badge ${isStressed ? 'badge-critical' : 'badge-optimal'}`}>
          {isStressed ? t.exceededRaw : t.withinRaw}
        </span>
      </div>

      {/* Depletion Progress Gauge */}
      <div style={{ marginBottom: '22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{t.depletionTitle}</span>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: isStressed ? '#dc2626' : 'var(--primary-emerald)' }}>
            {dr.toFixed(1)} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>/ {taw.toFixed(1)} mm</span>
          </span>
        </div>

        {/* Depletion Bar with RAW threshold indicator */}
        <div style={{ 
          position: 'relative', 
          width: '100%', 
          height: '16px', 
          backgroundColor: 'var(--bg-surface-elevated)', 
          borderRadius: 'var(--radius-full)', 
          overflow: 'hidden',
          border: '1px solid var(--border-subtle)'
        }}>
          {/* Fill Bar */}
          <div style={{
            height: '100%',
            width: `${drPct}%`,
            background: isStressed 
              ? 'linear-gradient(90deg, #059669 0%, #d97706 60%, #dc2626 100%)' 
              : 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
            borderRadius: 'var(--radius-full)',
            transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
          }} />

          {/* RAW Threshold Marker */}
          <div style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: `${rawPct}%`,
            width: '2px',
            backgroundColor: '#d97706',
            zIndex: 2
          }} />
        </div>

        {/* Legend for Depletion Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '0.76rem', color: 'var(--text-tertiary)' }}>
          <span>0 mm (Field Capacity)</span>
          <span style={{ color: '#d97706', fontWeight: 700 }}>RAW: {raw.toFixed(1)} mm</span>
          <span>TAW: {taw.toFixed(1)} mm</span>
        </div>
      </div>

      {/* Grid of Key Metrics */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(2, 1fr)', 
        gap: '12px', 
        marginBottom: '18px',
        padding: '14px',
        backgroundColor: 'var(--bg-surface-elevated)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)'
      }}>
        {/* CWSI */}
        <div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{t.stressIndex}</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: cwsi > 0.4 ? '#dc2626' : 'var(--primary-emerald)', marginTop: '2px' }}>
            {cwsi.toFixed(2)}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
            {cwsi <= 0.4 ? t.stressLow : t.stressHigh}
          </div>
        </div>

        {/* Ks Stress Coefficient */}
        <div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{t.reductionFactor}</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
            {ks.toFixed(2)}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
            {ks === 1.0 ? 'Transpiration 100% full' : `${Math.round((1 - ks) * 100)}% stress reduction`}
          </div>
        </div>

        {/* Adjusted ETc */}
        <div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{t.transpirationRate}</div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--sky-blue)', marginTop: '2px' }}>
            {etcAdj.toFixed(2)} <span style={{ fontSize: '0.75rem', fontWeight: 400 }}>mm/d</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Daily crop water demand</div>
        </div>

        {/* Root Depth */}
        <div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{t.rootDepth}</div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
            {(rootDepthM * 100).toFixed(0)} <span style={{ fontSize: '0.75rem', fontWeight: 400 }}>cm</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Active root zone</div>
        </div>
      </div>

      {/* Hydraulic Details Footer */}
      <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
          <Layers size={14} color="var(--primary-emerald)" />
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{t.soilHydraulics}</span>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
          <span>{t.fc}: <strong>{soil?.field_capacity != null ? `${(soil.field_capacity * 100).toFixed(1)}%` : '28.0%'}</strong></span>
          <span>{t.wp}: <strong>{soil?.wilting_point != null ? `${(soil.wilting_point * 100).toFixed(1)}%` : '14.0%'}</strong></span>
          <span>{t.awc}: <strong>{soil?.available_water_capacity != null ? `${(soil.available_water_capacity * 100).toFixed(1)}%` : '14.0%'}</strong></span>
        </div>
      </div>
    </div>
  );
}
