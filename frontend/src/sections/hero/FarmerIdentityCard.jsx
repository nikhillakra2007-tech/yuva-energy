import React from 'react';
import { 
  User, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  Zap, 
  Droplets, 
  Sun, 
  Building, 
  Layers, 
  Sparkles,
  CloudSun,
  CloudRain,
  Flame,
  RotateCcw
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

  const t = {
    en: {
      accountBadge: isAdmin ? "Central Agronomy Admin Console" : "Verified Farmer Account",
      stateLabel: "State / Jurisdiction",
      phoneLabel: "Registered Phone",
      farmLabel: "Estate / Farm Name",
      pumpLabel: "Solar Irrigation System",
      tariffLabel: "Tariff Offset",
      switchStateHeading: "Multi-State Farm Network (Haryana · Punjab · UP · Rajasthan · Admin)",
      simulateHeading: "Simulate Real-Time Telemetry & Weather Changes",
      simSun: "☀️ Peak Sun (820 W/m²)",
      simRain: "🌧️ Rainfall (18mm)",
      simHeat: "🏜️ Dry Heatwave (CWSI Stress)",
      simReset: "🔄 Reset Baseline",
      simNotice: "Click to simulate live environmental shifts and observe dynamic adjustments in solar pumping, soil moisture, and agronomy advisories."
    },
    hi: {
      accountBadge: isAdmin ? "केंद्रीय कृषि व ग्रिड प्रशासक कंसोल" : "सत्यापित किसान खाता",
      stateLabel: "राज्य व कार्यक्षेत्र",
      phoneLabel: "पंजीकृत मोबाइल",
      farmLabel: "खेत व फार्म का नाम",
      pumpLabel: "सौर पम्प प्रणाली",
      tariffLabel: "सालाना बिजली बचत",
      switchStateHeading: "चार राज्य नेटवर्क (हरियाणा · पंजाब · उत्तर प्रदेश · राजस्थान · एडमिन)",
      simulateHeading: "मौसम व डेटा में लाइव बदलाव का अनुभव करें",
      simSun: "☀️ प्रखर धूप (820 W/m²)",
      simRain: "🌧️ अच्छी बारिश (18mm)",
      simHeat: "🏜️ तेज गर्मी व जल तनाव",
      simReset: "🔄 सामान्य स्थिति",
      simNotice: "बटन दबाकर मौसम बदलें और देखें कि सौर पम्प, मिट्टी में नमी और सलाह कैसे तुरंत अपने आप बदलती है।"
    }
  }[lang] || {};

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(14, 28, 22, 0.95) 0%, rgba(18, 42, 32, 0.9) 100%)',
      border: '1.5px solid var(--border-active)',
      borderRadius: 'var(--radius-xl)',
      padding: '28px 32px',
      marginBottom: '32px',
      boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Subtle Solar Flare */}
      <div style={{
        position: 'absolute',
        top: '-40%',
        right: '-10%',
        width: '350px',
        height: '350px',
        background: 'radial-gradient(circle, rgba(245, 158, 11, 0.12) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      {/* Top Identity Row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px',
        paddingBottom: '24px',
        borderBottom: '1px solid var(--border-subtle)',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '18px',
            background: isAdmin ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.8rem',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
          }}>
            {currentProfile.avatar || '👨‍🌾'}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <span className="pulse-dot" style={{ background: isAdmin ? 'var(--solar-amber)' : 'var(--primary-emerald)' }} />
              <span style={{
                fontSize: '0.8rem',
                fontWeight: 800,
                color: isAdmin ? 'var(--solar-amber)' : 'var(--primary-emerald-light)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em'
              }}>
                {t.accountBadge}
              </span>
            </div>

            <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#ffffff' }}>
              {currentProfile.full_name}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              <span>✉️ {currentProfile.email}</span>
              <span>•</span>
              <span>📞 {currentProfile.phone}</span>
            </div>
          </div>
        </div>

        {/* State & Farm Details Badges */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid var(--border-active)',
            borderRadius: 'var(--radius-md)',
            padding: '8px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <MapPin size={16} color="var(--primary-emerald)" />
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>
                {t.stateLabel}
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#ffffff' }}>
                {lang === 'hi' ? (currentProfile.stateHi || currentProfile.state) : currentProfile.state}
              </div>
            </div>
          </div>

          <div style={{
            background: 'rgba(245, 158, 11, 0.12)',
            border: '1px solid var(--border-solar)',
            borderRadius: 'var(--radius-md)',
            padding: '8px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Zap size={16} color="var(--solar-amber)" />
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>
                {t.tariffLabel}
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--solar-amber)' }}>
                {currentProfile.farm?.grid_tariff_offset || '₹94,200/yr'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Row: State Switching Toolbar */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '10px' }}>
          {t.switchStateHeading}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
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
                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.28) 0%, rgba(245, 158, 11, 0.24) 100%)' 
                    : 'rgba(18, 45, 32, 0.5)',
                  border: isSelected ? '1.5px solid var(--primary-emerald)' : '1px solid var(--border-subtle)',
                  color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s',
                  boxShadow: isSelected ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none'
                }}
              >
                <span>{p.avatar}</span>
                <span>{lang === 'hi' ? (p.stateHi || p.state) : p.state}</span>
                <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>({p.full_name.split('(')[0].trim().split(' ')[0]})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Row: Live Telemetry Simulation Controls ("Demo Thing to show changes in data") */}
      <div style={{
        background: 'rgba(8, 20, 15, 0.75)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
            <Sparkles size={16} color="var(--solar-amber)" />
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ffffff' }}>
              {t.simulateHeading}
            </span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', maxWidth: '520px' }}>
            {t.simNotice}
          </p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <button
            type="button"
            onClick={() => onSimulateWeather('SUNNY_PEAK')}
            className="btn-secondary"
            style={{ padding: '8px 14px', fontSize: '0.82rem', borderColor: 'rgba(245, 158, 11, 0.4)' }}
            title="Simulate 820 W/m² solar peak"
          >
            <Sun size={14} color="var(--solar-amber)" />
            <span>{t.simSun}</span>
          </button>

          <button
            type="button"
            onClick={() => onSimulateWeather('RAIN_FALL')}
            className="btn-secondary"
            style={{ padding: '8px 14px', fontSize: '0.82rem', borderColor: 'rgba(14, 165, 233, 0.4)' }}
            title="Simulate 18mm rainfall event"
          >
            <CloudRain size={14} color="var(--sky-blue)" />
            <span>{t.simRain}</span>
          </button>

          <button
            type="button"
            onClick={() => onSimulateWeather('HEAT_STRESS')}
            className="btn-secondary"
            style={{ padding: '8px 14px', fontSize: '0.82rem', borderColor: 'rgba(239, 68, 68, 0.4)' }}
            title="Simulate dry heatwave and crop water stress"
          >
            <Flame size={14} color="#ef4444" />
            <span>{t.simHeat}</span>
          </button>

          <button
            type="button"
            onClick={() => onSimulateWeather('RESET')}
            className="btn-secondary"
            style={{ padding: '8px 12px', fontSize: '0.82rem' }}
            title="Reset telemetry to baseline"
          >
            <RotateCcw size={14} />
            <span>{t.simReset}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
