import React from 'react';
import { 
  Sprout, 
  SunMedium, 
  RefreshCw, 
  MapPin, 
  Languages, 
  User, 
  LogOut,
  ChevronDown
} from 'lucide-react';

export default function Navbar({
  farms = [],
  fields = [],
  selectedField,
  onSelectField,
  language,
  onToggleLanguage,
  user,
  onOpenAuth,
  onLogout,
  onTriggerSync,
  isSyncing = false
}) {
  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backgroundColor: 'rgba(8, 20, 15, 0.92)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
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
        {/* Brand & Live Pulse */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #10b981 0%, #f59e0b 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)'
          }}>
            <Sprout size={22} color="#08140f" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.25rem',
                fontWeight: '800',
                letterSpacing: '-0.02em',
                color: '#ffffff'
              }}>
                YUVA <span style={{ color: 'var(--solar-amber)' }}>ENERGY</span>
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} title="Live Field Telemetry Engine">
                <span className="pulse-dot" />
                <span style={{ fontSize: '0.72rem', color: 'var(--primary-emerald)', fontWeight: 600, letterSpacing: '0.04em' }}>LIVE</span>
              </div>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Agricultural Intelligence & Solar Irrigation Platform
            </p>
          </div>
        </div>

        {/* Center: Field Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '6px 14px'
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
                fontWeight: 600,
                fontSize: '0.9rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {fields.length === 0 ? (
                <option value="">No Active Fields</option>
              ) : (
                fields.map((f) => (
                  <option key={f.id} value={f.id} style={{ background: '#0e241b' }}>
                    {f.name} ({f.current_crop_name || 'Active'})
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Sync Button */}
          {selectedField && (
            <button
              id="sync-telemetry-btn"
              onClick={onTriggerSync}
              disabled={isSyncing}
              className="btn-secondary"
              style={{ padding: '8px 14px', fontSize: '0.85rem' }}
              title="Synchronize weather, soil, and satellite data"
            >
              <RefreshCw 
                size={14} 
                style={{
                  animation: isSyncing ? 'spin 1s linear infinite' : 'none'
                }} 
              />
              <span>{isSyncing ? 'Syncing...' : 'Sync Data'}</span>
            </button>
          )}
        </div>

        {/* Right: Language & User */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Language Switcher */}
          <button
            id="lang-toggle-btn"
            onClick={onToggleLanguage}
            className="btn-secondary"
            style={{ padding: '8px 12px', fontSize: '0.85rem' }}
            title="Switch Language / भाषा बदलें"
          >
            <Languages size={15} />
            <span>{language === 'hi' ? 'हिन्दी' : 'English'}</span>
          </button>

          {/* User Profile */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '6px 12px'
              }}>
                <User size={15} color="var(--primary-emerald)" />
                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{user.full_name}</span>
              </div>
              <button
                id="logout-btn"
                onClick={onLogout}
                className="btn-secondary"
                style={{ padding: '8px', borderRadius: 'var(--radius-md)' }}
                title="Log Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              id="login-btn"
              onClick={onOpenAuth}
              className="btn-primary"
              style={{ padding: '8px 18px', fontSize: '0.875rem' }}
            >
              Sign In
            </button>
          )}
        </div>
      </div>
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </header>
  );
}
