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

  // Auto-hide header when scrolling down, show when scrolling up or at top
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  React.useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY > 30 && currentY > lastScrollY) {
        setShowHeader(false); // Disappears when scrolling down
      } else {
        setShowHeader(true); // Re-appears when scrolling up or at top
      }
      setLastScrollY(currentY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

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
        borderBottom: '1.5px solid var(--border-subtle)',
        padding: '22px 48px',
        transform: showHeader ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease',
        opacity: showHeader ? 1 : 0,
        pointerEvents: showHeader ? 'auto' : 'none',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)'
      }}>
        <div style={{
          maxWidth: '1760px',
          width: '98%',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'nowrap',
          gap: '24px'
        }}>
          {/* Left: Brand Identity */}
          <div 
            onClick={() => {
              onChangeView('landing');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', flexShrink: 0 }}
            title="Return to KisanUrja Overview"
          >
            <div style={{
              width: '58px',
              height: '58px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #10b981 0%, #f59e0b 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.5)'
            }}>
              <Sprout size={34} color="#ffffff" strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.7rem',
                  fontWeight: '900',
                  letterSpacing: '-0.03em',
                  color: 'var(--text-primary)'
                }}>
                  KISAN <span style={{ color: 'var(--solar-amber)' }}>URJA</span>
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="pulse-dot" style={{ width: '9px', height: '9px' }} />
                  <span style={{ fontSize: '0.88rem', color: 'var(--primary-emerald)', fontWeight: 800, letterSpacing: '0.06em' }}>LIVE</span>
                </div>
              </div>
              <p style={{ fontSize: '0.94rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.1, fontWeight: 700 }}>
                {lang === 'hi' ? 'सौर कृषि स्वावलंबन' : 'Solar Precision Agronomy'}
              </p>
            </div>
          </div>

          {/* Center: Main Navigation Tabs */}
          <nav style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'var(--bg-surface)',
            padding: '8px 14px',
            borderRadius: 'var(--radius-full)',
            border: '1.5px solid var(--border-subtle)',
            flexShrink: 0
          }} className="desktop-nav">
            <button
              onClick={() => {
                onChangeView('landing');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '9px',
                padding: '12px 24px',
                borderRadius: 'var(--radius-full)',
                background: currentView === 'landing' ? 'var(--primary-emerald)' : 'transparent',
                color: currentView === 'landing' ? '#ffffff' : 'var(--text-secondary)',
                border: 'none',
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                fontSize: '1.14rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <Compass size={20} />
              <span>{t.landingTab}</span>
            </button>

            <button
              onClick={() => scrollTo('calculator-section')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '9px',
                padding: '12px 24px',
                borderRadius: 'var(--radius-full)',
                background: 'transparent',
                color: 'var(--text-secondary)',
                border: 'none',
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                fontSize: '1.14rem',
                cursor: 'pointer',
                transition: 'color 0.2s'
              }}
            >
              <Calculator size={20} />
              <span>{t.calcTab}</span>
            </button>

            <button
              onClick={() => scrollTo('satellite-scanner-section')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '9px',
                padding: '12px 24px',
                borderRadius: 'var(--radius-full)',
                background: 'transparent',
                color: 'var(--text-secondary)',
                border: 'none',
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                fontSize: '1.14rem',
                cursor: 'pointer',
                transition: 'color 0.2s'
              }}
            >
              <Satellite size={20} />
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
                gap: '9px',
                padding: '12px 26px',
                borderRadius: 'var(--radius-full)',
                background: currentView === 'dashboard' ? 'var(--primary-emerald)' : 'transparent',
                color: currentView === 'dashboard' ? '#ffffff' : 'var(--text-secondary)',
                border: 'none',
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                fontSize: '1.14rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <LayoutDashboard size={20} />
              <span>{t.consoleTab}</span>
            </button>
          </nav>

          {/* Right Toolbar: Streamlined & Generous */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
            {/* 1. Voice AI Assistant Button */}
            <button
              id="nav-voice-assistant-btn"
              onClick={onOpenVoice}
              className="btn-solar"
              style={{
                padding: '12px 22px',
                fontSize: '1.05rem',
                borderRadius: 'var(--radius-full)',
                display: 'flex',
                alignItems: 'center',
                gap: '9px',
                boxShadow: '0 6px 18px rgba(245, 158, 11, 0.4)',
                fontWeight: 800
              }}
              title="Open Vernacular Voice Assistant"
            >
              <Mic size={19} />
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
                  padding: '12px 20px',
                  fontSize: '1.02rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '9px',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 700
                }}
                title="Language & Hindi Transliterator"
              >
                <Languages size={19} color="var(--primary-emerald-light)" />
                <span>{lang === 'hi' ? 'हिन्दी' : 'English'}</span>
                <ChevronDown size={16} />
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
                  padding: '14px',
                  minWidth: '280px',
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
                      gap: '9px',
                      padding: '12px 16px',
                      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(245, 158, 11, 0.2) 100%)',
                      border: '1px solid var(--primary-emerald)',
                      borderRadius: 'var(--radius-sm)',
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: '1rem',
                      cursor: 'pointer',
                      marginBottom: '12px'
                    }}
                  >
                    <ArrowRightLeft size={18} color="var(--solar-amber)" />
                    <span>{t.hindiConverterBtn} (अनुवादक)</span>
                  </button>

                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-tertiary)', padding: '4px 8px', textTransform: 'uppercase' }}>
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
                        padding: '11px 14px',
                        background: (lang === item.code) ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                        border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        color: (lang === item.code) ? 'var(--primary-emerald-light)' : '#ffffff',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <span style={{ fontSize: '1.02rem', fontWeight: 700 }}>{item.label}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>{item.region}</span>
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
                padding: '12px 20px',
                borderRadius: 'var(--radius-full)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '1.02rem'
              }}
              title={theme === 'light' ? "Switch to Dark Slate Theme" : "Switch to ScrapSetu Clean Light Theme"}
            >
              {theme === 'light' ? (
                <>
                  <Moon size={18} />
                  <span style={{ fontWeight: 700 }}>
                    {lang === 'hi' ? 'डार्क' : 'Dark'}
                  </span>
                </>
              ) : (
                <>
                  <SunMedium size={18} color="var(--solar-amber)" />
                  <span style={{ fontWeight: 700, color: 'var(--solar-amber)' }}>
                    {lang === 'hi' ? 'लाइट' : 'Light'}
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
                style={{ padding: '12px 16px', fontSize: '1.02rem', borderRadius: 'var(--radius-full)' }}
                title="Display & Font Accessibility Settings"
              >
                <Sliders size={19} />
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
                  padding: '20px',
                  minWidth: '260px',
                  boxShadow: 'var(--shadow-elevated)',
                  zIndex: 150
                }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '12px' }}>
                    {t.fontLabel}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '18px' }}>
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
                          padding: '10px 8px',
                          fontWeight: 700,
                          fontSize: '0.94rem',
                          cursor: 'pointer'
                        }}
                      >
                        {scale === 1 ? '100%' : scale === 1.2 ? '120%' : '140%'}
                      </button>
                    ))}
                  </div>

                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '10px' }}>
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
                      padding: '12px 16px',
                      background: isHighContrast ? 'rgba(245, 158, 11, 0.2)' : 'var(--bg-surface-elevated)',
                      border: `1px solid ${isHighContrast ? 'var(--solar-amber)' : 'var(--border-subtle)'}`,
                      borderRadius: 'var(--radius-sm)',
                      color: isHighContrast ? 'var(--solar-amber)' : 'var(--text-primary)',
                      fontWeight: 700,
                      fontSize: '0.94rem',
                      cursor: 'pointer'
                    }}
                  >
                    <span>{isHighContrast ? 'High Contrast ON' : 'Standard Contrast'}</span>
                    <SunMedium size={19} />
                  </button>
                </div>
              )}
            </div>

            {/* Clean Farmer Login Button only on landing page when unauthenticated */}
            {currentView === 'landing' && !user && (
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
                  gap: '10px',
                  padding: '12px 26px',
                  fontSize: '1.05rem',
                  fontWeight: 800,
                  borderRadius: 'var(--radius-full)',
                  boxShadow: '0 6px 20px rgba(16, 185, 129, 0.45)',
                  cursor: 'pointer'
                }}
              >
                <User size={19} />
                <span>{lang === 'hi' ? 'किसान लॉगिन' : 'Farmer Login'}</span>
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
