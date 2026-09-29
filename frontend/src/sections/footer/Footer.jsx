import React from 'react';
import { Leaf, Database, Sun, Shield } from 'lucide-react';

export default function Footer() {
  return (
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
  );
}
