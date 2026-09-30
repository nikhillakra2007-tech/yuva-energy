import React from 'react';
import LiveTelemetryTicker from './LiveTelemetryTicker';
import SolarAgroCalculator from './SolarAgroCalculator';
import SatelliteCanopyScanner from './SatelliteCanopyScanner';
import FaqSection from './FaqSection';

export default function LandingFeatures({ onEnterConsole, lang = 'en' }) {
  return (
    <div style={{ position: 'relative' }}>
      {/* 1. Live Regional Telemetry Marquee Banner */}
      <LiveTelemetryTicker lang={lang} />

      {/* 2. Interactive Solar Irrigation & Yield Value Calculator */}
      <SolarAgroCalculator onEnterConsole={onEnterConsole} lang={lang} />

      {/* 3. Interactive Sentinel-2 Satellite Canopy Scanner */}
      <SatelliteCanopyScanner onEnterConsole={onEnterConsole} lang={lang} />

      {/* 4. Streamlined FAQ Accordion with Final Conversion CTA */}
      <FaqSection onEnterConsole={onEnterConsole} lang={lang} />
    </div>
  );
}
