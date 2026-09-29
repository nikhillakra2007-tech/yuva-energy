import React, { useState } from 'react';
import { X, Plus, MapPin } from 'lucide-react';
import { api } from '../services/api';

export default function FieldModal({ farms = [], isOpen, onClose, onCreated, lang = 'en' }) {
  const [farmId, setFarmId] = useState(farms[0]?.id || '');
  const [name, setName] = useState('');
  const [cropName, setCropName] = useState('Basmati Rice (Pusa 1121)');
  const [areaHa, setAreaHa] = useState('2.4');
  const [lat, setLat] = useState('29.9695');
  const [lon, setLon] = useState('76.8783');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const t = {
    en: {
      title: "Register New Field",
      subtitle: "Add an agricultural plot with geospatial coordinates and crop profile.",
      farmLabel: "Select Farm",
      nameLabel: "Field Identifier / Name",
      cropLabel: "Crop Cultivar",
      areaLabel: "Area (Hectares)",
      latLabel: "Centroid Latitude (°N)",
      lonLabel: "Centroid Longitude (°E)",
      createBtn: "Save Field & Initialize Hydraulics",
      creating: "Creating & Fetching Pedotransfer Data...",
      cancel: "Cancel"
    },
    hi: {
      title: "नया खेत पंजीकृत करें",
      subtitle: "भू-स्थानिक निर्देशांक और फसल विवरण के साथ नया कृषि भूखंड जोड़ें।",
      farmLabel: "खेत/फार्म चुनें",
      nameLabel: "खेत का नाम / पहचान",
      cropLabel: "फसल का प्रकार",
      areaLabel: "क्षेत्रफल (हेक्टेयर)",
      latLabel: "अक्षांश (°N)",
      lonLabel: "देशांतर (°E)",
      createBtn: "खेत सहेजें एवं मृदा डेटा लोड करें",
      creating: "सहेजा जा रहा है...",
      cancel: "रद्द करें"
    }
  }[lang] || {};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let selectedFarm = farmId;
      if (!selectedFarm && farms.length > 0) {
        selectedFarm = farms[0].id;
      }

      // If no farms exist, create a default farm first
      if (!selectedFarm) {
        const newFarm = await api.createFarm({
          name: "Yuva Model Agricultural Farm",
          latitude: parseFloat(lat),
          longitude: parseFloat(lon),
          total_area_hectares: parseFloat(areaHa) * 2
        });
        selectedFarm = newFarm.id;
      }

      const newField = await api.createField({
        farm_id: selectedFarm,
        name,
        crop_name: cropName,
        area_hectares: parseFloat(areaHa),
        latitude: parseFloat(lat),
        longitude: parseFloat(lon)
      });

      onCreated(newField);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create field');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{t.title}</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{t.subtitle}</p>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{ padding: '10px 14px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', borderRadius: 'var(--radius-sm)', color: '#f87171', fontSize: '0.85rem', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
              {t.nameLabel}
            </label>
            <input 
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. North Canal Plot A"
              className="input-field"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                {t.cropLabel}
              </label>
              <input 
                type="text"
                required
                value={cropName}
                onChange={(e) => setCropName(e.target.value)}
                placeholder="e.g. Basmati Rice"
                className="input-field"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                {t.areaLabel}
              </label>
              <input 
                type="number"
                step="0.1"
                min="0.1"
                required
                value={areaHa}
                onChange={(e) => setAreaHa(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                {t.latLabel}
              </label>
              <input 
                type="number"
                step="0.0001"
                required
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                {t.lonLabel}
              </label>
              <input 
                type="number"
                step="0.0001"
                required
                value={lon}
                onChange={(e) => setLon(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button type="button" onClick={onClose} className="btn-secondary">
              {t.cancel}
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              <Plus size={16} />
              {loading ? t.creating : t.createBtn}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
