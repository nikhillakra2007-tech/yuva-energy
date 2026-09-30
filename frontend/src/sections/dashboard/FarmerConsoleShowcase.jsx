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
    { id: 'profile', label: lang === 'hi' ? 'किसान खाता' : 'Farmer Profile', icon: User }
  ];

  return (
    <div style={{
      display: 'flex',
      gap: '24px',
      maxWidth: '1440px',
      margin: '0 auto',
      minHeight: '850px',
      color: '#ffffff'
    }}>
      {/* 1. LEFT SIDEBAR NAVIGATION (Matching Image 2) */}
      <aside style={{
        width: '240px',
        flexShrink: 0,
        background: '#0d181c',
        border: '1.5px solid #1a332d',
        borderRadius: '20px',
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.45)'
      }}>
        <div>
          {/* Brand Logo Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '0 8px 24px 8px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            marginBottom: '20px'
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #10b981 0%, #f59e0b 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)'
            }}>
              <Leaf size={20} color="#ffffff" />
            </div>
            <div>
              <strong style={{ fontSize: '1.08rem', color: '#ffffff', letterSpacing: '-0.02em', display: 'block' }}>
                Kisan<span style={{ color: '#f59e0b' }}>Urja</span>
              </strong>
              <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Agronomic Console</span>
            </div>
          </div>

          {/* Navigation Links List */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
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
                    gap: '12px',
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: isActive ? '1px solid #10b981' : '1px solid transparent',
                    background: isActive ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                    color: isActive ? '#34d399' : '#94a3b8',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '0.92rem',
                    fontWeight: isActive ? 800 : 600,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.18s ease'
                  }}
                >
                  <Icon size={18} color={isActive ? '#34d399' : '#94a3b8'} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Controls */}
        <div style={{
          paddingTop: '16px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <button
            onClick={onOpenScientificModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px 14px',
              borderRadius: '10px',
              background: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              color: '#fbbf24',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
          >
            <Sparkles size={15} />
            <span>FAO-56 Math Simulator</span>
          </button>

          <button
            onClick={onLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '9px 14px',
              borderRadius: '10px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: '#f87171',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
          >
            <LogOut size={15} />
            <span>Sign Out Profile</span>
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
