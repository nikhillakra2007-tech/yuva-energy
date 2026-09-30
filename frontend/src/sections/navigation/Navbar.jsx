import React, { useState } from 'react';
import { 
  Sprout, 
  Languages, 
  User, 
  LogOut, 
  Mic, 
  Compass, 
  LayoutDashboard, 
  SunMedium, 
  Moon,
  ChevronDown,
  Calculator,
  Satellite,
  Menu,
  X,
  Sliders,
  ArrowRightLeft
} from 'lucide-react';
import HindiConverterModal from '../modals/HindiConverterModal';

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
  onToggleHighContrast,
  theme = 'light',
  onToggleTheme
}) {
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showDisplaySettings, setShowDisplaySettings] = useState(false);
  const [showHindiConverter, setShowHindiConverter] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const indicLanguages = [
    { code: 'hi', label: 'हिन्दी', region: 'North India / Haryana / UP / Rajasthan' },
    { code: 'en', label: 'English', region: 'Pan-India Technical' },
    { code: 'pa', label: 'ਪੰਜਾਬੀ (Punjabi)', region: 'Punjab / Malwa' },
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
      hindiConverterBtn: "Hindi Converter",
      displaySettingsBtn: "Display Settings",
      syncBtn: "Sync Data",
      syncing: "Syncing...",
      newField: "Add Field",
      contrastLabel: "Sunlight High Contrast Mode",
      fontLabel: "Reading Font Size"
    },
    hi: {
      landingTab: "परिचय",
      calcTab: "बचत गणक",
      scannerTab: "उपग्रह स्कैनर",
      consoleTab: "खेत डैशबोर्ड",
      authTab: "किसान लॉगिन",
      voiceBtn: "आवाज सहायक",
      hindiConverterBtn: "हिंदी रूपांतरण",
      displaySettingsBtn: "स्क्रीन सेटिंग्स",
      syncBtn: "डेटा सिंक",
      syncing: "सिंक हो रहा...",
      newField: "नया खेत",
      contrastLabel: "तेज धूप हाई-कंट्रास्ट मोड",
      fontLabel: "अक्षर आकार (फॉन्ट)"
    }
  }[lang] || {};

  const scrollTo = (id) => {
    if (currentView !== 'landing') {
      onChangeView('landing');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 120);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'var(--bg-glass)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid var(--border-subtle)',
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
          {/* Left: Brand Identity */}
          <div 
            onClick={() => {
              onChangeView('landing');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
            title="Return to KisanUrja Overview"
          >
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #10b981 0%, #f59e0b 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4)'
            }}>
              <Sprout size={22} color="#ffffff" strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.25rem',
                  fontWeight: '800',
                  letterSpacing: '-0.025em',
                  color: 'var(--text-primary)'
                }}>
                  KISAN <span style={{ color: 'var(--solar-amber)' }}>URJA</span>
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span className="pulse-dot" style={{ width: '7px', height: '7px' }} />
                  <span style={{ fontSize: '0.7rem', color: 'var(--primary-emerald)', fontWeight: 800, letterSpacing: '0.05em' }}>LIVE</span>
                </div>
              </div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                {lang === 'hi' ? 'किसान ऊर्जा — सौर कृषि स्वावलंबन' : 'Multi-State Solar Precision Agronomy'}
              </p>
            </div>
          </div>

          {/* Center: Main Navigation Tabs */}
          <nav style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--bg-surface)',
            padding: '6px 8px',
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
                gap: '8px',
                padding: '10px 18px',
                borderRadius: 'var(--radius-full)',
                background: currentView === 'landing' ? 'var(--primary-emerald)' : 'transparent',
                color: currentView === 'landing' ? '#ffffff' : 'var(--text-secondary)',
                border: 'none',
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                fontSize: '1.02rem',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              <Compass size={17} />
              <span>{t.landingTab}</span>
            </button>

            <button
              onClick={() => scrollTo('calculator-section')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: 'var(--radius-full)',
                background: 'transparent',
                color: 'var(--text-secondary)',
                border: 'none',
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                fontSize: '1.02rem',
                cursor: 'pointer',
                transition: 'color 0.2s'
              }}
            >
              <Calculator size={17} />
              <span>{t.calcTab}</span>
            </button>

            <button
              onClick={() => scrollTo('satellite-scanner-section')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: 'var(--radius-full)',
                background: 'transparent',
                color: 'var(--text-secondary)',
                border: 'none',
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                fontSize: '1.02rem',
                cursor: 'pointer',
                transition: 'color 0.2s'
              }}
            >
              <Satellite size={17} />
              <span>{t.scannerTab}</span>
            </button>

            <button
              id="nav-console-tab"
              onClick={() => {
                onChangeView('dashboard');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                borderRadius: 'var(--radius-full)',
                background: currentView === 'dashboard' ? 'var(--primary-emerald)' : 'transparent',
                color: currentView === 'dashboard' ? '#ffffff' : 'var(--text-secondary)',
                border: 'none',
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                fontSize: '1.02rem',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              <LayoutDashboard size={17} />
              <span>{t.consoleTab}</span>
            </button>
          </nav>

          {/* Right Toolbar: Streamlined & Highly Visible */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* 1. Voice AI Assistant Button */}
            <button
              id="nav-voice-assistant-btn"
              onClick={onOpenVoice}
              className="btn-solar"
              style={{
                padding: '10px 18px',
                fontSize: '0.98rem',
                borderRadius: 'var(--radius-full)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              title="Open Vernacular Voice Assistant"
            >
              <Mic size={18} />
              <span>{t.voiceBtn}</span>
            </button>

            {/* 2. Language & Hindi Converter Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => {
                  setShowLangMenu(!showLangMenu);
                  setShowDisplaySettings(false);
                }}
                className="btn-secondary"
                style={{
                  padding: '10px 16px',
                  fontSize: '0.98rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                title="Language & Hindi Transliterator"
              >
                <Languages size={18} color="var(--primary-emerald-light)" />
                <span>{lang === 'hi' ? 'हिन्दी' : 'English'}</span>
                <ChevronDown size={15} />
              </button>

              {showLangMenu && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  background: 'rgba(16, 22, 29, 0.98)',
                  backdropFilter: 'blur(20px)',
                  border: '1.5px solid var(--border-active)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px',
                  minWidth: '240px',
                  boxShadow: '0 16px 40px rgba(0, 0, 0, 0.8)',
                  zIndex: 150
                }}>
                  {/* Dedicated Hindi Converter Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowHindiConverter(true);
                      setShowLangMenu(false);
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 12px',
                      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(245, 158, 11, 0.2) 100%)',
                      border: '1px solid var(--primary-emerald)',
                      borderRadius: 'var(--radius-sm)',
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      marginBottom: '10px'
                    }}
                  >
                    <ArrowRightLeft size={16} color="var(--solar-amber)" />
                    <span>{t.hindiConverterBtn} (अनुवादक)</span>
                  </button>

                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-tertiary)', padding: '4px 8px', textTransform: 'uppercase' }}>
                    Select Platform Language:
                  </div>

                  {indicLanguages.map((item) => (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => {
                        if (item.code === 'hi' || item.code === 'en') {
                          if (lang !== item.code) onToggleLang();
                        } else {
                          alert(`${item.label} dialect model active for ${item.region}.`);
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
                      <span style={{ fontSize: '0.88rem', fontWeight: 700 }}>{item.label}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{item.region}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Theme Toggle Button (ScrapSetu Clean Light vs Dark Mode) */}
            <button
              type="button"
              onClick={onToggleTheme}
              className="btn-secondary"
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-full)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              title={theme === 'light' ? "Switch to Dark Slate Theme" : "Switch to ScrapSetu Clean Light Theme"}
            >
              {theme === 'light' ? (
                <>
                  <Moon size={16} />
                  <span style={{ fontSize: '0.84rem', fontWeight: 700 }}>
                    {lang === 'hi' ? 'डार्क मोड' : 'Dark'}
                  </span>
                </>
              ) : (
                <>
                  <SunMedium size={16} color="var(--solar-amber)" />
                  <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--solar-amber)' }}>
                    {lang === 'hi' ? 'लाइट मोड' : 'Light'}
                  </span>
                </>
              )}
            </button>

            {/* 4. Display & Accessibility Settings Popover */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => {
                  setShowDisplaySettings(!showDisplaySettings);
                  setShowLangMenu(false);
                }}
                className="btn-secondary"
                style={{ padding: '8px 10px', fontSize: '0.82rem' }}
                title="Display & Font Accessibility Settings"
              >
                <Sliders size={15} />
              </button>

              {showDisplaySettings && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  background: 'var(--bg-surface)',
                  backdropFilter: 'blur(20px)',
                  border: '1.5px solid var(--border-card)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  minWidth: '220px',
                  boxShadow: 'var(--shadow-elevated)',
                  zIndex: 150
                }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '10px' }}>
                    {t.fontLabel}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', marginBottom: '16px' }}>
                    {[1, 1.2, 1.4].map((scale) => (
                      <button
                        key={scale}
                        type="button"
                        onClick={() => onChangeFontScale(scale)}
                        style={{
                          background: fontScale === scale ? 'var(--primary-emerald)' : 'var(--bg-surface-elevated)',
                          color: fontScale === scale ? '#ffffff' : 'var(--text-primary)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '6px',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          cursor: 'pointer'
                        }}
                      >
                        {scale === 1 ? '100%' : scale === 1.2 ? '120%' : '140%'}
                      </button>
                    ))}
                  </div>

                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '8px' }}>
                    {t.contrastLabel}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onToggleHighContrast();
                      setShowDisplaySettings(false);
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      background: isHighContrast ? 'rgba(245, 158, 11, 0.2)' : 'var(--bg-surface-elevated)',
                      border: `1px solid ${isHighContrast ? 'var(--solar-amber)' : 'var(--border-subtle)'}`,
                      borderRadius: 'var(--radius-sm)',
                      color: isHighContrast ? 'var(--solar-amber)' : 'var(--text-primary)',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer'
                    }}
                  >
                    <span>{isHighContrast ? 'High Contrast ON' : 'Standard Contrast'}</span>
                    <SunMedium size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* 5. Farmer User Chip & State Badge / Login Button */}
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-full)',
                  padding: '8px 18px'
                }}>
                  <User size={18} color="var(--primary-emerald)" />
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.15 }}>
                    <span style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {user.full_name?.split('(')[0].trim() || 'Farmer'}
                    </span>
                    <span style={{ fontSize: '0.82rem', color: 'var(--solar-amber)', fontWeight: 700 }}>
                      {lang === 'hi' ? (user.stateHi || user.state) : (user.state || 'Haryana')}
                    </span>
                  </div>
                </div>

                <button
                  id="logout-btn"
                  onClick={onLogout}
                  className="btn-secondary"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 16px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.92rem',
                    fontWeight: 700
                  }}
                  title="Sign Out"
                >
                  <LogOut size={16} />
                  <span>{lang === 'hi' ? 'लॉगआउट' : 'Sign Out'}</span>
                </button>
              </div>
            ) : (
              <button
                id="nav-signin-btn"
                onClick={() => {
                  if (onOpenAuth) onOpenAuth();
                  else onChangeView('auth');
                }}
                className="btn-primary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 22px',
                  fontSize: '1.02rem',
                  fontWeight: 800,
                  borderRadius: 'var(--radius-full)',
                  boxShadow: '0 4px 20px rgba(16, 185, 129, 0.45)'
                }}
              >
                <User size={18} />
                <span>{lang === 'hi' ? 'किसान लॉगिन' : 'Farmer Sign In'}</span>
              </button>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="btn-secondary mobile-menu-btn"
              style={{ padding: '8px', display: 'none' }}
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div style={{
            padding: '16px',
            background: 'rgba(9, 13, 16, 0.98)',
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

      {/* Hindi Converter Transliterator Modal */}
      <HindiConverterModal 
        isOpen={showHindiConverter} 
        onClose={() => setShowHindiConverter(false)} 
        lang={lang} 
      />
    </>
  );
}
