import React from 'react';
import { Leaf, Database, Sun, Shield, Satellite, Cpu, Globe, Mail, Zap } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{
      position: 'relative',
      marginTop: '0',
      borderTop: '1px solid var(--border-subtle)',
      background: 'var(--bg-surface)',
      padding: '0',
      overflow: 'hidden'
    }}>
      {/* Gradient Top Border */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '2px',
        background: 'linear-gradient(90deg, transparent, var(--primary-emerald), var(--solar-amber), var(--sky-blue), transparent)'
      }} />

      {/* Main Footer Content */}
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        padding: '48px 24px 32px 24px'
      }}>
        {/* Top Row: Brand + Links */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '40px',
          marginBottom: '40px'
        }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #10b981, #f59e0b)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
              }}>
                <Leaf size={20} color="#fff" strokeWidth={2.5} />
              </div>
              <div>
                <div style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.1rem',
                  fontWeight: 900,
                  letterSpacing: '-0.02em',
                  color: 'var(--text-primary)'
                }}>
                  KISAN<span style={{ color: 'var(--solar-amber)' }}>URJA</span>
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>
                  किसान ऊर्जा — Solar Precision Agronomy
                </div>
              </div>
            </div>
            <p style={{
              fontSize: '0.88rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.65,
              maxWidth: '320px'
            }}>
              AI-driven precision solar agronomy, deterministic FAO-56 irrigation, and PM-KUSUM solar pumping for Indian farmers.
            </p>
          </div>

          {/* Tech Stack */}
          <div>
            <h4 style={{
              fontSize: '0.78rem',
              fontWeight: 800,
              color: 'var(--text-tertiary)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '16px'
            }}>
              Technology Stack
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { icon: <Database size={14} color="var(--primary-emerald)" />, text: 'PostgreSQL 18 + PostGIS 3.6' },
                { icon: <Sun size={14} color="var(--solar-amber)" />, text: 'Open-Meteo & SoilGrids 250m' },
                { icon: <Satellite size={14} color="var(--sky-blue)" />, text: 'Sentinel-2 L2A (ESA)' },
                { icon: <Cpu size={14} color="#a855f7" />, text: 'FAO-56 Penman-Monteith' }
              ].map((item, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                  fontWeight: 500
                }}>
                  {item.icon}
                  {item.text}
                </div>
              ))}
            </div>
          </div>

          {/* Security */}
          <div>
            <h4 style={{
              fontSize: '0.78rem',
              fontWeight: 800,
              color: 'var(--text-tertiary)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '16px'
            }}>
              Security & Compliance
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { icon: <Shield size={14} color="#34d399" />, text: 'Row-Level Security (RLS)' },
                { icon: <Zap size={14} color="var(--solar-amber)" />, text: 'JWT Token Authentication' },
                { icon: <Globe size={14} color="var(--sky-blue)" />, text: 'Multi-Tenant Data Isolation' }
              ].map((item, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                  fontWeight: 500
                }}>
                  {item.icon}
                  {item.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="section-divider" style={{ marginBottom: '24px' }} />

        {/* Bottom Row */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{
            fontSize: '0.8rem',
            color: 'var(--text-tertiary)',
            fontWeight: 500
          }}>
            &copy; {currentYear} KisanUrja (किसान ऊर्जा). Built with precision for Indian agriculture.
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.75rem',
            color: 'var(--text-tertiary)',
            fontFamily: 'var(--font-mono)'
          }}>
            <span className="pulse-dot" style={{ width: '6px', height: '6px' }} />
            <span>All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
