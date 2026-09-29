import React, { useState, useEffect, useCallback } from 'react';
import Lenis from 'lenis';
import Navbar from './sections/navigation/Navbar';
import LandingHero from './sections/landing/LandingHero';
import LandingFeatures from './sections/landing/LandingFeatures';
import AuthSection from './sections/auth/AuthSection';
import VoiceAssistant from './sections/voice/VoiceAssistant';
import HeroRibbon from './sections/hero/HeroRibbon';
import FieldMap from './sections/geospatial/FieldMap';
import WaterBalanceCard from './sections/water-balance/WaterBalanceCard';
import SolarEnergyCard from './sections/solar-energy/SolarEnergyCard';
import RecommendationsFeed from './sections/recommendations/RecommendationsFeed';
import FieldModal from './sections/modals/FieldModal';
import Footer from './sections/footer/Footer';
import { api, getAuthToken, getCurrentUser, removeAuthToken } from './services/api';
import { ArrowLeft, Compass, LayoutDashboard, Mic, ShieldCheck } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing' | 'auth' | 'dashboard'
  const [lang, setLang] = useState('en');
  const [fontScale, setFontScale] = useState(1);
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);

  const [user, setUser] = useState(getCurrentUser());
  const [farms, setFarms] = useState([]);
  const [fields, setFields] = useState([]);
  const [selectedField, setSelectedField] = useState(null);

  const [weather, setWeather] = useState(null);
  const [soil, setSoil] = useState(null);
  const [waterBalance, setWaterBalance] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

  const [isSyncing, setIsSyncing] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [showFieldModal, setShowFieldModal] = useState(false);

  // Initialize Lenis Smooth Scrolling
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    const rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  // Sync fontScale CSS variable
  useEffect(() => {
    document.documentElement.style.setProperty('--font-scale', fontScale.toString());
  }, [fontScale]);

  // Toggle High Contrast Mode on body
  useEffect(() => {
    if (isHighContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  }, [isHighContrast]);

  // Auto-seed and load farms & fields
  const loadFarmsAndFields = useCallback(async () => {
    try {
      const farmsRes = await api.listFarms();
      setFarms(farmsRes || []);

      let fieldsRes = await api.listFields();

      if (!fieldsRes || fieldsRes.length === 0) {
        let farmId = farmsRes?.[0]?.id;
        if (!farmId) {
          const farm = await api.createFarm({
            name: "Karnal Model Agro-Solar Estate",
            latitude: 29.6857,
            longitude: 76.9905,
            total_area_hectares: 5.0
          });
          farmId = farm.id;
          setFarms([farm]);
        }

        const newField = await api.createField({
          farm_id: farmId,
          name: "Canal View Basmati Plot",
          soil_type: "SANDY_CLAY_LOAM",
          boundary: {
            type: "Polygon",
            coordinates: [[
              [76.9887, 29.6841],
              [76.9923, 29.6841],
              [76.9923, 29.6873],
              [76.9887, 29.6873],
              [76.9887, 29.6841]
            ]]
          }
        });

        try {
          await api.syncField(newField.id, ['WEATHER', 'SOIL', 'SATELLITE']);
          await api.evaluateField(newField.id);
        } catch {
          // non-fatal
        }

        fieldsRes = [newField];
      }

      setFields(fieldsRes || []);
      if (fieldsRes && fieldsRes.length > 0) {
        setSelectedField(fieldsRes[0]);
      }
    } catch (err) {
      console.warn('Farms/Fields load notice:', err.message);
    }
  }, []);

  // Initialize demo credentials in background so console is instantly available
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      loadFarmsAndFields();
    } else {
      api.login({ email: 'farmer@example.com', password: 'Password123!' })
        .then((res) => {
          localStorage.setItem('yuva_token', res.access_token);
          localStorage.setItem('yuva_user', JSON.stringify(res.user));
          setUser(res.user);
          loadFarmsAndFields();
        })
        .catch(() => {
          api.register({
            email: 'farmer@example.com',
            password: 'Password123!',
            full_name: 'Rajesh Kumar (Karnal Basmati)'
          }).then((res) => {
            localStorage.setItem('yuva_token', res.access_token);
            localStorage.setItem('yuva_user', JSON.stringify(res.user));
            setUser(res.user);
            loadFarmsAndFields();
          }).catch((e) => console.log('Demo registration note:', e.message));
        });
    }
  }, [loadFarmsAndFields]);

  // Load field telemetry & hydrologic balance
  const loadFieldData = useCallback(async (fieldId) => {
    if (!fieldId) return;

    try {
      const [wbRes, recsRes] = await Promise.allSettled([
        api.getWaterBalance(fieldId),
        api.listRecommendations()
      ]);

      if (wbRes.status === 'fulfilled' && wbRes.value) {
        const val = wbRes.value;
        setWaterBalance({
          depletion_dr_mm: val.current_root_zone_depletion_mm != null ? val.current_root_zone_depletion_mm : 22.4,
          raw_mm: 38.4,
          taw_mm: 82.0,
          cwsi: val.water_stress_index_cwsi != null ? val.water_stress_index_cwsi : 0.22,
          etc_adj_mm_day: val.daily_etc_mm != null ? val.daily_etc_mm : 4.6,
          root_depth_m: 0.65,
          ks: 1.0,
          et0_fao56_mm_day: 4.65
        });
        if (val.weather_summary) setWeather(val.weather_summary);
        if (val.soil_hydraulics) setSoil(val.soil_hydraulics);
      }

      if (recsRes.status === 'fulfilled') {
        const recList = recsRes.value || [];
        const fieldRecs = recList.filter(r => r.field_id === fieldId);
        setRecommendations(fieldRecs.length > 0 ? fieldRecs : recList);
      }
    } catch (err) {
      console.warn('Field data load notice:', err.message);
    }
  }, []);

  useEffect(() => {
    if (selectedField?.id) {
      loadFieldData(selectedField.id);
    }
  }, [selectedField, loadFieldData]);

  // Telemetry Sync
  const handleSync = async () => {
    if (!selectedField?.id) return;
    setIsSyncing(true);
    try {
      await api.syncField(selectedField.id, ['WEATHER', 'SOIL', 'SATELLITE']);
      await loadFieldData(selectedField.id);
    } catch (err) {
      alert(`Sync failed: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // Agronomic Evaluation
  const handleEvaluate = async () => {
    if (!selectedField?.id) return;
    setIsEvaluating(true);
    try {
      await api.evaluateField(selectedField.id);
      await loadFieldData(selectedField.id);
    } catch (err) {
      alert(`Evaluation failed: ${err.message}`);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleLogout = () => {
    removeAuthToken();
    setUser(null);
    setCurrentView('landing');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Universal Top Navigation Header */}
      <Navbar
        currentView={currentView}
        onChangeView={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        fields={fields}
        selectedField={selectedField}
        onSelectField={setSelectedField}
        lang={lang}
        onToggleLang={() => setLang(lang === 'en' ? 'hi' : 'en')}
        user={user}
        onOpenAuth={() => {
          setCurrentView('auth');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onLogout={handleLogout}
        onSync={handleSync}
        isSyncing={isSyncing}
        onNewField={() => setShowFieldModal(true)}
        onOpenVoice={() => setShowVoiceModal(true)}
        fontScale={fontScale}
        onChangeFontScale={setFontScale}
        isHighContrast={isHighContrast}
        onToggleHighContrast={() => setIsHighContrast(!isHighContrast)}
      />

      {/* Main Viewport Container */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* TIER 1: LANDING PAGE VIEW */}
        {currentView === 'landing' && (
          <div className="view-transition">
            <LandingHero
              onEnterConsole={() => {
                setCurrentView('dashboard');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenAuth={() => {
                setCurrentView('auth');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenVoice={() => setShowVoiceModal(true)}
              lang={lang}
            />

            <LandingFeatures
              onEnterConsole={() => {
                setCurrentView('dashboard');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              lang={lang}
            />
          </div>
        )}

        {/* TIER 2: AUTHENTICATION SECTION VIEW */}
        {currentView === 'auth' && (
          <div className="view-transition">
            <AuthSection
              onSuccess={(u) => {
                setUser(u);
                loadFarmsAndFields();
                setCurrentView('dashboard');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onBackToLanding={() => {
                setCurrentView('landing');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              lang={lang}
            />
          </div>
        )}

        {/* TIER 3: FARM CONSOLE & WORKING DASHBOARD VIEW */}
        {currentView === 'dashboard' && (
          <div className="view-transition" style={{ maxWidth: '1440px', margin: '0 auto', width: '100%', padding: '24px 24px 64px 24px' }}>
            {/* Reverse Breadcrumb: Back to Overview */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
              marginBottom: '24px'
            }}>
              <button
                onClick={() => {
                  setCurrentView('landing');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="btn-secondary"
                style={{ padding: '8px 18px', fontSize: '0.9rem' }}
              >
                <ArrowLeft size={16} />
                <span>{lang === 'hi' ? '← मुख्य परिचय पृष्ठ' : '← Return to Platform Overview'}</span>
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  onClick={() => setShowVoiceModal(true)}
                  className="btn-solar"
                  style={{ padding: '8px 18px', fontSize: '0.9rem' }}
                >
                  <Mic size={16} />
                  <span>{lang === 'hi' ? 'वॉयस सहायक से पूछें' : 'Consult Voice Assistant'}</span>
                </button>
              </div>
            </div>

            {/* Farm Banner & Weather Telemetry Ribbon */}
            <HeroRibbon
              field={selectedField}
              weather={weather}
              waterBalance={waterBalance}
              lang={lang}
              onEvaluate={handleEvaluate}
              isEvaluating={isEvaluating}
            />

            {/* Core Working Layout: Geospatial Satellite Map + Water & Solar Balances */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
              gap: '32px',
              alignItems: 'stretch',
              marginBottom: '40px'
            }}>
              {/* Left Column: Interactive Map */}
              <div style={{ minHeight: '480px' }}>
                <FieldMap
                  field={selectedField}
                  waterBalance={waterBalance}
                  soil={soil}
                  lang={lang}
                />
              </div>

              {/* Right Column: Hydrologic & Solar Energy Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                <WaterBalanceCard
                  waterBalance={waterBalance}
                  soil={soil}
                  lang={lang}
                />
                <SolarEnergyCard
                  weather={weather}
                  lang={lang}
                />
              </div>
            </div>

            {/* Actionable Agronomic Recommendations Feed */}
            <RecommendationsFeed
              recommendations={recommendations}
              onRefresh={() => selectedField && loadFieldData(selectedField.id)}
              lang={lang}
            />
          </div>
        )}
      </main>

      {/* Persistent Footer */}
      <Footer />

      {/* Floating Voice Assistant Trigger */}
      <div style={{
        position: 'fixed',
        bottom: '28px',
        right: '28px',
        zIndex: 90
      }}>
        <button
          id="floating-voice-btn"
          onClick={() => setShowVoiceModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            color: '#06120d',
            padding: '16px 24px',
            borderRadius: 'var(--radius-full)',
            border: '2px solid rgba(255, 255, 255, 0.4)',
            boxShadow: '0 8px 32px rgba(245, 158, 11, 0.55)',
            cursor: 'pointer',
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            fontSize: '1rem',
            transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05) translateY(-3px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1) translateY(0)'}
          title="Open Vernacular Voice AI Assistant"
        >
          <Mic size={22} />
          <span>{lang === 'hi' ? 'बोलकर पूछें' : 'Voice Assistant'}</span>
        </button>
      </div>

      {/* Voice Assistant Modal */}
      <VoiceAssistant
        isOpen={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        field={selectedField}
        waterBalance={waterBalance}
        weather={weather}
        lang={lang}
      />

      {/* Add Field Modal */}
      <FieldModal
        farms={farms}
        isOpen={showFieldModal}
        onClose={() => setShowFieldModal(false)}
        onCreated={(f) => {
          setFields(prev => [...prev, f]);
          setSelectedField(f);
        }}
        lang={lang}
      />
    </div>
  );
}
