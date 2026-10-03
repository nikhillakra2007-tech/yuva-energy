import React, { useState, useId } from 'react';
import { 
  Calculator, 
  Droplets, 
  TrendingUp, 
  Volume2, 
  VolumeX, 
  ArrowRight, 
  Leaf, 
  CheckCircle2, 
  Sparkles 
} from 'lucide-react';

export default function SolarAgroCalculator({ onEnterConsole, lang = 'en' }) {
  const [cropKey, setCropKey] = useState('basmati');
  const [acres, setAcres] = useState(5);
  const [powerSource, setPowerSource] = useState('diesel'); // 'diesel' | 'grid'
  const [isSpeaking, setIsSpeaking] = useState(false);
  const sliderId = useId();

  const crops = {
    basmati: {
      nameEn: "Basmati Rice",
      nameHi: "बासमती धान",
      rate: "₹3,850/qtl",
      waterIntensity: "High (FAO-56 Kc: 1.15)",
      baseWaterMm: 850, // mm per season
      dieselCostPerAcre: 19500, // ₹ / season
      gridCostPerAcre: 11200,
      yieldBoostPercent: 24,
      co2PerAcreKg: 850
    },
    wheat: {
      nameEn: "Wheat / Grain",
      nameHi: "गेहूं / रबी फसल",
      rate: "₹2,425/qtl",
      waterIntensity: "Moderate (Kc: 1.05)",
      baseWaterMm: 450,
      dieselCostPerAcre: 12400,
      gridCostPerAcre: 7200,
      yieldBoostPercent: 18,
      co2PerAcreKg: 520
    },
    mustard: {
      nameEn: "Mustard & Oilseeds",
      nameHi: "सरसों व तिलहन",
      rate: "₹5,650/qtl",
      waterIntensity: "Low (Kc: 0.85)",
      baseWaterMm: 300,
      dieselCostPerAcre: 8500,
      gridCostPerAcre: 4800,
      yieldBoostPercent: 19,
      co2PerAcreKg: 380
    },
    sugarcane: {
      nameEn: "Sugarcane",
      nameHi: "गन्ना (वर्षभर)",
      rate: "₹380/qtl",
      waterIntensity: "Very High (Kc: 1.25)",
      baseWaterMm: 1400,
      dieselCostPerAcre: 28500,
      gridCostPerAcre: 16800,
      yieldBoostPercent: 26,
      co2PerAcreKg: 1200
    },
    potato: {
      nameEn: "Potato & Vegetables",
      nameHi: "आलू व हरी सब्जियां",
      rate: "₹1,450/qtl",
      waterIntensity: "Precision Drip (Kc: 0.95)",
      baseWaterMm: 420,
      dieselCostPerAcre: 14000,
      gridCostPerAcre: 8400,
      yieldBoostPercent: 28,
      co2PerAcreKg: 610
    },
    cotton: {
      nameEn: "Cotton",
      nameHi: "कपास (खरीफ)",
      rate: "₹7,120/qtl",
      waterIntensity: "Semi-Arid (Kc: 1.10)",
      baseWaterMm: 650,
      dieselCostPerAcre: 16500,
      gridCostPerAcre: 9800,
      yieldBoostPercent: 21,
      co2PerAcreKg: 730
    }
  };

  const selectedCrop = crops[cropKey] || crops.basmati;

  // Real-world dynamic calculations
  const costPerAcre = powerSource === 'diesel' ? selectedCrop.dieselCostPerAcre : selectedCrop.gridCostPerAcre;
  const annualSavingsRupees = Math.round(costPerAcre * acres);
  // Groundwater saved: 1 mm over 1 acre = 4,046.86 Liters. We save 32% with FAO-56 precision timing vs flood
  const waterSavedLiters = Math.round(selectedCrop.baseWaterMm * 4047 * 0.32 * acres);
  const co2AvoidedKg = Math.round(selectedCrop.co2PerAcreKg * acres);
  const yieldGainPercent = selectedCrop.yieldBoostPercent;

  const t = {
    en: {
      pill: "Interactive Solar-Agro Economic Engine",
      title: "Calculate Your Solar & Water Savings",
      subtitle: "See exact financial returns, diesel replacement economics, and groundwater conservation for your farmland plot.",
      cropSelectLabel: "1. Select Your Crop Type",
      areaLabel: "2. Farmland Plot Size",
      acresUnit: "Acres",
      powerSourceLabel: "3. Current Pumping Source Being Replaced",
      dieselSource: "Diesel Genset (₹92/hr fuel)",
      gridSource: "Grid Electricity (Night cuts)",
      metric1Label: "Annual Pumping Energy Saved",
      metric2Label: "Groundwater Conserved / Season",
      metric3Label: "Crop Yield Productivity",
      metric4Label: "CO₂ Emissions Avoided",
      litersUnit: "Liters",
      pmKusumNote: "Eligible for up to 60% PM-KUSUM Central & State capital subsidy.",
      speakBtn: "Hear Calculation",
      stopBtn: "Stop Speech",
      launchConsoleCta: "Simulate This Plot in Farm Console"
    },
    hi: {
      pill: "इंटरैक्टिव सौर-कृषि बचत गणक",
      title: "अपनी सौर ऊर्जा व पानी की बचत जानें",
      subtitle: "अपने खेत के रकबे और फसल के अनुसार जानें कि सौर पम्प और सटीक जल संतुलन से कितनी बचत होगी।",
      cropSelectLabel: "1. अपनी फसल का चयन करें",
      areaLabel: "2. खेत का रकबा (क्षेत्रफल)",
      acresUnit: "एकड़",
      powerSourceLabel: "3. वर्तमान में इस्तेमाल होने वाला साधन",
      dieselSource: "डीजल इंजन (₹92/घंटा डीजल)",
      gridSource: "ग्रिड बिजली (रात की सप्लाई)",
      metric1Label: "सालाना पम्पिंग खर्च की सीधी बचत",
      metric2Label: "भूजल की सीधी बचत प्रति सीजन",
      metric3Label: "फसल पैदावार में वृद्धि",
      metric4Label: "कार्बन उत्सर्जन में कमी",
      litersUnit: "लीटर",
      pmKusumNote: "पीएम-कुसुम (PM-KUSUM) योजना के तहत 60% तक सरकारी अनुदान मान्य।",
      speakBtn: "यह आंकलन बोलकर सुनें",
      stopBtn: "आवाज रोकें",
      launchConsoleCta: "इस खेत को सीधे डैशबोर्ड में जांचें"
    }
  }[lang] || {};

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) {
      alert("Text-to-speech is not supported on this browser.");
      return;
    }
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const cropName = lang === 'hi' ? selectedCrop.nameHi : selectedCrop.nameEn;
    const narrationText = lang === 'hi'
      ? `${acres} एकड़ ${cropName} के लिए, किसान ऊर्जा सौर पम्पिंग से आपकी सालाना बिजली व डीजल का खर्च लगभग ₹${annualSavingsRupees.toLocaleString('en-IN')} बचेगा। साथ ही ${waterSavedLiters.toLocaleString('en-IN')} लीटर भूजल की बचत होगी और पैदावार में ${yieldGainPercent} प्रतिशत की वृद्धि का अनुमान है।`
      : `For ${acres} acres of ${cropName}, switching to KisanUrja solar pumping will save approximately ₹${annualSavingsRupees.toLocaleString('en-IN')} each year in power and fuel. You will also conserve ${waterSavedLiters.toLocaleString('en-IN')} liters of groundwater while increasing harvest productivity by ${yieldGainPercent} percent.`;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(narrationText);
    utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  return (
    <div id="calculator-section" style={{
      maxWidth: '1760px',
      width: '96%',
      margin: '0 auto',
      padding: '56px 36px 90px 36px'
    }}>
      {/* Section Header */}
      <div style={{ textAlign: 'center', maxWidth: '820px', margin: '0 auto 48px auto' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          borderRadius: 'var(--radius-full)',
          padding: '6px 18px',
          marginBottom: '16px'
        }}>
          <Calculator size={16} color="var(--primary-emerald)" />
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-emerald-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {t.pill}
          </span>
        </div>

        <h2 style={{
          fontSize: 'clamp(2rem, 3.2vw, 2.7rem)',
          fontWeight: 800,
          letterSpacing: '-0.03em',
          marginBottom: '16px'
        }}>
          {t.title}
        </h2>

        <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          {t.subtitle}
        </p>
      </div>

      {/* Main Interactive Split Card */}
      <div className="glass-panel" style={{
        padding: '36px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '40px',
        alignItems: 'stretch',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Ambient Glow Blob */}
        <div style={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        {/* Left Column: Interactive Inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', zIndex: 1 }}>
          {/* 1. Crop Selection Pills */}
          <div>
            <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px', color: '#ffffff' }}>
              {t.cropSelectLabel}
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
              gap: '10px'
            }}>
              {Object.entries(crops).map(([key, data]) => {
                const isSelected = cropKey === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setCropKey(key)}
                    style={{
                      background: isSelected 
                        ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(5, 150, 105, 0.3) 100%)' 
                        : 'rgba(18, 45, 32, 0.55)',
                      border: isSelected 
                        ? '1.5px solid var(--primary-emerald)' 
                        : '1px solid var(--border-subtle)',
                      color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem', color: isSelected ? 'var(--primary-emerald-light)' : '#ffffff' }}>
                        {lang === 'hi' ? data.nameHi : data.nameEn}
                      </span>
                      {isSelected && <CheckCircle2 size={16} color="var(--primary-emerald)" />}
                    </div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--solar-amber)', fontWeight: 600 }}>
                      {data.rate}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Acre Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <label htmlFor={sliderId} style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>
                {t.areaLabel}
              </label>
              <div style={{
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid var(--primary-emerald)',
                padding: '4px 14px',
                borderRadius: 'var(--radius-full)',
                fontWeight: 800,
                fontSize: '1rem',
                color: 'var(--primary-emerald-light)'
              }}>
                {acres} {t.acresUnit}
              </div>
            </div>
            <input 
              id={sliderId}
              type="range"
              min="1"
              max="50"
              value={acres}
              onChange={(e) => setAcres(parseInt(e.target.value, 10))}
              style={{
                width: '100%',
                accentColor: 'var(--primary-emerald)',
                height: '8px',
                cursor: 'pointer'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>
              <span>1 {t.acresUnit}</span>
              <span>25 {t.acresUnit}</span>
              <span>50 {t.acresUnit}</span>
            </div>
          </div>

          {/* 3. Power Source Replacement Toggle */}
          <div>
            <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 700, marginBottom: '10px', color: '#ffffff' }}>
              {t.powerSourceLabel}
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setPowerSource('diesel')}
                style={{
                  background: powerSource === 'diesel' ? 'rgba(239, 68, 68, 0.18)' : 'rgba(18, 45, 32, 0.5)',
                  border: powerSource === 'diesel' ? '1.5px solid #ef4444' : '1px solid var(--border-subtle)',
                  color: powerSource === 'diesel' ? '#ffffff' : 'var(--text-secondary)',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
              >
                {t.dieselSource}
              </button>

              <button
                type="button"
                onClick={() => setPowerSource('grid')}
                style={{
                  background: powerSource === 'grid' ? 'rgba(245, 158, 11, 0.18)' : 'rgba(18, 45, 32, 0.5)',
                  border: powerSource === 'grid' ? '1.5px solid var(--solar-amber)' : '1px solid var(--border-subtle)',
                  color: powerSource === 'grid' ? '#ffffff' : 'var(--text-secondary)',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
              >
                {t.gridSource}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Computed Value Cockpit */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(8, 22, 16, 0.95) 0%, rgba(12, 34, 24, 0.9) 100%)',
          border: '1.5px solid rgba(52, 211, 153, 0.35)',
          borderRadius: 'var(--radius-lg)',
          padding: '32px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          zIndex: 1,
          boxShadow: '0 20px 48px rgba(0, 0, 0, 0.5)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} color="var(--solar-amber)" />
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--solar-amber)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {lang === 'hi' ? 'अनुमानित लाभ' : 'Estimated Return'}
                </span>
              </div>

              {/* Speech Narration Button */}
              <button
                type="button"
                onClick={handleSpeak}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: isSpeaking ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                  border: `1px solid ${isSpeaking ? '#ef4444' : 'var(--primary-emerald)'}`,
                  color: isSpeaking ? '#ef4444' : 'var(--primary-emerald-light)',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {isSpeaking ? <VolumeX size={15} /> : <Volume2 size={15} />}
                <span>{isSpeaking ? t.stopBtn : t.speakBtn}</span>
              </button>
            </div>

            {/* Main Highlight: Annual Energy Money Saved */}
            <div style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '24px',
              marginBottom: '24px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '6px' }}>
                {t.metric1Label}
              </div>
              <div style={{
                fontSize: 'clamp(2.4rem, 4vw, 3.2rem)',
                fontWeight: 900,
                color: 'var(--primary-emerald-light)',
                fontFamily: 'var(--font-heading)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px'
              }}>
                <span>₹</span>
                <span>{annualSavingsRupees.toLocaleString('en-IN')}</span>
                <span style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', fontWeight: 500 }}>/yr</span>
              </div>
            </div>

            {/* Grid of 3 Secondary KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              {/* Groundwater */}
              <div style={{
                background: 'rgba(14, 165, 233, 0.1)',
                border: '1px solid rgba(14, 165, 233, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--sky-blue)', marginBottom: '6px' }}>
                  <Droplets size={16} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{t.metric2Label}</span>
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
                  {(waterSavedLiters / 1000).toFixed(0)}k <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>L</span>
                </div>
              </div>

              {/* Yield Boost */}
              <div style={{
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--solar-amber)', marginBottom: '6px' }}>
                  <TrendingUp size={16} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{t.metric3Label}</span>
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
                  +{yieldGainPercent}% <span style={{ fontSize: '0.8rem', color: 'var(--primary-emerald)' }}>Optimal</span>
                </div>
              </div>

              {/* CO2 Emissions */}
              <div style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary-emerald-light)', marginBottom: '6px' }}>
                  <Leaf size={16} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{t.metric4Label}</span>
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
                  {(co2AvoidedKg / 1000).toFixed(1)} <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Tonnes</span>
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', lineHeight: 1.5, marginBottom: '24px' }}>
              *{t.pmKusumNote}
            </p>
          </div>

          {/* Action CTA */}
          <button
            type="button"
            onClick={onEnterConsole}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '16px',
              fontSize: '1.05rem',
              borderRadius: 'var(--radius-md)'
            }}
          >
            <span>{t.launchConsoleCta}</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
