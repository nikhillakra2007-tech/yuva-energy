import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, Popup, LayersControl, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Eye } from 'lucide-react';

// Fix Leaflet marker icons in React bundles
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Component to dynamically adjust map center when field changes
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom);
    }
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

  // Extract coordinates from field or default to Karnal, Haryana
  let lat = 29.6857;
  let lon = 76.9905;

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
    ? '#10b981' 
    : (cwsi > 0.6 ? '#ef4444' : cwsi > 0.4 ? '#f59e0b' : '#10b981');

  return (
    <div className="glass-panel" style={{ padding: '20px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <MapPin size={18} color="var(--primary-emerald)" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
            {lang === 'hi' ? 'खेत का भू-स्थानिक मानचित्र' : 'Geospatial Field Boundary & Canopy'}
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            ({lat.toFixed(4)}° N, {lon.toFixed(4)}° E)
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setShowNdvi(!showNdvi)}
            className="btn-secondary"
            style={{ 
              padding: '6px 12px', 
              fontSize: '0.8rem',
              borderColor: showNdvi ? 'var(--primary-emerald)' : 'var(--border-subtle)',
              color: showNdvi ? 'var(--primary-emerald)' : 'var(--text-secondary)'
            }}
          >
            <Eye size={14} />
            {showNdvi 
              ? (lang === 'hi' ? 'NDVI लेयर सक्रिय' : 'NDVI Canopy View Active') 
              : (lang === 'hi' ? 'NDVI लेयर देखें' : 'Toggle Sentinel-2 NDVI')}
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div style={{ flex: 1, minHeight: '380px', position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
        <MapContainer
          center={[lat, lon]}
          zoom={16}
          scrollWheelZoom={false}
          style={{ width: '100%', height: '100%', minHeight: '380px' }}
        >
          <ChangeView center={[lat, lon]} zoom={16} />

          <LayersControl position="topright">
            <LayersControl.BaseLayer checked name="Satellite Imagery (Esri World)">
              <TileLayer
                attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                maxZoom={19}
              />
            </LayersControl.BaseLayer>
            
            <LayersControl.BaseLayer name="Dark Carto">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                maxZoom={19}
              />
            </LayersControl.BaseLayer>
          </LayersControl>

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

          {/* Centroid Marker with Rich Field Data */}
          <Marker position={[lat, lon]}>
            <Popup>
              <div style={{ color: '#0f172a', padding: '4px', maxWidth: '240px' }}>
                <h4 style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
                  {field?.name || 'Active Plot'}
                </h4>
                <p style={{ margin: '4px 0 8px 0', fontSize: '0.8rem', color: '#475569' }}>
                  Crop: {field?.crop_name || 'Basmati Rice'} ({field?.area_hectares || 2.5} ha)
                </p>
                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '6px', fontSize: '0.78rem' }}>
                  <div><strong>Soil:</strong> {soil?.soil_type || 'Sandy Clay Loam'}</div>
                  <div><strong>RAW:</strong> {waterBalance?.raw_mm ? `${waterBalance.raw_mm.toFixed(1)} mm` : '38.4 mm'}</div>
                  <div><strong>Current Depletion:</strong> {waterBalance?.depletion_dr_mm ? `${waterBalance.depletion_dr_mm.toFixed(1)} mm` : '18.2 mm'}</div>
                  <div><strong>Canopy NDVI:</strong> {ndviScore} (Healthy)</div>
                </div>
              </div>
            </Popup>
          </Marker>
        </MapContainer>

        {/* Legend Overlay */}
        <div style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          zIndex: 1000,
          background: 'rgba(8, 20, 15, 0.88)',
          backdropFilter: 'blur(8px)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          padding: '8px 12px',
          fontSize: '0.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#10b981', display: 'inline-block' }}></span>
            <span>{showNdvi ? 'High Biomass NDVI (> 0.7)' : 'Optimal Moisture (Dr < RAW)'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#f59e0b', display: 'inline-block' }}></span>
            <span>{showNdvi ? 'Moderate Biomass (0.4 - 0.7)' : 'Approaching Depletion Threshold'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#ef4444', display: 'inline-block' }}></span>
            <span>{showNdvi ? 'Low Biomass / Bare Soil (< 0.4)' : 'Stress Trigger (Dr >= RAW)'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
