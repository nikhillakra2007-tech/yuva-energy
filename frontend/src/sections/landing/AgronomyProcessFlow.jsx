import React, { useState } from 'react';
import { 
  Users, 
  Droplet, 
  Sun, 
  ShieldCheck, 
  ArrowRight, 
  Cpu, 
  Layers, 
  Satellite, 
  Sparkles, 
  TrendingUp, 
  Award,
  CheckCircle2
} from 'lucide-react';

export default function AgronomyProcessFlow({ lang = 'en' }) {
  const [activePersona, setActivePersona] = useState('farmers'); // 'farmers' | 'hydrology' | 'grid' | 'carbon'

  const personas = {
    farmers: {
      id: 'farmers',
      labelEn: "Farmers & FPOs",
      labelHi: "किसान व उत्पादक संघ",
      titleEn: "Empowering Rural Farmers with Zero Energy Costs",
      titleHi: "ग्रामीण किसानों के लिए शून्य बिजली बिल व उत्तम पैदावार",
      descEn: "Eliminates night-time canal trips and hazardous electric lines. Farmers receive spoken daily water advisories in their local dialect and irrigate entirely with free daylight solar energy.",
      descHi: "रात में खेत जाने की परेशानी और बिजली झटकों का खतरा खत्म। दिन में मुफ्त धूप से सौर पम्प चलाएं और अपनी भाषा में फसल सलाह पाएं।",
      kpis: [
        { label: lang === 'hi' ? "ऊर्जा बिल बचत" : "Energy Tariff Saved", val: "100%" },
        { label: lang === 'hi' ? "फसल पैदावार बढ़त" : "Yield Productivity", val: "+24%" },
        { label: lang === 'hi' ? "वॉयस भाषा समर्थन" : "Dialect Interaction", val: "Hands-Free" }
      ]
    },
    hydrology: {
      id: 'hydrology',
      labelEn: "State Water Boards",
      labelHi: "राज्य जल प्राधिकरण",
      titleEn: "Preventing Critical Aquifer Overdraft",
      titleHi: "भूजल स्तर के अनियंत्रित दोहन की रोकथाम",
      descEn: "Standard flood irrigation wastes up to 45% of groundwater through deep percolation. Yuva Energy's deterministic FAO-56 balance protects underground aquifers across Haryana, Punjab, Rajasthan, and Maharashtra.",
      descHi: "पारंपरिक बाढ़ सिंचाई से 45% भूजल व्यर्थ बह जाता है। वैज्ञानिक जल संतुलन से भूजल स्तर सुरक्षित रहता है और जल संकट रुकता है।",
      kpis: [
        { label: lang === 'hi' ? "भूजल बचत" : "Aquifer Saved", val: "35%+" },
        { label: lang === 'hi' ? "जल तालिका संरक्षण" : "Table Preservation", val: "Critical Basin" },
        { label: lang === 'hi' ? "नियम अनुपालन" : "Central Ground Water", val: "CGWA Ready" }
      ]
    },
    grid: {
      id: 'grid',
      labelEn: "DISCOMs & Power Grid",
      labelHi: "विद्युत वितरण निगम (DISCOM)",
      titleEn: "Peak Daylight Solar Absorption & Subsidy Relief",
      titleHi: "दिन में सौर ऊर्जा का अधिकतम उपयोग व सब्सिडी राहत",
      descEn: "State power companies lose billions in subsidized agricultural night power. Synchronizing pumping with peak solar hours (10:30 AM - 3:45 PM) frees the grid from night-time strain and cuts distribution losses.",
      descHi: "कृषि बिजली सब्सिडी और रात में ट्रांसफार्मर जलने का घाटा खत्म। दिन की सौर ऊर्जा से पम्प चलने पर बिजली ग्रिड पर लोड नहीं पड़ता।",
      kpis: [
        { label: lang === 'hi' ? "दिन का सौर संतुलन" : "Peak Solar Utilization", val: "10:30 - 15:45" },
        { label: lang === 'hi' ? "रात की बिजली बचत" : "Night Subsidies Saved", val: "₹ Crores/yr" },
        { label: lang === 'hi' ? "ट्रांसफार्मर सुरक्षा" : "Grid Stress Index", val: "Minimal Loss" }
      ]
    },
    carbon: {
      id: 'carbon',
      labelEn: "Carbon & Green Credits",
      labelHi: "कार्बन व ग्रीन क्रेडिट",
      titleEn: "Cryptographic Traceability for Green Credits",
      titleHi: "प्रमाणित कार्बन क्रेडिट व पर्यावरण संरक्षण",
      descEn: "Every hour of solar pumping replaces diesel fuel emissions. Our immutable telemetry manifest logs diesel liters avoided and kilowatt-hours offset, eligible for verified CPCB and international carbon trading.",
      descHi: "डीजल पम्प के स्थान पर सौर पम्प चलाने से धुआं और प्रदूषण रुकता है। हर लीटर बचा डीजल किसानों को अतिरिक्त कार्बन क्रेडिट आय दिला सकता है।",
      kpis: [
        { label: lang === 'hi' ? "डीजल उत्सर्जन मुक्त" : "Diesel Displaced", val: "100%" },
        { label: lang === 'hi' ? "कार्बन क्रेडिट आय" : "Green Credits Registry", val: "BEE Compliant" },
        { label: lang === 'hi' ? "पारदर्शी रिपोर्ट" : "Audit Trail", val: "NIST Grade" }
      ]
    }
  };

  const currentPersona = personas[activePersona] || personas.farmers;

  const steps = [
    {
      step: "01",
      titleEn: "Boundary & Soil Hydraulics",
      titleHi: "खेत सीमा व मिट्टी की संरचना",
      descEn: "Farmer outlines plot or picks saved field. SoilGrids 250m pedotransfer formulas extract field capacity (FC), permanent wilting point (PWP), and saturated hydraulic conductivity.",
      descHi: "नक्शे पर खेत का चयन करें। मिट्टी की नमी सोखने की क्षमता और जल स्तर की स्वतः गणना होती है।"
    },
    {
      step: "02",
      titleEn: "Atmospheric & Satellite Sync",
      titleHi: "मौसम व उपग्रह डेटा का तालमेल",
      descEn: "Open-Meteo hourly radiation and wind speed feed into FAO-56 Penman-Monteith ET0. Sentinel-2 multispectral passes calculate dual crop coefficients (Kc) for vegetative density.",
      descHi: "धूप, तापमान और हवा की गति से वाष्पीकरण मापा जाता है। उपग्रह से फसल के पत्तों की सघनता जानी जाती है।"
    },
    {
      step: "03",
      titleEn: "Root Depletion Mass Balance",
      titleHi: "जड़ों में जल संतुलन की गणना",
      descEn: "Dynamic daily balance evaluates Dr vs RAW. The algorithm anticipates crop stress days ahead and identifies the exact millimeter depth needed to restore root zone moisture.",
      descHi: "यह पता चलता है कि मिट्टी में कितना पानी बचा है और फसल को कब और कितने पानी की सख्त जरूरत होगी।"
    },
    {
      step: "04",
      titleEn: "Autonomous Solar Pumping",
      titleHi: "स्वचालित सौर पम्पिंग व वॉयस सलाह",
      descEn: "Calculates optimal solar pumping window during maximum irradiance. The farmer receives an audio notification in Hindi or English, and the solar pump activates without grid costs.",
      descHi: "तेज धूप के दौरान पम्प चलाने का सही समय बताया जाता है। किसान को आवाज में संदेश मिलता है और बिजली का कोई खर्च नहीं होता।"
    }
  ];

  const t = {
    en: {
      pill: "Closed-Loop Agronomy Architecture",
      title: "End-to-End Operational Lifecycle",
      subtitle: "How Yuva Energy transforms planetary earth observation and microgrid physics into a simple, high-yield daily routine.",
      pipelineTitle: "The 4-Step Solar-Agronomy Pipeline"
    },
    hi: {
      pill: "संपूर्ण सौर-कृषि कार्यप्रणाली",
      title: "खेत से उपग्रह तक: संपूर्ण चक्र",
      subtitle: "जानिए कैसे युवा एनर्जी जटिल उपग्रह तकनीक और सौर भौतिकी को किसान के लिए सरल और लाभदायक बनाती है।",
      pipelineTitle: "4 चरणों में सौर-कृषि संचालन चक्र"
    }
  }[lang] || {};

  return (
    <div style={{
      maxWidth: '1440px',
      margin: '0 auto',
      padding: '48px 24px 80px 24px'
    }}>
      {/* Section Header */}
      <div style={{ textAlign: 'center', maxWidth: '820px', margin: '0 auto 52px auto' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(245, 158, 11, 0.12)',
          border: '1px solid rgba(245, 158, 11, 0.35)',
          borderRadius: 'var(--radius-full)',
          padding: '6px 18px',
          marginBottom: '16px'
        }}>
          <Sparkles size={16} color="var(--solar-amber)" />
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--solar-amber)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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

      {/* Stakeholder Role Switcher Tabs */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '40px'
      }}>
        {Object.entries(personas).map(([key, p]) => {
          const isSelected = activePersona === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setActivePersona(key)}
              style={{
                background: isSelected 
                  ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(245, 158, 11, 0.2) 100%)' 
                  : 'rgba(11, 31, 22, 0.75)',
                border: isSelected ? '1.5px solid var(--primary-emerald)' : '1px solid var(--border-subtle)',
                color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                padding: '12px 24px',
                borderRadius: 'var(--radius-full)',
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: isSelected ? '0 4px 20px rgba(16, 185, 129, 0.3)' : 'none'
              }}
            >
              <span className={isSelected ? 'pulse-dot' : ''} style={{ width: '8px', height: '8px' }} />
              <span>{lang === 'hi' ? p.labelHi : p.labelEn}</span>
            </button>
          );
        })}
      </div>

      {/* Selected Stakeholder Value Card */}
      <div className="glass-panel" style={{
        padding: '36px',
        marginBottom: '64px',
        border: '1.5px solid var(--border-active)'
      }}>
        <div style={{ maxWidth: '880px', margin: '0 auto', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', marginBottom: '14px' }}>
            {lang === 'hi' ? currentPersona.titleHi : currentPersona.titleEn}
          </h3>

          <p style={{ fontSize: '1.15rem', lineHeight: 1.8, color: 'var(--text-secondary)', marginBottom: '32px' }}>
            {lang === 'hi' ? currentPersona.descHi : currentPersona.descEn}
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px'
          }}>
            {currentPersona.kpis.map((kpi, idx) => (
              <div key={idx} style={{
                background: 'rgba(18, 45, 32, 0.6)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '18px 24px'
              }}>
                <div style={{
                  fontSize: '1.8rem',
                  fontWeight: 900,
                  color: 'var(--solar-amber)',
                  fontFamily: 'var(--font-heading)',
                  marginBottom: '4px'
                }}>
                  {kpi.val}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  {kpi.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4-Step Pipeline Architecture Cards */}
      <div>
        <h3 style={{
          textAlign: 'center',
          fontSize: '1.85rem',
          fontWeight: 800,
          marginBottom: '48px',
          color: '#ffffff'
        }}>
          {t.pipelineTitle}
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '28px',
          position: 'relative'
        }}>
          {steps.map((st, i) => (
            <div 
              key={i} 
              className="glass-panel"
              style={{
                padding: '32px 28px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Step Number Watermark */}
              <div style={{
                position: 'absolute',
                top: '12px',
                right: '18px',
                fontSize: '3rem',
                fontWeight: 900,
                color: 'rgba(255, 255, 255, 0.05)',
                fontFamily: 'var(--font-heading)',
                pointerEvents: 'none'
              }}>
                {st.step}
              </div>

              <div>
                <div style={{
                  display: 'inline-block',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid var(--primary-emerald)',
                  color: 'var(--primary-emerald-light)',
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  marginBottom: '20px'
                }}>
                  Step {st.step}
                </div>

                <h4 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '14px', color: '#ffffff' }}>
                  {lang === 'hi' ? st.titleHi : st.titleEn}
                </h4>

                <p style={{ fontSize: '0.98rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
                  {lang === 'hi' ? st.descHi : st.descEn}
                </p>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '24px',
                paddingTop: '16px',
                borderTop: '1px solid var(--border-subtle)',
                fontSize: '0.82rem',
                color: 'var(--solar-amber)',
                fontWeight: 700
              }}>
                <CheckCircle2 size={15} />
                <span>Deterministic Logic</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
