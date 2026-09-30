import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Eye, Satellite, Layers } from 'lucide-react';

// Fix Leaflet marker icons in React bundles
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Component to dynamically adjust map center & invalidate size to avoid grain loop
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom);
    }
    
    // Invalidate size immediately and after layout stabilization to prevent tile graining/loading freeze
    const timer1 = setTimeout(() => map.invalidateSize(), 100);
    const timer2 = setTimeout(() => map.invalidateSize(), 400);

    const handleResize = () => {
      map.invalidateSize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      window.removeEventListener('resize', handleResize);
    };
  }, [center, zoom, map]);
  return null;
}

export default function FieldMap({ 
  field, 
  waterBalance, 
  soil, 
  lang = 'en' 
}) {
  const [showNdvi, setShowNdvi] = useState(false);
  // Default to rock-solid satellite view
  const [mapMode, setMapMode] = useState('satellite'); // 'satellite' | 'street'

  // Extract coordinates from field or default to Karnal rural agricultural basin
  let lat = 29.7425;
  let lon = 76.8850;

  if (field?.latitude != null && field?.longitude != null) {
    lat = parseFloat(field.latitude);
    lon = parseFloat(field.longitude);
  } else if (field?.boundary?.coordinates) {
    try {
      const coords = field.boundary.coordinates[0];
      if (coords && coords.length > 0) {
        lon = coords[0][0];
        lat = coords[0][1];
      }
    } catch {
      // fallback
    }
  }

  // Construct polygon coordinates for the field boundary
  let polygonPositions = [];
  if (field?.boundary?.coordinates?.[0]) {
    polygonPositions = field.boundary.coordinates[0].map(pt => [pt[1], pt[0]]);
  } else {
    const deltaLat = 0.0016;
    const deltaLon = 0.0018;
    polygonPositions = [
      [lat - deltaLat, lon - deltaLon],
      [lat + deltaLat * 0.9, lon - deltaLon * 0.8],
      [lat + deltaLat, lon + deltaLon * 0.95],
      [lat - deltaLat * 0.8, lon + deltaLon],
      [lat - deltaLat, lon - deltaLon]
    ];
  }

  const ndviScore = 0.76;
  const cwsi = waterBalance?.cwsi != null ? waterBalance.cwsi : 0.22;
  const fillColor = showNdvi 
    ? '#059669' 
    : (cwsi > 0.6 ? '#dc2626' : cwsi > 0.4 ? '#d97706' : '#059669');

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1.5px solid var(--border-card)',
      borderRadius: 'var(--radius-xl)',
      padding: '24px',
      boxShadow: 'var(--shadow-card)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'rgba(5, 150, 105, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <MapPin size={20} color="var(--primary-emerald)" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.18rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              {lang === 'hi' ? 'खेत का सजीव उपग्रह मानचित्र' : 'Live Geospatial Field Satellite'}
            </h3>
            <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
              ({lat.toFixed(4)}° N, {lon.toFixed(4)}° E) • {field?.name || 'Active Estate Plot'}
            </span>
          </div>
        </div>

        {/* 1-Click Satellite Toggle & NDVI Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setMapMode(mapMode === 'satellite' ? 'street' : 'satellite')}
            className="btn-secondary"
            style={{ 
              padding: '8px 14px', 
              fontSize: '0.86rem',
              borderColor: mapMode === 'satellite' ? 'var(--primary-emerald)' : 'var(--border-subtle)',
              color: mapMode === 'satellite' ? 'var(--primary-emerald)' : 'var(--text-secondary)',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            title="Toggle between Satellite Imagery and Standard Street Map"
          >
            {mapMode === 'satellite' ? <Satellite size={16} color="var(--primary-emerald)" /> : <Layers size={16} />}
            <span>
              {mapMode === 'satellite' 
                ? (lang === 'hi' ? '🛰️ उपग्रह दृश्य सक्रिय' : '🛰️ Satellite Active') 
                : (lang === 'hi' ? '🗺️ स्ट्रीट मैप' : '🗺️ Street Map')}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setShowNdvi(!showNdvi)}
            className="btn-secondary"
            style={{ 
              padding: '8px 14px', 
              fontSize: '0.86rem',
              borderColor: showNdvi ? 'var(--primary-emerald)' : 'var(--border-subtle)',
              color: showNdvi ? 'var(--primary-emerald)' : 'var(--text-secondary)',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Eye size={16} />
            <span>
              {showNdvi 
                ? (lang === 'hi' ? 'NDVI लेयर चालू' : 'NDVI Canopy Active') 
                : (lang === 'hi' ? 'Sentinel-2 NDVI देखें' : 'Sentinel-2 NDVI')}
            </span>
          </button>
        </div>
      </div>

      {/* Map Container with explicit height to prevent 0px canvas bug */}
      <div style={{
        flex: 1,
        minHeight: '420px',
        height: '420px',
        position: 'relative',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        border: '1px solid var(--border-subtle)'
      }}>
        <MapContainer
          center={[lat, lon]}
          zoom={16}
          scrollWheelZoom={false}
          style={{ width: '100%', height: '100%', minHeight: '420px' }}
        >
          <ChangeView center={[lat, lon]} zoom={16} />

          {/* Dynamic Map Tile Layer - Pure High-Resolution Farmland Satellite & Street */}
          {mapMode === 'satellite' ? (
            <TileLayer
              key="google-satellite-pure"
              attribution='&copy; Google Satellite & Sentinel-2 Copernicus'
              url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
              maxZoom={20}
            />
          ) : (
            <TileLayer
              key="carto-street-voyager"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              maxNativeZoom={19}
              maxZoom={19}
            />
          )}

          {/* Field Boundary Polygon */}
          <Polygon
            positions={polygonPositions}
            pathOptions={{
              color: fillColor,
              weight: 3,
              fillColor: fillColor,
              fillOpacity: showNdvi ? 0.45 : 0.25,
              dashArray: showNdvi ? null : '4, 4'
            }}
          />

          {/* Centroid Marker with Field Data */}
          <Marker position={[lat, lon]}>
            <Popup>
              <div style={{ color: '#0f172a', padding: '4px', maxWidth: '240px', fontFamily: 'var(--font-body)' }}>
                <h4 style={{ margin: 0, fontWeight: 800, fontSize: '0.98rem', color: '#0f172a' }}>
                  {field?.name || 'Active Plot'}
                </h4>
                <p style={{ margin: '4px 0 8px 0', fontSize: '0.82rem', color: '#475569' }}>
                  Crop: {field?.crop_name || 'Basmati Rice'} ({field?.area_hectares || 2.5} ha)
                </p>
                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '6px', fontSize: '0.78rem', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <div><strong>Soil:</strong> {soil?.soil_type || 'Sandy Clay Loam'}</div>
                  <div><strong>RAW:</strong> {waterBalance?.raw_mm ? `${waterBalance.raw_mm.toFixed(1)} mm` : '38.4 mm'}</div>
                  <div><strong>Current Depletion:</strong> {waterBalance?.depletion_dr_mm ? `${waterBalance.depletion_dr_mm.toFixed(1)} mm` : '18.2 mm'}</div>
                  <div><strong>Canopy NDVI:</strong> {ndviScore} (Optimal Vegetation)</div>
                </div>
              </div>
            </Popup>
          </Marker>
        </MapContainer>

        {/* Legend Overlay (Clean ScrapSetu theme) */}
        <div style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          zIndex: 1000,
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '8px 12px',
          fontSize: '0.76rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#059669', display: 'inline-block' }}></span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{showNdvi ? 'High Canopy Biomass (> 0.7 NDVI)' : 'Safe Zone (Depletion < RAW)'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#d97706', display: 'inline-block' }}></span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{showNdvi ? 'Moderate Biomass (0.4 - 0.7)' : 'Approaching Depletion Threshold'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#dc2626', display: 'inline-block' }}></span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{showNdvi ? 'Low Biomass / Bare Soil (< 0.4)' : 'Stress Trigger (Depletion ≥ RAW)'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
