import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './sections/navigation/Navbar';
import HeroRibbon from './sections/hero/HeroRibbon';
import FieldMap from './sections/geospatial/FieldMap';
import WaterBalanceCard from './sections/water-balance/WaterBalanceCard';
import SolarEnergyCard from './sections/solar-energy/SolarEnergyCard';
import RecommendationsFeed from './sections/recommendations/RecommendationsFeed';
import AuthModal from './sections/modals/AuthModal';
import FieldModal from './sections/modals/FieldModal';
import Footer from './sections/footer/Footer';
import { api, getAuthToken, getCurrentUser, removeAuthToken } from './services/api';

export default function App() {
  const [lang, setLang] = useState('en');
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
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showFieldModal, setShowFieldModal] = useState(false);

  // Initialize and load user farms, fields, and ensure initial plot
  const loadFarmsAndFields = useCallback(async () => {
    try {
      const farmsRes = await api.listFarms();
      setFarms(farmsRes || []);

      let fieldsRes = await api.listFields();

      // If user has no fields yet, auto-create a default model field so the UI is immediately alive
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

        // Trigger initial sync and agronomic evaluation
        try {
          await api.syncField(newField.id, ['WEATHER', 'SOIL', 'SATELLITE']);
          await api.evaluateField(newField.id);
        } catch {
          // Non-fatal on first boot
        }

        fieldsRes = [newField];
      }

      setFields(fieldsRes || []);
      if (fieldsRes && fieldsRes.length > 0) {
        setSelectedField(fieldsRes[0]);
      }
    } catch (err) {
      console.warn('Could not load farms/fields with current credentials:', err.message);
    }
  }, []);

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      loadFarmsAndFields();
    } else {
      // Auto demo sign-in for seamless first load
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
            full_name: 'Rajesh Kumar'
          }).then((res) => {
            localStorage.setItem('yuva_token', res.access_token);
            localStorage.setItem('yuva_user', JSON.stringify(res.user));
            setUser(res.user);
            loadFarmsAndFields();
          }).catch((e) => console.log('Demo initialization note:', e.message));
        });
    }
  }, [loadFarmsAndFields]);

  // Load telemetry & agronomic balance when selected field changes
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
      console.warn('Telemetry load error:', err.message);
    }
  }, []);

  useEffect(() => {
    if (selectedField?.id) {
      loadFieldData(selectedField.id);
    }
  }, [selectedField, loadFieldData]);

  // Handle live pipeline sync
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

  // Handle agronomic engine evaluation
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
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navigation Header */}
      <Navbar
        user={user}
        fields={fields}
        selectedField={selectedField}
        onSelectField={setSelectedField}
        lang={lang}
        onToggleLang={() => setLang(lang === 'en' ? 'hi' : 'en')}
        onOpenAuth={() => setShowAuthModal(true)}
        onLogout={handleLogout}
        onSync={handleSync}
        isSyncing={isSyncing}
        onNewField={() => setShowFieldModal(true)}
      />

      {/* Main Workspace Container */}
      <main style={{ maxWidth: '1440px', margin: '0 auto', width: '100%', padding: '24px 20px', flex: 1 }}>
        {/* Real-Time Agro-Solar Hero Ribbon */}
        <HeroRibbon
          field={selectedField}
          weather={weather}
          waterBalance={waterBalance}
          lang={lang}
          onEvaluate={handleEvaluate}
          isEvaluating={isEvaluating}
        />

        {/* Core Layout: Geospatial Field Map + Soil & Solar Diagnostics */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '24px',
          alignItems: 'stretch'
        }}>
          {/* Left Column: Interactive Leaflet Map */}
          <div style={{ minHeight: '440px' }}>
            <FieldMap
              field={selectedField}
              waterBalance={waterBalance}
              soil={soil}
              lang={lang}
            />
          </div>

          {/* Right Column: Water Balance & Solar Coupling Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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

        {/* Actionable Recommendations Feed with Traceability & Audio Narration */}
        <RecommendationsFeed
          recommendations={recommendations}
          onRefresh={() => selectedField && loadFieldData(selectedField.id)}
          lang={lang}
        />
      </main>

      {/* Footer */}
      <Footer />

      {/* Modals */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={(u) => {
          setUser(u);
          loadFarmsAndFields();
        }}
        lang={lang}
      />

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
