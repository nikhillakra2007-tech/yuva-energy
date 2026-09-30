import React from 'react';
import { 
  User, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  Zap, 
  Sun, 
  AlertTriangle,
  FileCheck
} from 'lucide-react';

export default function FarmerProfileTab({
  currentProfile,
  isPunjab,
  lang = 'en'
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Bar */}
      <div style={{
        background: '#0d181c',
        border: '1.5px solid #1a332d',
        borderRadius: '18px',
        padding: '18px 22px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'rgba(56, 189, 248, 0.15)',
            border: '1px solid #38bdf8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <User size={20} color="#38bdf8" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
              {lang === 'hi' ? 'सत्यापित किसान पहचान व खाता' : 'Verified Farmer Identity & Farm Profile'}
            </h3>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
              Direct Linkage to Ministry of Agriculture & State Solar Discom Registry
            </span>
          </div>
        </div>

        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 12px',
          borderRadius: '9999px',
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid #10b981',
          color: '#34d399',
          fontSize: '0.76rem',
          fontWeight: 800
        }}>
          <CheckCircle2 size={14} />
          <span>Verified: {isPunjab ? 'Punjab Agriculture Dept' : 'Haryana Kisan Portal'}</span>
        </span>
      </div>

      {/* Row 1: Profile & PM-KUSUM Registration Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '18px'
      }}>
        {/* Card 1: Farmer Identity */}
        <div style={{
          background: '#0d181c',
          border: '1.5px solid #1a332d',
          borderRadius: '18px',
          padding: '20px 22px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #f59e0b 0%, #10b981 100%)',
              padding: '2px',
              flexShrink: 0
            }}>
              <div style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                background: '#132328',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.6rem'
              }}>
                👨‍🌾
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <h4 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  {isPunjab ? 'Baljit Singh' : 'Rajesh Kumar'}
                </h4>
                <CheckCircle2 size={18} color="#38bdf8" />
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
                Farmer ID: <strong style={{ color: '#cbd5e1' }}>YUE77410</strong>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.82rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ color: '#94a3b8' }}>Contact Number:</span>
              <strong style={{ color: '#ffffff' }}>+91 98120 44521</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ color: '#94a3b8' }}>Location / Village:</span>
              <strong style={{ color: '#ffffff' }}>{isPunjab ? 'Sardulgarh, Mansa, Punjab' : 'Nilokheri, Karnal, Haryana'}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ color: '#94a3b8' }}>Total Farmland Holding:</span>
              <strong style={{ color: '#34d399' }}>45 Acres (18.2 Hectares)</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ color: '#94a3b8' }}>Revenue Survey / Khatauni:</span>
              <strong style={{ color: '#ffffff' }}>Plot No. 442/12</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
              <span style={{ color: '#94a3b8' }}>Electricity Discom Link:</span>
              <strong style={{ color: '#fbbf24' }}>{isPunjab ? 'PSPCL 11kV Rural Feeder' : 'DHBVN 3-Phase AP Line'}</strong>
            </div>
          </div>
        </div>

        {/* Card 2: PM-KUSUM Scheme Details */}
        <div style={{
          background: '#0d181c',
          border: '1.5px solid #1a332d',
          borderRadius: '18px',
          padding: '20px 22px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              PM-KUSUM COMPONENT-C SUBSIDIZED SOLAR CONNECTION
            </span>
            <div style={{
              padding: '2px 8px',
              borderRadius: '6px',
              background: 'rgba(245, 158, 11, 0.15)',
              color: '#fbbf24',
              fontWeight: 800,
              fontSize: '0.72rem'
            }}>
              Sanctioned
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.82rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ color: '#94a3b8' }}>Sanction Application No.:</span>
              <strong style={{ color: '#ffffff' }}>KUSUM-HR-2025-9921</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ color: '#94a3b8' }}>Pump Motor Rating:</span>
              <strong style={{ color: '#34d399' }}>7.5 HP AC Submersible</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ color: '#94a3b8' }}>Solar PV Array Capacity:</span>
              <strong style={{ color: '#fbbf24' }}>10.5 kWp Polycrystalline</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ color: '#94a3b8' }}>Subsidy Structure:</span>
              <strong style={{ color: '#ffffff' }}>60% Govt • 30% Bank • 10% Farmer</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
              <span style={{ color: '#94a3b8' }}>Net Metering Export Tariff:</span>
              <strong style={{ color: '#34d399' }}>₹3.85 / kWh Credit</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Rural Farmer Safety & Maintenance Protocols */}
      <div style={{
        background: '#0d181c',
        border: '1.5px solid #1a332d',
        borderRadius: '18px',
        padding: '20px 22px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <ShieldCheck size={18} color="#10b981" />
          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            RURAL FARMER SAFETY & SOLAR MAINTENANCE PROTOCOLS
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '14px'
        }}>
          {/* Protocol 1 */}
          <div style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '14px 16px' }}>
            <strong style={{ fontSize: '0.84rem', color: '#fbbf24', display: 'block', marginBottom: '4px' }}>
              1. Solar Panel Dust Cleaning
            </strong>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
              Wash panels every 10–14 days during early morning hours using soft water. Never splash cold water onto scorching hot afternoon panels to avoid glass thermal shock.
            </p>
          </div>

          {/* Protocol 2 */}
          <div style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '14px 16px' }}>
            <strong style={{ fontSize: '0.84rem', color: '#38bdf8', display: 'block', marginBottom: '4px' }}>
              2. Lightning & Earthing Inspection
            </strong>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
              Inspect copper earthing pit before every monsoon. Ensure grounding resistance is strictly below 5 Ohms to protect the VFD inverter from lightning strikes.
            </p>
          </div>

          {/* Protocol 3 */}
          <div style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '14px 16px' }}>
            <strong style={{ fontSize: '0.84rem', color: '#f87171', display: 'block', marginBottom: '4px' }}>
              3. Dry-Run & Cavitation Safety
            </strong>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
              Ensure low-water float switch in the tubewell casing is operational. Never bypass the dry-run protection circuit to prevent pump impeller overheating.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
