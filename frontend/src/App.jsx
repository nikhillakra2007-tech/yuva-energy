import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import HeroRibbon from './components/HeroRibbon';
import FieldMap from './components/FieldMap';
import WaterBalanceCard from './components/WaterBalanceCard';
import SolarEnergyCard from './components/SolarEnergyCard';
import RecommendationsFeed from './components/RecommendationsFeed';
import AuthModal from './components/AuthModal';
import FieldModal from './components/FieldModal';
import { api, getAuthToken, getCurrentUser, removeAuthToken } from './services/api';
import { RefreshCw, Leaf, Sun, Database, Shield } from 'lucide-react';

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

  // Initialize or fetch user farms and fields
  const loadFarmsAndFields = useCallback(async () => {
    try {
      const farmsRes = await api.listFarms();
      setFarms(farmsRes || []);

      const fieldsRes = await api.listFields();
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
          // If login fails, try register
          api.register({
            email: 'farmer@example.com',
            password: 'Password123!',
            full_name: 'Rajesh Kumar'
          }).then((res) => {
            localStorage.setItem('yuva_token', res.access_token);
            localStorage.setItem('yuva_user', JSON.stringify(res.user));
            setUser(res.user);
            loadFarmsAndFields();
          }).catch((e) => console.log('Demo initialization:', e.message));
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

      if (wbRes.status === 'fulfilled') {
        setWaterBalance(wbRes.value);
        if (wbRes.value.weather_summary) {
          setWeather(wbRes.value.weather_summary);
        }
        if (wbRes.value.soil_hydraulics) {
          setSoil(wbRes.value.soil_hydraulics);
        }
      }

      if (recsRes.status === 'fulfilled') {
        // Filter recs for this field or show all active
        const fieldRecs = (recsRes.value || []).filter(r => r.field_id === fieldId);
        setRecommendations(fieldRecs.length > 0 ? fieldRecs : recsRes.value || []);
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

        {/* Core Twin Layout: Geospatial Field Map + Soil & Solar Diagnostics */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '24px',
          alignItems: 'stretch'
        }}>
          {/* Left Column: Interactive Map */}
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

      {/* Production Footer */}
      <footer style={{
        marginTop: '48px',
        borderTop: '1px solid var(--border-subtle)',
        background: 'rgba(8, 20, 15, 0.95)',
        padding: '24px 20px',
        fontSize: '0.82rem',
        color: 'var(--text-secondary)'
      }}>
        <div style={{
          maxWidth: '1440px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary-emerald)' }}>
              <Leaf size={16} />
              <strong style={{ color: 'var(--text-primary)' }}>Yuva Energy Platform</strong>
            </div>
            <span>•</span>
            <span>FAO-56 Irrigation Engineering & Photovoltaic Optimization</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Database size={14} color="var(--primary-emerald)" />
              PostgreSQL 18 + PostGIS 3.6
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sun size={14} color="var(--solar-amber)" />
              Open-Meteo & SoilGrids 250m
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Shield size={14} color="#34d399" />
              Tenant Row-Level Security
            </span>
          </div>
        </div>
      </footer>

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
