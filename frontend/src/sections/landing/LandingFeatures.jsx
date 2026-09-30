import React from 'react';
import LiveTelemetryTicker from './LiveTelemetryTicker';
import AgriShowcaseDashboard from './AgriShowcaseDashboard';
import SolarAgroCalculator from './SolarAgroCalculator';
import SatelliteCanopyScanner from './SatelliteCanopyScanner';
import FaqSection from './FaqSection';

export default function LandingFeatures({ onEnterConsole, lang = 'en' }) {
  return (
    <div style={{ position: 'relative' }}>
      {/* 1. Live Regional Telemetry Marquee Banner */}
      <LiveTelemetryTicker lang={lang} />

      {/* 2. Unified AgriGreen / KisanUrja Showcase Dashboard (Exact Match to Image 1) */}
      <AgriShowcaseDashboard onEnterConsole={onEnterConsole} lang={lang} />

      {/* 3. Interactive Solar Irrigation & Yield Value Calculator */}
      <SolarAgroCalculator onEnterConsole={onEnterConsole} lang={lang} />

      {/* 4. Interactive Sentinel-2 Satellite Canopy Scanner */}
      <SatelliteCanopyScanner onEnterConsole={onEnterConsole} lang={lang} />

      {/* 5. Streamlined FAQ Accordion with Final Conversion CTA */}
      <FaqSection onEnterConsole={onEnterConsole} lang={lang} />
    </div>
  );
}
