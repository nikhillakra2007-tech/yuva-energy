import React from 'react';
import { 
  Sprout, 
  RefreshCw, 
  MapPin, 
  Languages, 
  User, 
  LogOut, 
  Plus, 
  Mic, 
  Compass, 
  LayoutDashboard, 
  SunMedium, 
  Type
} from 'lucide-react';

export default function Navbar({
  currentView = 'landing',
  onChangeView,
  fields = [],
  selectedField,
  onSelectField,
  lang = 'en',
  onToggleLang,
  user,
  onOpenAuth,
  onLogout,
  onSync,
  isSyncing = false,
  onNewField,
  onOpenVoice,
  fontScale = 1,
  onChangeFontScale,
  isHighContrast = false,
  onToggleHighContrast
}) {
  const t = {
    en: {
      landingTab: "Overview",
      consoleTab: "Farm Console",
      authTab: "Farmer Login",
      voiceBtn: "Voice AI",
      syncBtn: "Sync Data",
      syncing: "Syncing...",
      newField: "Add Field",
      contrast: "High Contrast",
      fontSize: "Text Size"
    },
    hi: {
      landingTab: "परिचय",
      consoleTab: "खेत डैशबोर्ड",
      authTab: "किसान लॉगिन",
      voiceBtn: "आवाज सहायक",
      syncBtn: "डेटा सिंक",
      syncing: "सिंक हो रहा...",
      newField: "नया खेत",
      contrast: "तेज चमक",
      fontSize: "अक्षर आकार"
    }
  }[lang] || {};

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backgroundColor: 'rgba(6, 18, 13, 0.95)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1.5px solid var(--border-subtle)',
      padding: '14px 28px'
    }}>
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* Left: Brand & Live Indicator */}
        <div 
          onClick={() => onChangeView('landing')}
          style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }}
          title="Return to Yuva Energy Overview"
        >
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #10b981 0%, #f59e0b 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4)'
          }}>
            <Sprout size={26} color="#06120d" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.35rem',
                fontWeight: '800',
                letterSpacing: '-0.025em',
                color: '#ffffff'
              }}>
                YUVA <span style={{ color: 'var(--solar-amber)' }}>ENERGY</span>
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="pulse-dot" />
                <span style={{ fontSize: '0.75rem', color: 'var(--primary-emerald-light)', fontWeight: 800, letterSpacing: '0.05em' }}>LIVE</span>
              </div>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Solar-Powered Precision Agronomy
            </p>
          </div>
        </div>

        {/* Center: Three-Tier View Navigation Tabs */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'var(--bg-surface)',
          padding: '4px',
          borderRadius: 'var(--radius-full)',
          border: '1px solid var(--border-subtle)'
        }}>
          <button
            onClick={() => onChangeView('landing')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              background: currentView === 'landing' ? 'var(--primary-emerald)' : 'transparent',
              color: currentView === 'landing' ? '#ffffff' : 'var(--text-secondary)',
              border: 'none',
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            <Compass size={16} />
            <span>{t.landingTab}</span>
          </button>

          <button
            id="nav-console-tab"
            onClick={() => onChangeView('dashboard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              background: currentView === 'dashboard' ? 'var(--primary-emerald)' : 'transparent',
              color: currentView === 'dashboard' ? '#ffffff' : 'var(--text-secondary)',
              border: 'none',
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            <LayoutDashboard size={16} />
            <span>{t.consoleTab}</span>
          </button>

          {!user && (
            <button
              onClick={() => onChangeView('auth')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: 'var(--radius-full)',
                background: currentView === 'auth' ? 'var(--primary-emerald)' : 'transparent',
                color: currentView === 'auth' ? '#ffffff' : 'var(--text-secondary)',
                border: 'none',
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              <User size={16} />
              <span>{t.authTab}</span>
            </button>
          )}
        </div>

        {/* Center-Right: Field Selector (Only in Console Mode) */}
        {currentView === 'dashboard' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '8px 14px'
            }}>
              <MapPin size={16} color="var(--primary-emerald)" />
              <select
                id="field-selector"
                value={selectedField?.id || ''}
                onChange={(e) => {
                  const found = fields.find(f => f.id === e.target.value);
                  if (found) onSelectField(found);
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {fields.length === 0 ? (
                  <option value="">No Active Fields</option>
                ) : (
                  fields.map((f) => (
                    <option key={f.id} value={f.id} style={{ background: '#0b1f16' }}>
                      {f.name} ({f.crop_name || 'Active Crop'})
                    </option>
                  ))
                )}
              </select>
            </div>

            {onNewField && (
              <button
                onClick={onNewField}
                className="btn-secondary"
                style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                title="Register New Field Plot"
              >
                <Plus size={14} />
                <span>{t.newField}</span>
              </button>
            )}

            {selectedField && (
              <button
                id="sync-telemetry-btn"
                onClick={onSync}
                disabled={isSyncing}
                className="btn-secondary"
                style={{ padding: '8px 14px', fontSize: '0.85rem' }}
                title="Synchronize weather, soil, and satellite data"
              >
                <RefreshCw 
                  size={14} 
                  style={{ animation: isSyncing ? 'spin 1s linear infinite' : 'none' }} 
                />
                <span>{isSyncing ? t.syncing : t.syncBtn}</span>
              </button>
            )}
          </div>
        )}

        {/* Right: Accessibility Controls & User Session */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Quick Voice Launch Button */}
          <button
            id="nav-voice-assistant-btn"
            onClick={onOpenVoice}
            className="btn-solar"
            style={{ padding: '8px 16px', fontSize: '0.9rem', borderRadius: 'var(--radius-full)' }}
            title="Open Vernacular Voice Assistant"
          >
            <Mic size={16} />
            <span>{t.voiceBtn}</span>
          </button>

          {/* Font Size Accessibility Scaler */}
          <button
            onClick={() => {
              const nextScale = fontScale === 1 ? 1.2 : fontScale === 1.2 ? 1.4 : 1;
              onChangeFontScale(nextScale);
            }}
            className="btn-secondary"
            style={{ padding: '8px 12px', fontSize: '0.85rem' }}
            title="Adjust Font Size for Easier Reading (Older Farmers / Poor Eyesight)"
          >
            <Type size={15} />
            <span>{fontScale === 1 ? 'A' : fontScale === 1.2 ? 'A+' : 'A++'}</span>
          </button>

          {/* High Contrast Mode Toggle */}
          <button
            onClick={onToggleHighContrast}
            className="btn-secondary"
            style={{
              padding: '8px 12px',
              fontSize: '0.85rem',
              borderColor: isHighContrast ? 'var(--primary-emerald)' : 'var(--border-subtle)'
            }}
            title="High Contrast Mode for Sunlight Readability"
          >
            <SunMedium size={15} color={isHighContrast ? 'var(--solar-amber)' : 'var(--text-secondary)'} />
          </button>

          {/* Language Toggle */}
          <button
            id="lang-toggle-btn"
            onClick={onToggleLang}
            className="btn-secondary"
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
            title="Switch Language / भाषा बदलें"
          >
            <Languages size={15} />
            <span>{lang === 'hi' ? 'हिन्दी' : 'English'}</span>
          </button>

          {/* User Session Profile */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: 'var(--radius-md)',
                padding: '6px 12px'
              }}>
                <User size={15} color="var(--primary-emerald)" />
                <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>{user.full_name || user.email}</span>
              </div>
              <button
                id="logout-btn"
                onClick={onLogout}
                className="btn-secondary"
                style={{ padding: '8px' }}
                title="Log Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onChangeView('auth')}
              className="btn-primary"
              style={{ padding: '8px 18px', fontSize: '0.9rem' }}
            >
              {lang === 'hi' ? 'लॉग इन' : 'Sign In'}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
