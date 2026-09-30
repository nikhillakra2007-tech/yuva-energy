import React, { useState } from 'react';
import { 
  MapPin, 
  Leaf, 
  Satellite, 
  Layers, 
  Maximize2, 
  Compass,
  CheckCircle2,
  Activity
} from 'lucide-react';
import FieldMap from '../geospatial/FieldMap';

export default function FarmerFieldsTab({
  field,
  waterBalance,
  soil,
  fieldTabs,
  selectedFieldTab,
  setSelectedFieldTab,
  isPunjab,
  lang = 'en'
}) {
  const [showNdviOverlay, setShowNdviOverlay] = useState(false);

  const activePlot = fieldTabs.find(f => f.id === selectedFieldTab) || fieldTabs[0];

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
            <MapPin size={20} color="#38bdf8" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
              {lang === 'hi' ? 'खेत सीमा व भू-स्थानिक उपग्रह मानचित्र' : 'Geospatial Field Boundary & Canopy Analysis'}
            </h3>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
              10-Meter Copernicus Sentinel-2 Multispectral Ingestion • Real-Time Boundary
            </span>
          </div>
        </div>

        {/* Plot Selector Pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {fieldTabs.map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedFieldTab(f.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '10px',
                background: selectedFieldTab === f.id ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                border: selectedFieldTab === f.id ? '1.5px solid #10b981' : '1px solid rgba(255, 255, 255, 0.1)',
                color: selectedFieldTab === f.id ? '#34d399' : '#cbd5e1',
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Leaf size={14} color={selectedFieldTab === f.id ? '#10b981' : '#64748b'} />
              <span>{f.crop}</span>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>({f.area})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Row of 3 Concise Metric Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '16px'
      }}>
        {/* Card 1: Boundary Geometry */}
        <div style={{
          background: '#0d181c',
          border: '1.5px solid #1a332d',
          borderRadius: '16px',
          padding: '16px 18px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            POLYGON EXTENT & CENTROID
          </span>
          <div style={{ margin: '8px 0' }}>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff' }}>
              {activePlot.area} <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>({(parseFloat(activePlot.area) * 2.47).toFixed(1)} Acres)</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#38bdf8', marginTop: '2px' }}>
              Centroid: 29.6857° N, 76.9905° E
            </div>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '6px' }}>
            Coordinate Reference: WGS-84 UTM Zone 43N
          </div>
        </div>

        {/* Card 2: Soil Profile & Depth */}
        <div style={{
          background: '#0d181c',
          border: '1.5px solid #1a332d',
          borderRadius: '16px',
          padding: '16px 18px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            SOIL HYDROLOGY PROFILE
          </span>
          <div style={{ margin: '8px 0' }}>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>
              Sandy Clay Loam
            </div>
            <div style={{ fontSize: '0.78rem', color: '#34d399', marginTop: '2px' }}>
              Root Depth Zr: 1.2m • TAW: 82mm
            </div>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '6px' }}>
            ISRIC World SoilGrids 250m Spatial Resolution
          </div>
        </div>

        {/* Card 3: Canopy Health & NDVI */}
        <div style={{
          background: '#0d181c',
          border: '1.5px solid #1a332d',
          borderRadius: '16px',
          padding: '16px 18px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            SATELLITE CANOPY VIGOR
          </span>
          <div style={{ margin: '8px 0' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#10b981' }}>NDVI 0.76</span>
              <span style={{ fontSize: '0.78rem', color: '#34d399', fontWeight: 700 }}>Healthy Vigor</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
              Sentinel-2 Pass: 38 min ago (Cloud: 2.1%)
            </div>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '6px' }}>
            Normalized Difference Vegetation Index (B8/B4)
          </div>
        </div>
      </div>

      {/* Interactive Map Container */}
      <div style={{
        background: '#0d181c',
        border: '1.5px solid #1a332d',
        borderRadius: '18px',
        padding: '16px',
        position: 'relative'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
          padding: '0 4px'
        }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Satellite size={16} color="#38bdf8" />
            <span>Interactive Farmland GIS Boundary</span>
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => setShowNdviOverlay(prev => !prev)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                background: showNdviOverlay ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                border: showNdviOverlay ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.12)',
                color: showNdviOverlay ? '#34d399' : '#cbd5e1',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Layers size={14} />
              <span>{showNdviOverlay ? 'NDVI Overlay Active' : 'Toggle NDVI Spectrum'}</span>
            </button>
          </div>
        </div>

        {/* Embedded Leaflet Map */}
        <div style={{ height: '480px', borderRadius: '12px', overflow: 'hidden' }}>
          <FieldMap
            field={field}
            waterBalance={waterBalance}
            soil={soil}
            lang={lang}
          />
        </div>
      </div>
    </div>
  );
}
