import React, { useState } from 'react';
import { 
  Zap, 
  Sun, 
  Activity, 
  Power, 
  RotateCcw, 
  CheckCircle2, 
  Clock, 
  ShieldCheck,
  Play,
  Square
} from 'lucide-react';

export default function FarmerPumpsTab({
  waterBalance,
  weather,
  isPunjab,
  lang = 'en'
}) {
  const [pumpState, setPumpState] = useState('ACTIVE'); // 'ACTIVE' | 'STANDBY' | 'STOPPED'
  const [controlMode, setControlMode] = useState('AUTO'); // 'AUTO' | 'MANUAL'
  const [actionNotice, setActionNotice] = useState('');

  const handleStartPump = () => {
    setPumpState('ACTIVE');
    setActionNotice(lang === 'hi' ? 'सौर पंप सफलतापूर्वक चालू किया गया (15 मिनट परीक्षण)।' : 'Solar pump initiated successfully for a 15-minute test run.');
    setTimeout(() => setActionNotice(''), 4000);
  };

  const handleStopPump = () => {
    setPumpState('STOPPED');
    setActionNotice(lang === 'hi' ? 'आपातकालीन शटडाउन: सौर पंप सुरक्षित रूप से बंद कर दिया गया।' : 'Emergency stop engaged: Solar pump safely powered down.');
    setTimeout(() => setActionNotice(''), 4000);
  };

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
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid #10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Zap size={20} color="#34d399" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
              {lang === 'hi' ? 'पीएम-कुसुम सौर पंप टेलीमेट्री' : 'PM-KUSUM Component-C Solar Microgrid & Pump Telemetry'}
            </h3>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
              Subsidized 7.5 HP Submersible Tubewell • 10.5 kWp Ground-Mounted Array
            </span>
          </div>
        </div>

        {/* Live Status Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 12px',
          borderRadius: '9999px',
          background: pumpState === 'ACTIVE' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          border: `1px solid ${pumpState === 'ACTIVE' ? '#10b981' : '#ef4444'}`,
          color: pumpState === 'ACTIVE' ? '#34d399' : '#f87171',
          fontSize: '0.76rem',
          fontWeight: 800
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: pumpState === 'ACTIVE' ? '#10b981' : '#ef4444' }} />
          <span>{pumpState === 'ACTIVE' ? 'Active Daylight Pumping' : 'Pump in Standby'}</span>
        </div>
      </div>

      {actionNotice && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid #10b981',
          color: '#34d399',
          padding: '12px 18px',
          borderRadius: '12px',
          fontSize: '0.85rem',
          fontWeight: 700
        }}>
          ✓ {actionNotice}
        </div>
      )}

      {/* Row 1: 4 Key Telemetry Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px'
      }}>
        {/* Card 1: Solar Power Generation */}
        <div style={{
          background: '#0d181c',
          border: '1.5px solid #1a332d',
          borderRadius: '16px',
          padding: '18px 20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            DAILY SOLAR GENERATION
          </span>
          <div style={{ margin: '8px 0' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fbbf24', lineHeight: 1.1 }}>
              34.2 kWh
            </div>
            <span style={{ fontSize: '0.78rem', color: '#f59e0b', fontWeight: 600 }}>
              100% Clean Solar Power Utilized
            </span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '6px' }}>
            Array Capacity: 10.5 kWp Polycrystalline
          </div>
        </div>

        {/* Card 2: Water Discharge */}
        <div style={{
          background: '#0d181c',
          border: '1.5px solid #1a332d',
          borderRadius: '16px',
          padding: '18px 20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            WATER DISCHARGE VOLUME
          </span>
          <div style={{ margin: '8px 0' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#38bdf8', lineHeight: 1.1 }}>
              1,42,800 L
            </div>
            <span style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600 }}>
              Discharge Rate: 340 Liters/min
            </span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '6px' }}>
            Flow Sensor: Ultrasonic In-Line Meter
          </div>
        </div>

        {/* Card 3: Economic Diesel Savings */}
        <div style={{
          background: '#0d181c',
          border: '1.5px solid #1a332d',
          borderRadius: '16px',
          padding: '18px 20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            DAILY ECONOMIC SAVINGS
          </span>
          <div style={{ margin: '8px 0' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#10b981', lineHeight: 1.1 }}>
              ₹540 <span style={{ fontSize: '0.9rem', color: '#34d399' }}>Today</span>
            </div>
            <span style={{ fontSize: '0.78rem', color: '#34d399', fontWeight: 600 }}>
              Annual Saved: ₹94,200
            </span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '6px' }}>
            Benchmarked vs 8 HP Diesel Genset
          </div>
        </div>

        {/* Card 4: VFD Inverter Metrics */}
        <div style={{
          background: '#0d181c',
          border: '1.5px solid #1a332d',
          borderRadius: '16px',
          padding: '18px 20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            VFD INVERTER TELEMETRY
          </span>
          <div style={{ margin: '8px 0' }}>
            <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ffffff', lineHeight: 1.1 }}>
              14.5 A <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>@ 415V 3-Phase</span>
            </div>
            <span style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600 }}>
              Freq: 48.5 Hz • Efficiency: 96.4%
            </span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '6px' }}>
            Internal VFD Temp: 38.2°C (Optimal)
          </div>
        </div>
      </div>

      {/* Row 2: Daylight Generation & Pumping Hours Timeline */}
      <div style={{
        background: '#0d181c',
        border: '1.5px solid #1a332d',
        borderRadius: '18px',
        padding: '20px 22px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            DAYLIGHT SOLAR PUMPING TIMELINE & IRRADIANCE CURVE
          </span>
          <span style={{ fontSize: '0.76rem', color: '#94a3b8' }}>
            Zero Grid Tariff Window: 10:30 AM – 3:45 PM IST
          </span>
        </div>

        {/* Visual Hour Bar Matrix */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-end', height: '90px', padding: '10px 0' }}>
          {[
            { hour: '07:00', irr: 120, active: false },
            { hour: '08:00', irr: 280, active: false },
            { hour: '09:00', irr: 450, active: false },
            { hour: '10:00', irr: 620, active: true },
            { hour: '11:00', irr: 780, active: true },
            { hour: '12:00', irr: 820, active: true },
            { hour: '13:00', irr: 810, active: true },
            { hour: '14:00', irr: 740, active: true },
            { hour: '15:00', irr: 610, active: true },
            { hour: '16:00', irr: 420, active: false },
            { hour: '17:00', irr: 210, active: false }
          ].map((bar, idx) => {
            const heightPct = Math.round((bar.irr / 850) * 100);
            return (
              <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                <span style={{ fontSize: '0.62rem', color: bar.active ? '#34d399' : '#64748b', marginBottom: '4px' }}>{bar.irr}W</span>
                <div style={{
                  width: '100%',
                  height: `${heightPct}%`,
                  background: bar.active ? 'linear-gradient(180deg, #10b981 0%, #059669 100%)' : 'rgba(255, 255, 255, 0.08)',
                  borderRadius: '4px 4px 0 0',
                  border: bar.active ? '1px solid #34d399' : '1px solid transparent'
                }} />
                <span style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '4px' }}>{bar.hour}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Row 3: Operating Controls & Dispatch Actions */}
      <div style={{
        background: '#0d181c',
        border: '1.5px solid #1a332d',
        borderRadius: '18px',
        padding: '20px 22px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            OPERATIONAL MODE & DISPATCH CONTROLS
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
            <button
              onClick={() => setControlMode('AUTO')}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                background: controlMode === 'AUTO' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                border: controlMode === 'AUTO' ? '1.5px solid #10b981' : '1px solid rgba(255, 255, 255, 0.1)',
                color: controlMode === 'AUTO' ? '#34d399' : '#cbd5e1',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              ✓ Autonomous Mode (FAO-56 Trigger)
            </button>

            <button
              onClick={() => setControlMode('MANUAL')}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                background: controlMode === 'MANUAL' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                border: controlMode === 'MANUAL' ? '1.5px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.1)',
                color: controlMode === 'MANUAL' ? '#fbbf24' : '#cbd5e1',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Manual Dispatch Override
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={handleStartPump}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '10px',
              background: '#10b981',
              color: '#06120d',
              border: 'none',
              fontWeight: 800,
              fontSize: '0.86rem',
              cursor: 'pointer'
            }}
          >
            <Play size={16} fill="#06120d" />
            <span>Start Test Run (15 Min)</span>
          </button>

          <button
            onClick={handleStopPump}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '10px',
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#f87171',
              border: '1px solid #ef4444',
              fontWeight: 800,
              fontSize: '0.86rem',
              cursor: 'pointer'
            }}
          >
            <Square size={16} fill="#f87171" />
            <span>Emergency Stop</span>
          </button>
        </div>
      </div>
    </div>
  );
}
