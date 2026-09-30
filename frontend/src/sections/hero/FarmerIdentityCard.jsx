import React, { useState } from 'react';
import { 
  User, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  Zap, 
  Sun, 
  Sparkles,
  CloudRain,
  Flame,
  RotateCcw,
  CheckCircle2,
  Building2,
  Layers
} from 'lucide-react';
import { DEMO_PROFILES, setCurrentUser } from '../../services/api';

export default function FarmerIdentityCard({
  user,
  field,
  weather,
  waterBalance,
  lang = 'en',
  onSwitchProfile,
  onSimulateWeather
}) {
  const currentProfile = DEMO_PROFILES.find(p => p.id === user?.id) || user || DEMO_PROFILES[0];
  const isAdmin = currentProfile?.role === 'ADMIN' || user?.role === 'ADMIN';
  const [activeSim, setActiveSim] = useState('RESET');

  const t = {
    en: {
      accountBadge: isAdmin ? "Central Agronomy Admin Console" : "Verified Farmer Account",
      stateLabel: "State / District",
      phoneLabel: "Registered Mobile",
      farmLabel: "Estate / Farm Name",
      pumpLabel: "Solar Irrigation System",
      tariffLabel: "Annual Tariff Offset",
      switchStateHeading: "Benchmark State Farm Network",
      switchStateSub: "Switch between 4 benchmark agricultural states or Central Admin to inspect real regional field parameters:",
      simulateHeading: "Live Environmental & Telemetry Simulator",
      simNotice: "Trigger live weather and water stress shifts to observe instant adjustments in solar pump operation and soil moisture advisories:",
      simSun: "☀️ Peak Sun (820 W/m²)",
      simRain: "🌧️ Active Rainfall (18mm)",
      simHeat: "🏜️ Dry Heatwave (CWSI Stress)",
      simReset: "🔄 Reset Baseline",
      activeStateTag: "Active Field",
      currentSimLabel: "Simulated Condition"
    },
    hi: {
      accountBadge: isAdmin ? "केंद्रीय कृषि व ग्रिड प्रशासक कंसोल" : "सत्यापित किसान खाता",
      stateLabel: "राज्य व जिला",
      phoneLabel: "पंजीकृत मोबाइल",
      farmLabel: "खेत व फार्म का नाम",
      pumpLabel: "सौर पम्प प्रणाली",
      tariffLabel: "सालाना बिजली बचत",
      switchStateHeading: "चार राज्य मॉडल फार्म नेटवर्क",
      switchStateSub: "हरियाणा, पंजाब, उत्तर प्रदेश, राजस्थान या एडमिन कंसोल चुनकर क्षेत्रीय आंकड़े देखें:",
      simulateHeading: "सजीव मौसम व जल तनाव सिम्युलेटर",
      simNotice: "बटन दबाकर मौसम बदलें और देखें कि सौर पम्प, मिट्टी में नमी और सलाह कैसे तुरंत अपने आप बदलती है:",
      simSun: "☀️ प्रखर धूप (820 W/m²)",
      simRain: "🌧️ भारी बारिश (18mm)",
      simHeat: "🏜️ तेज गर्मी व जल तनाव",
      simReset: "🔄 सामान्य स्थिति",
      activeStateTag: "सक्रिय खेत",
      currentSimLabel: "वर्तमान स्थिति"
    }
  }[lang] || {};

  const handleSimClick = (mode) => {
    setActiveSim(mode);
    if (onSimulateWeather) onSimulateWeather(mode);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', marginBottom: '36px' }}>
      {/* =========================================================================
          SECTION 1: ACTIVE FARMER PROFILE CARD (Clean, High Readability, Spacious)
          ========================================================================= */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1.5px solid var(--border-card)',
        borderRadius: 'var(--radius-xl)',
        padding: '32px 36px',
        boxShadow: 'var(--shadow-card)',
        position: 'relative'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '24px',
          paddingBottom: '24px',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          {/* Farmer Avatar & Full Identity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{
              width: '68px',
              height: '68px',
              borderRadius: '20px',
              background: isAdmin 
                ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' 
                : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.2rem',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
              flexShrink: 0
            }}>
              {currentProfile.avatar || '👨‍🌾'}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <span className="pulse-dot" style={{ background: isAdmin ? 'var(--solar-amber)' : 'var(--primary-emerald)' }} />
                <span style={{
                  fontSize: '0.92rem',
                  fontWeight: 800,
                  color: isAdmin ? 'var(--solar-amber)' : 'var(--primary-emerald-light)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em'
                }}>
                  {t.accountBadge}
                </span>
              </div>

              <h2 style={{ fontSize: '2.0rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', marginBottom: '6px' }}>
                {currentProfile.full_name}
              </h2>

              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '14px', fontSize: '1.02rem', color: 'var(--text-secondary)' }}>
                <span>✉️ {currentProfile.email}</span>
                <span>•</span>
                <span>📞 {currentProfile.phone}</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-active)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <MapPin size={22} color="var(--primary-emerald)" />
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>
                  {t.stateLabel}
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
                  {lang === 'hi' ? (currentProfile.stateHi || currentProfile.state) : currentProfile.state}
                </div>
              </div>
            </div>

            <div style={{
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-solar)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <Zap size={22} color="var(--solar-amber)" />
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>
                  {t.tariffLabel}
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--solar-amber)' }}>
                  {currentProfile.farm?.grid_tariff_offset || '₹94,200/yr saved'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Farm & Solar Pump Specs Strip */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '18px',
          paddingTop: '20px'
        }}>
          <div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>
              {t.farmLabel}
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>
              {currentProfile.farm?.name || 'Karnal Model Agro-Solar Estate'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>
              {t.pumpLabel}
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary-emerald-light)' }}>
              {currentProfile.farm?.pump_type || '5.0 HP Submersible Solar Pump'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>
              Irrigation Grid
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              {currentProfile.farm?.irrigation_source || 'Solar Microgrid (PM-KUSUM)'}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 2: BENCHMARK STATE FARM NETWORK (Distinct Card, Generous Spacing)
          ========================================================================= */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1.5px solid var(--border-card)',
        borderRadius: 'var(--radius-xl)',
        padding: '28px 32px',
        boxShadow: 'var(--shadow-card)'
      }}>
        <div style={{ marginBottom: '18px' }}>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', marginBottom: '6px' }}>
            {t.switchStateHeading}
          </h3>
          <p style={{ fontSize: '1.0rem', color: 'var(--text-secondary)' }}>
            {t.switchStateSub}
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '14px'
        }}>
          {DEMO_PROFILES.map((p) => {
            const isSelected = p.id === currentProfile.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setCurrentUser(p);
                  if (onSwitchProfile) onSwitchProfile(p);
                }}
                style={{
                  background: isSelected 
                    ? 'rgba(16, 185, 129, 0.16)' 
                    : 'var(--bg-surface-elevated)',
                  border: isSelected 
                    ? '2px solid var(--primary-emerald)' 
                    : '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: isSelected ? '0 4px 20px rgba(16, 185, 129, 0.25)' : 'none'
                }}
              >
                <div style={{
                  fontSize: '1.8rem',
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: isSelected ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {p.avatar}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    color: isSelected ? '#ffffff' : 'var(--text-primary)',
                    marginBottom: '2px'
                  }}>
                    {lang === 'hi' ? (p.stateHi || p.state) : p.state}
                  </div>
                  <div style={{
                    fontSize: '0.92rem',
                    color: isSelected ? 'var(--primary-emerald-light)' : 'var(--text-tertiary)',
                    fontWeight: 600,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {p.full_name.split('(')[0].trim()}
                  </div>
                </div>

                {isSelected && (
                  <CheckCircle2 size={20} color="var(--primary-emerald)" style={{ flexShrink: 0 }} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          SECTION 3: INTERACTIVE TELEMETRY SIMULATOR (Dedicated Studio Panel)
          ========================================================================= */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1.5px solid var(--border-card)',
        borderRadius: 'var(--radius-xl)',
        padding: '28px 32px',
        boxShadow: 'var(--shadow-card)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '20px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <Sparkles size={20} color="var(--solar-amber)" />
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff' }}>
                {t.simulateHeading}
              </h3>
            </div>
            <p style={{ fontSize: '1.0rem', color: 'var(--text-secondary)', maxWidth: '780px' }}>
              {t.simNotice}
            </p>
          </div>

          <div style={{
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-full)',
            padding: '6px 16px',
            fontSize: '0.9rem',
            color: 'var(--text-secondary)'
          }}>
            <span>{t.currentSimLabel}: </span>
            <strong style={{ color: activeSim === 'SUNNY_PEAK' ? 'var(--solar-amber)' : activeSim === 'RAIN_FALL' ? 'var(--sky-blue)' : activeSim === 'HEAT_STRESS' ? '#ef4444' : 'var(--primary-emerald-light)' }}>
              {activeSim === 'SUNNY_PEAK' ? t.simSun : activeSim === 'RAIN_FALL' ? t.simRain : activeSim === 'HEAT_STRESS' ? t.simHeat : t.simReset}
            </strong>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: '14px'
        }}>
          <button
            type="button"
            onClick={() => handleSimClick('SUNNY_PEAK')}
            style={{
              padding: '16px 20px',
              fontSize: '1.02rem',
              fontWeight: 700,
              background: activeSim === 'SUNNY_PEAK' ? 'rgba(245, 158, 11, 0.22)' : 'var(--bg-surface-elevated)',
              border: activeSim === 'SUNNY_PEAK' ? '2px solid var(--solar-amber)' : '1px solid var(--border-subtle)',
              color: '#ffffff',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: activeSim === 'SUNNY_PEAK' ? '0 4px 18px rgba(245, 158, 11, 0.35)' : 'none'
            }}
          >
            <Sun size={20} color="var(--solar-amber)" />
            <span>{t.simSun}</span>
          </button>

          <button
            type="button"
            onClick={() => handleSimClick('RAIN_FALL')}
            style={{
              padding: '16px 20px',
              fontSize: '1.02rem',
              fontWeight: 700,
              background: activeSim === 'RAIN_FALL' ? 'rgba(56, 189, 248, 0.22)' : 'var(--bg-surface-elevated)',
              border: activeSim === 'RAIN_FALL' ? '2px solid var(--sky-blue)' : '1px solid var(--border-subtle)',
              color: '#ffffff',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: activeSim === 'RAIN_FALL' ? '0 4px 18px rgba(56, 189, 248, 0.35)' : 'none'
            }}
          >
            <CloudRain size={20} color="var(--sky-blue)" />
            <span>{t.simRain}</span>
          </button>

          <button
            type="button"
            onClick={() => handleSimClick('HEAT_STRESS')}
            style={{
              padding: '16px 20px',
              fontSize: '1.02rem',
              fontWeight: 700,
              background: activeSim === 'HEAT_STRESS' ? 'rgba(239, 68, 68, 0.22)' : 'var(--bg-surface-elevated)',
              border: activeSim === 'HEAT_STRESS' ? '2px solid #ef4444' : '1px solid var(--border-subtle)',
              color: '#ffffff',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: activeSim === 'HEAT_STRESS' ? '0 4px 18px rgba(239, 68, 68, 0.35)' : 'none'
            }}
          >
            <Flame size={20} color="#ef4444" />
            <span>{t.simHeat}</span>
          </button>

          <button
            type="button"
            onClick={() => handleSimClick('RESET')}
            style={{
              padding: '16px 20px',
              fontSize: '1.02rem',
              fontWeight: 700,
              background: activeSim === 'RESET' ? 'rgba(16, 185, 129, 0.22)' : 'var(--bg-surface-elevated)',
              border: activeSim === 'RESET' ? '2px solid var(--primary-emerald)' : '1px solid var(--border-subtle)',
              color: '#ffffff',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <RotateCcw size={18} />
            <span>{t.simReset}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
