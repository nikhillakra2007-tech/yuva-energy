import React, { useState } from 'react';
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
  Type,
  ChevronDown,
  Calculator,
  Satellite,
  Menu,
  X
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
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const indicLanguages = [
    { code: 'hi', label: 'हिन्दी', region: 'North India / All India' },
    { code: 'en', label: 'English', region: 'Pan-India' },
    { code: 'pa', label: 'ਪੰਜਾਬੀ (Punjabi)', region: 'Punjab / Haryana' },
    { code: 'gu', label: 'ગુજરાતી (Gujarati)', region: 'Gujarat' },
    { code: 'mr', label: 'मराठी (Marathi)', region: 'Maharashtra' },
    { code: 'te', label: 'తెలుగు (Telugu)', region: 'Andhra Pradesh / Telangana' }
  ];

  const t = {
    en: {
      landingTab: "Overview",
      calcTab: "ROI Calculator",
      scannerTab: "Satellite Scan",
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
      calcTab: "बचत गणक",
      scannerTab: "उपग्रह स्कैनर",
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

  const scrollTo = (id) => {
    if (currentView !== 'landing') {
      onChangeView('landing');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backgroundColor: 'rgba(6, 18, 13, 0.95)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderBottom: '1.5px solid var(--border-subtle)',
      padding: '12px 24px'
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
            width: '42px',
            height: '42px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #10b981 0%, #f59e0b 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 18px rgba(16, 185, 129, 0.45)'
          }}>
            <Sprout size={24} color="#06120d" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.3rem',
                fontWeight: '800',
                letterSpacing: '-0.025em',
                color: '#ffffff'
              }}>
                YUVA <span style={{ color: 'var(--solar-amber)' }}>ENERGY</span>
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="pulse-dot" />
                <span style={{ fontSize: '0.72rem', color: 'var(--primary-emerald-light)', fontWeight: 800, letterSpacing: '0.05em' }}>LIVE</span>
              </div>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Autonomous Solar-Agro Precision Setu
            </p>
          </div>
        </div>

        {/* Center: Navigation Links */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'var(--bg-surface)',
          padding: '4px 6px',
          borderRadius: 'var(--radius-full)',
          border: '1px solid var(--border-subtle)'
        }} className="desktop-nav">
          <button
            onClick={() => {
              onChangeView('landing');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
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
              fontSize: '0.88rem',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            <Compass size={15} />
            <span>{t.landingTab}</span>
          </button>

          <button
            onClick={() => scrollTo('calculator-section')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: 'var(--radius-full)',
              background: 'transparent',
              color: 'var(--text-secondary)',
              border: 'none',
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              transition: 'color 0.2s'
            }}
          >
            <Calculator size={15} />
            <span>{t.calcTab}</span>
          </button>

          <button
            onClick={() => scrollTo('satellite-scanner-section')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: 'var(--radius-full)',
              background: 'transparent',
              color: 'var(--text-secondary)',
              border: 'none',
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              transition: 'color 0.2s'
            }}
          >
            <Satellite size={15} />
            <span>{t.scannerTab}</span>
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
              fontSize: '0.88rem',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            <LayoutDashboard size={15} />
            <span>{t.consoleTab}</span>
          </button>

          {!user && (
            <button
              onClick={() => onChangeView('auth')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: 'var(--radius-full)',
                background: currentView === 'auth' ? 'var(--primary-emerald)' : 'transparent',
                color: currentView === 'auth' ? '#ffffff' : 'var(--text-secondary)',
                border: 'none',
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              <User size={15} />
              <span>{t.authTab}</span>
            </button>
          )}
        </nav>

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
              padding: '6px 12px'
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
                  fontSize: '0.9rem',
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
                style={{ padding: '8px 12px', fontSize: '0.82rem' }}
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
                style={{ padding: '8px 14px', fontSize: '0.82rem' }}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Quick Voice Launch Button */}
          <button
            id="nav-voice-assistant-btn"
            onClick={onOpenVoice}
            className="btn-solar"
            style={{ padding: '8px 16px', fontSize: '0.88rem', borderRadius: 'var(--radius-full)' }}
            title="Open Vernacular Voice Assistant"
          >
            <Mic size={15} />
            <span>{t.voiceBtn}</span>
          </button>

          {/* Font Size Accessibility Scaler */}
          <button
            onClick={() => {
              const nextScale = fontScale === 1 ? 1.2 : fontScale === 1.2 ? 1.4 : 1;
              onChangeFontScale(nextScale);
            }}
            className="btn-secondary"
            style={{ padding: '8px 12px', fontSize: '0.82rem' }}
            title="Adjust Font Size for Easier Reading (Older Farmers / Poor Eyesight)"
          >
            <Type size={14} />
            <span>{fontScale === 1 ? 'A' : fontScale === 1.2 ? 'A+' : 'A++'}</span>
          </button>

          {/* High Contrast Mode Toggle */}
          <button
            onClick={onToggleHighContrast}
            className="btn-secondary"
            style={{
              padding: '8px 12px',
              fontSize: '0.82rem',
              borderColor: isHighContrast ? 'var(--primary-emerald)' : 'var(--border-subtle)'
            }}
            title="High Contrast Mode for Sunlight Readability"
          >
            <SunMedium size={14} color={isHighContrast ? 'var(--solar-amber)' : 'var(--text-secondary)'} />
          </button>

          {/* Language Selector Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              id="lang-toggle-btn"
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="btn-secondary"
              style={{ padding: '8px 14px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              title="Select Language / भाषा चुनें"
            >
              <Languages size={15} />
              <span>{lang === 'hi' ? 'हिन्दी' : 'English'}</span>
              <ChevronDown size={13} />
            </button>

            {showLangMenu && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                background: 'rgba(8, 22, 16, 0.98)',
                backdropFilter: 'blur(20px)',
                border: '1px solid var(--border-active)',
                borderRadius: 'var(--radius-md)',
                padding: '8px',
                minWidth: '220px',
                boxShadow: '0 16px 36px rgba(0, 0, 0, 0.75)',
                zIndex: 120
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-tertiary)', padding: '6px 10px', textTransform: 'uppercase' }}>
                  Regional Farming Languages
                </div>
                {indicLanguages.map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => {
                      if (item.code === 'hi' || item.code === 'en') {
                        if (lang !== item.code) onToggleLang();
                      } else {
                        // Regional dialect notice
                        alert(`${item.label} voice advisory model activated for ${item.region}. English/Hindi fallback active.`);
                      }
                      setShowLangMenu(false);
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      padding: '8px 10px',
                      background: (lang === item.code) ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                      border: 'none',
                      borderRadius: 'var(--radius-sm)',
                      color: (lang === item.code) ? 'var(--primary-emerald-light)' : '#ffffff',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>{item.label}</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{item.region}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

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
                <User size={14} color="var(--primary-emerald)" />
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{user.full_name || user.email}</span>
              </div>
              <button
                id="logout-btn"
                onClick={onLogout}
                className="btn-secondary"
                style={{ padding: '8px' }}
                title="Log Out"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                if (onOpenAuth) onOpenAuth();
                else onChangeView('auth');
              }}
              className="btn-primary"
              style={{ padding: '8px 18px', fontSize: '0.88rem' }}
            >
              {lang === 'hi' ? 'लॉग इन' : 'Sign In'}
            </button>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="btn-secondary mobile-menu-btn"
            style={{ padding: '8px', display: 'none' }}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div style={{
          padding: '16px',
          background: 'rgba(6, 18, 13, 0.98)',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          marginTop: '12px'
        }}>
          <button
            onClick={() => {
              onChangeView('landing');
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setMobileMenuOpen(false);
            }}
            className="btn-secondary"
            style={{ justifyContent: 'flex-start', padding: '12px 16px' }}
          >
            <Compass size={16} />
            <span>{t.landingTab}</span>
          </button>

          <button
            onClick={() => scrollTo('calculator-section')}
            className="btn-secondary"
            style={{ justifyContent: 'flex-start', padding: '12px 16px' }}
          >
            <Calculator size={16} />
            <span>{t.calcTab}</span>
          </button>

          <button
            onClick={() => scrollTo('satellite-scanner-section')}
            className="btn-secondary"
            style={{ justifyContent: 'flex-start', padding: '12px 16px' }}
          >
            <Satellite size={16} />
            <span>{t.scannerTab}</span>
          </button>

          <button
            onClick={() => {
              onChangeView('dashboard');
              setMobileMenuOpen(false);
            }}
            className="btn-primary"
            style={{ justifyContent: 'flex-start', padding: '12px 16px' }}
          >
            <LayoutDashboard size={16} />
            <span>{t.consoleTab}</span>
          </button>
        </div>
      )}
    </header>
  );
}
