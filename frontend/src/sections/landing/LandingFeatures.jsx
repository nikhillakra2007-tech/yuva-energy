import React from 'react';
import { 
  Compass, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

import LiveTelemetryTicker from './LiveTelemetryTicker';
import SolarAgroCalculator from './SolarAgroCalculator';
import SatelliteCanopyScanner from './SatelliteCanopyScanner';
import FaqSection from './FaqSection';

export default function LandingFeatures({ onEnterConsole, lang = 'en' }) {
  const t = {
    en: {
      bottomCtaTitle: "Experience the Future of Indian Agriculture",
      bottomCtaSubtitle: "Launch the live Multi-State Agro-Solar Console or test your farmland boundary across Haryana, Punjab, UP, and Rajasthan.",
      bottomCtaButton: "Launch Interactive Farm Console"
    },
    hi: {
      bottomCtaTitle: "स्मार्ट सौर कृषि का अनुभव आज ही करें",
      bottomCtaSubtitle: "हरियाणा, पंजाब, उत्तर प्रदेश और राजस्थान के खेतों का लाइव डेटा देखें व अपना खेत जोड़ें।",
      bottomCtaButton: "खेत डैशबोर्ड तुरंत खोलें"
    }
  }[lang] || {};

  return (
    <div>
      {/* 1. Live Regional Telemetry Marquee Banner */}
      <LiveTelemetryTicker lang={lang} />

      {/* 2. Interactive Solar Irrigation & Yield Value Calculator */}
      <SolarAgroCalculator onEnterConsole={onEnterConsole} lang={lang} />

      {/* 3. Interactive Sentinel-2 Satellite Canopy Scanner */}
      <SatelliteCanopyScanner onEnterConsole={onEnterConsole} lang={lang} />

      {/* 4. Streamlined FAQ Accordion */}
      <FaqSection onEnterConsole={onEnterConsole} lang={lang} />

      {/* 5. Clean Bottom Conversion Banner */}
      <div style={{
        maxWidth: '1240px',
        margin: '0 auto 64px auto',
        padding: '0 24px'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '52px 32px',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.14) 0%, rgba(245, 158, 11, 0.10) 100%)',
          border: '1.5px solid var(--border-active)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: '0 20px 48px rgba(0, 0, 0, 0.65)'
        }}>
          <h3 style={{
            fontSize: 'clamp(2rem, 3.4vw, 2.6rem)',
            fontWeight: 800,
            marginBottom: '14px',
            color: '#ffffff'
          }}>
            {t.bottomCtaTitle}
          </h3>

          <p style={{
            fontSize: '1.15rem',
            color: 'var(--text-secondary)',
            maxWidth: '620px',
            margin: '0 auto 32px auto',
            lineHeight: 1.7
          }}>
            {t.bottomCtaSubtitle}
          </p>

          <button
            onClick={onEnterConsole}
            className="btn-primary"
            style={{
              padding: '16px 40px',
              fontSize: '1.1rem',
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 12px 32px rgba(16, 185, 129, 0.4)'
            }}
          >
            <Compass size={20} />
            <span>{t.bottomCtaButton}</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
