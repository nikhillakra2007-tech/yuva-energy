import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './sections/navigation/Navbar';
import LandingHero from './sections/landing/LandingHero';
import LandingFeatures from './sections/landing/LandingFeatures';
import AuthSection from './sections/auth/AuthSection';
import VoiceAssistant from './sections/voice/VoiceAssistant';
import FarmerIdentityCard from './sections/hero/FarmerIdentityCard';
import HeroRibbon from './sections/hero/HeroRibbon';
import FieldMap from './sections/geospatial/FieldMap';
import WaterBalanceCard from './sections/water-balance/WaterBalanceCard';
import SolarEnergyCard from './sections/solar-energy/SolarEnergyCard';
import RecommendationsFeed from './sections/recommendations/RecommendationsFeed';
import FieldModal from './sections/modals/FieldModal';
import ScientificDetailModal from './sections/modals/ScientificDetailModal';
import Footer from './sections/footer/Footer';
import { api, getCurrentUser, removeAuthToken, DEMO_PROFILES } from './services/api';
import { ArrowLeft, Mic } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing' | 'auth' | 'dashboard'
  const [lang, setLang] = useState('en');
  const [fontScale, setFontScale] = useState(1);
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('yuva_theme') || 'dark');
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showScientificModal, setShowScientificModal] = useState(false);

  const [user, setUser] = useState(() => getCurrentUser() || null);
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

  // Sync fontScale CSS variable
  useEffect(() => {
    document.documentElement.style.setProperty('--font-scale', fontScale.toString());
  }, [fontScale]);

  // Sync Theme Mode (ScrapSetu Clean Light vs Dark Slate)
  useEffect(() => {
    if (theme === 'dark') {
      document.body.classList.add('theme-dark');
    } else {
      document.body.classList.remove('theme-dark');
    }
    localStorage.setItem('yuva_theme', theme);
  }, [theme]);

  const handleToggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  }, []);

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

  // Apply a benchmark state profile or logged-in farmer
  const handleApplyProfileData = useCallback((profile) => {
    if (!profile) return;
    setUser(profile);
    if (profile.field) {
      setSelectedField(profile.field);
      setFields((prev) => {
        const exists = prev.some(f => f.id === profile.field.id);
        return exists ? prev : [profile.field, ...prev];
      });
    }
    if (profile.telemetry) {
      setWaterBalance(profile.telemetry);
    }
    if (profile.weather) {
      setWeather(profile.weather);
    }
    if (profile.recommendation) {
      setRecommendations([profile.recommendation]);
    }
  }, []);

  const handleSwitchProfile = useCallback((profile) => {
    handleApplyProfileData(profile);
  }, [handleApplyProfileData]);

  // Live telemetry simulation handler ("Demo Thing to show changes in data")
  const handleSimulateWeather = useCallback((mode) => {
    const activeProfile = DEMO_PROFILES.find(p => p.id === user?.id) || DEMO_PROFILES[0];

    if (mode === 'SUNNY_PEAK') {
      setWeather(prev => ({
        ...(prev || activeProfile.weather),
        temperature_celsius: 35.5,
        solar_radiation_w_m2: 820,
        condition: lang === 'hi' ? 'प्रखर दोपहर धूप (820 W/m²)' : 'Peak Solar Noon (820 W/m²)',
        precipitation_last_24h_mm: 0
      }));
      setWaterBalance(prev => ({
        ...(prev || activeProfile.telemetry),
        cwsi: 0.16,
        depletion_dr_mm: Math.min((prev?.raw_mm || 38) * 0.75, (prev?.depletion_dr_mm || 22) + 3.8),
        etc_adj_mm_day: 5.4,
        solar_irradiance_w_m2: 820,
        pump_status: 'ACTIVE_SOLAR'
      }));
      setRecommendations([{
        id: 'sim_sun_' + Date.now(),
        action_type: 'SCHEDULE_IRRIGATION',
        urgency_level: 'MEDIUM',
        title: lang === 'hi' ? 'उच्च सौर विकिरण (820 W/m²) — पूर्ण क्षमता सौर पम्पिंग सक्रिय' : 'Peak Solar Irradiance (820 W/m²) — Max Daylight Pumping Active',
        title_hi: 'उच्च सौर विकिरण (820 W/m²) — पूर्ण क्षमता सौर पम्पिंग सक्रिय',
        message: lang === 'hi' ? 'सौर पैनल 820 W/m² ऊर्जा प्राप्त कर रहे हैं। बिना ग्रिड बिजली खर्च के 50 मिनट पम्प चालू रखा गया है।' : 'Solar PV generating peak power at 820 W/m². Solar pump running at optimal discharge with ₹0 grid electricity cost.',
        message_hi: 'सौर पैनल 820 W/m² ऊर्जा प्राप्त कर रहे हैं। बिना ग्रिड बिजली खर्च के 50 मिनट पम्प चालू रखा गया है।',
        confidence_score: 0.98,
        generated_at: new Date().toISOString()
      }]);
    } else if (mode === 'RAIN_FALL') {
      setWeather(prev => ({
        ...(prev || activeProfile.weather),
        temperature_celsius: 23.5,
        relative_humidity_percentage: 86,
        solar_radiation_w_m2: 240,
        condition: lang === 'hi' ? 'अच्छी मानसूनी वर्षा (18mm)' : 'Active Monsoon Rainfall (18mm)',
        precipitation_last_24h_mm: 18.0
      }));
      setWaterBalance(prev => ({
        ...(prev || activeProfile.telemetry),
        cwsi: 0.02,
        depletion_dr_mm: Math.max(0, (prev?.depletion_dr_mm || 22) - 18),
        etc_adj_mm_day: 2.1,
        solar_irradiance_w_m2: 240,
        pump_status: 'STANDBY_RAIN'
      }));
      setRecommendations([{
        id: 'sim_rain_' + Date.now(),
        action_type: 'HOLD_FOR_RAIN',
        urgency_level: 'LOW',
        title: lang === 'hi' ? 'वर्षा संचयन अलर्ट — पम्प पूरी तरह बंद रखें' : 'Rainfall Infiltration Event — Keep All Pumps in Standby',
        title_hi: 'वर्षा संचयन अलर्ट — पम्प पूरी तरह बंद रखें',
        message: lang === 'hi' ? '18mm बारिश दर्ज की गई है। जड़ों में पर्याप्त नमी है, भूजल और बिजली दोनों की 100% बचत करें।' : '18mm precipitation has replenished the crop root zone. Solar pumps switched to standby to conserve aquifer water.',
        message_hi: '18mm बारिश दर्ज की गई है। जड़ों में पर्याप्त नमी है, भूजल और बिजली दोनों की 100% बचत करें।',
        confidence_score: 0.99,
        generated_at: new Date().toISOString()
      }]);
    } else if (mode === 'HEAT_STRESS') {
      setWeather(prev => ({
        ...(prev || activeProfile.weather),
        temperature_celsius: 41.8,
        relative_humidity_percentage: 24,
        solar_radiation_w_m2: 895,
        condition: lang === 'hi' ? 'भीषण शुष्क लू व ताप तनाव' : 'Severe Arid Heatwave (CWSI Stress)',
        precipitation_last_24h_mm: 0
      }));
      setWaterBalance(prev => ({
        ...(prev || activeProfile.telemetry),
        cwsi: 0.54,
        depletion_dr_mm: (prev?.raw_mm || 38) + 6.5,
        etc_adj_mm_day: 7.2,
        solar_irradiance_w_m2: 895,
        pump_status: 'EMERGENCY_DISPATCH'
      }));
      setRecommendations([{
        id: 'sim_heat_' + Date.now(),
        action_type: 'IRRIGATE_IMMEDIATELY',
        urgency_level: 'HIGH',
        title: lang === 'hi' ? 'गंभीर जल तनाव (CWSI 0.54) — तुरंत आपातकालीन सौर सिंचाई करें' : 'Severe Crop Water Stress (CWSI 0.54) — Immediate Solar Irrigation',
        title_hi: 'गंभीर जल तनाव (CWSI 0.54) — तुरंत आपातकालीन सौर सिंचाई करें',
        message: lang === 'hi' ? 'तापमान 41.8°C पहुंच गया है और जल तनाव सीमा पार कर गया है। फसल मुरझाने से बचाने के लिए तुरंत सौर पम्प शुरू करें।' : 'Extreme heat of 41.8°C has breached allowable depletion limits. Dispatch solar pump immediately to prevent permanent crop wilting.',
        message_hi: 'तापमान 41.8°C पहुंच गया है और जल तनाव सीमा पार कर गया है। फसल मुरझाने से बचाने के लिए तुरंत सौर पम्प शुरू करें।',
        confidence_score: 0.96,
        generated_at: new Date().toISOString()
      }]);
    } else {
      // RESET
      setWeather(activeProfile.weather);
      setWaterBalance(activeProfile.telemetry);
      setRecommendations([activeProfile.recommendation]);
    }
  }, [user, lang]);

  // Initialize user profile only if one was previously authenticated
  useEffect(() => {
    const existing = getCurrentUser();
    if (existing) {
      handleApplyProfileData(existing);
    }
    loadFarmsAndFields();
  }, [loadFarmsAndFields, handleApplyProfileData]);

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
    setCurrentView('auth');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <div className="ambient-glow" />
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
        theme={theme}
        onToggleTheme={handleToggleTheme}
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
                handleApplyProfileData(u);
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

            {/* Benchmark State Profile & Logged-in Farmer Identity Card */}
            <FarmerIdentityCard
              user={user}
              field={selectedField}
              weather={weather}
              waterBalance={waterBalance}
              lang={lang}
              onOpenScientificModal={() => setShowScientificModal(true)}
              onLogout={handleLogout}
            />

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

      {/* Scientific Calculations & Telemetry Simulator Modal */}
      <ScientificDetailModal
        isOpen={showScientificModal}
        onClose={() => setShowScientificModal(false)}
        field={selectedField}
        weather={weather}
        waterBalance={waterBalance}
        soil={soil}
        lang={lang}
        onSimulateWeather={handleSimulateWeather}
      />

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
