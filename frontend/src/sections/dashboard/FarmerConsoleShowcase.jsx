import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  MapPin, 
  CloudSun, 
  Zap, 
  FileText, 
  User, 
  Sparkles, 
  LogOut, 
  Leaf
} from 'lucide-react';
import { DEMO_PROFILES } from '../../services/api';
import FarmerOverviewTab from './FarmerOverviewTab';
import FarmerFieldsTab from './FarmerFieldsTab';
import FarmerWeatherTab from './FarmerWeatherTab';
import FarmerPumpsTab from './FarmerPumpsTab';
import FarmerReportsTab from './FarmerReportsTab';
import FarmerProfileTab from './FarmerProfileTab';

export default function FarmerConsoleShowcase({
  user,
  field,
  weather,
  waterBalance,
  soil,
  lang = 'en',
  onOpenScientificModal,
  onLogout
}) {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'fields' | 'weather' | 'pumps' | 'reports' | 'profile'
  const [selectedFieldTab, setSelectedFieldTab] = useState('fieldA');

  const currentProfile = DEMO_PROFILES.find(p => p.id === user?.id) || user || DEMO_PROFILES[0];
  const isPunjab = currentProfile.state?.toLowerCase().includes('punjab');

  // Dynamic field tabs
  const fieldTabs = [
    { id: 'fieldA', label: isPunjab ? 'Field A (Wheat)' : 'Field A (Basmati)', crop: isPunjab ? 'Wheat' : 'Basmati', area: '5.4 Ha', status: 'Optimal' },
    { id: 'fieldB', label: 'Field B (Cotton)', crop: 'Cotton', area: '3.2 Ha', status: 'Moist' },
    { id: 'fieldC', label: 'Field C (Paddy)', crop: 'Paddy', area: '2.8 Ha', status: 'Standby' }
  ];

  const navItems = [
    { id: 'dashboard', label: lang === 'hi' ? 'डैशबोर्ड' : 'Dashboard', icon: LayoutDashboard },
    { id: 'fields', label: lang === 'hi' ? 'खेत व उपग्रह नक्शा' : 'Fields & Map', icon: MapPin },
    { id: 'weather', label: lang === 'hi' ? 'मौसम टेलीमेट्री' : 'Weather Telemetry', icon: CloudSun },
    { id: 'pumps', label: lang === 'hi' ? 'सौर पंप' : 'Solar Pumps', icon: Zap },
    { id: 'reports', label: lang === 'hi' ? 'कृषि रिपोर्ट्स' : 'Agronomy Reports', icon: FileText },
    { id: 'profile', label: lang === 'hi' ? 'किसान आईडी व प्रोफाइल' : 'Farmer ID & Profile', icon: User }
  ];

  return (
    <div style={{
      display: 'flex',
      gap: '32px',
      maxWidth: '1760px',
      width: '100%',
      margin: '0 auto',
      minHeight: '850px',
      color: '#ffffff'
    }}>
      {/* 1. LEFT SIDEBAR NAVIGATION (Matching Image 2) */}
      <aside style={{
        width: '310px',
        flexShrink: 0,
        background: '#0d181c',
        border: '1.5px solid #1a332d',
        borderRadius: '22px',
        padding: '30px 22px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.55)'
      }}>
        <div>
          {/* Brand Logo Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            padding: '0 8px 28px 8px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            marginBottom: '24px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #10b981 0%, #f59e0b 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(16, 185, 129, 0.45)'
            }}>
              <Leaf size={26} color="#ffffff" />
            </div>
            <div>
              <strong style={{ fontSize: '1.35rem', color: '#ffffff', letterSpacing: '-0.02em', display: 'block', fontWeight: 800 }}>
                Kisan<span style={{ color: '#f59e0b' }}>Urja</span>
              </strong>
              <span style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600 }}>Agronomic Console</span>
            </div>
          </div>

          {/* Navigation Links List */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    width: '100%',
                    padding: '16px 18px',
                    borderRadius: '14px',
                    border: isActive ? '1.5px solid #10b981' : '1px solid transparent',
                    background: isActive ? 'rgba(16, 185, 129, 0.18)' : 'transparent',
                    color: isActive ? '#34d399' : '#cbd5e1',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '1.1rem',
                    fontWeight: isActive ? 800 : 600,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.18s ease'
                  }}
                >
                  <Icon size={22} color={isActive ? '#34d399' : '#94a3b8'} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Controls */}
        <div style={{
          paddingTop: '24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          <button
            onClick={onOpenScientificModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '14px 18px',
              borderRadius: '12px',
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1.5px solid rgba(245, 158, 11, 0.4)',
              color: '#fbbf24',
              fontSize: '0.98rem',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <Sparkles size={19} />
            <span>FAO-56 Math Simulator</span>
          </button>

          <button
            onClick={onLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              padding: '16px 20px',
              borderRadius: '14px',
              background: 'rgba(239, 68, 68, 0.16)',
              border: '1.5px solid rgba(239, 68, 68, 0.45)',
              color: '#fca5a5',
              fontSize: '1.05rem',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 4px 14px rgba(239, 68, 68, 0.2)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.28)';
              e.currentTarget.style.borderColor = '#ef4444';
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.16)';
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.45)';
              e.currentTarget.style.color = '#fca5a5';
            }}
            title="Sign Out of Farm Profile"
          >
            <LogOut size={20} color="#ef4444" />
            <span>{lang === 'hi' ? 'प्रोफ़ाइल से लॉगआउट' : 'Sign Out Profile'}</span>
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONSOLE WORKSPACE */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        {activeTab === 'dashboard' && (
          <FarmerOverviewTab
            currentProfile={currentProfile}
            fieldTabs={fieldTabs}
            selectedFieldTab={selectedFieldTab}
            setSelectedFieldTab={setSelectedFieldTab}
            onNavigateToTab={(tabId) => setActiveTab(tabId)}
            isPunjab={isPunjab}
            lang={lang}
          />
        )}

        {activeTab === 'fields' && (
          <FarmerFieldsTab
            field={field}
            waterBalance={waterBalance}
            soil={soil}
            fieldTabs={fieldTabs}
            selectedFieldTab={selectedFieldTab}
            setSelectedFieldTab={setSelectedFieldTab}
            isPunjab={isPunjab}
            lang={lang}
          />
        )}

        {activeTab === 'weather' && (
          <FarmerWeatherTab
            weather={weather}
            waterBalance={waterBalance}
            isPunjab={isPunjab}
            lang={lang}
          />
        )}

        {activeTab === 'pumps' && (
          <FarmerPumpsTab
            waterBalance={waterBalance}
            weather={weather}
            isPunjab={isPunjab}
            lang={lang}
          />
        )}

        {activeTab === 'reports' && (
          <FarmerReportsTab
            field={field}
            waterBalance={waterBalance}
            isPunjab={isPunjab}
            lang={lang}
          />
        )}

        {activeTab === 'profile' && (
          <FarmerProfileTab
            currentProfile={currentProfile}
            isPunjab={isPunjab}
            lang={lang}
          />
        )}
      </main>
    </div>
  );
}
