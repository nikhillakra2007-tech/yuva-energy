import React, { useState } from 'react';
import { HelpCircle, Plus, Minus, ArrowRight } from 'lucide-react';

export default function FaqSection({ onEnterConsole, lang = 'en' }) {
  const [openFaq, setOpenFaq] = useState(0);

  const faqs = [
    {
      qEn: "How does KisanUrja measure field moisture without expensive in-ground physical sensors?",
      qHi: "बिना किसी महंगे सेंसर के किसान ऊर्जा खेत की नमी कैसे जान लेती है?",
      aEn: "Physical soil probes cost thousands of rupees, suffer corrosion, and only measure a few centimeters. Instead, KisanUrja uses the FAO-56 Penman-Monteith physical mass balance model, coupling ISRIC SoilGrids 250m soil hydraulic properties with real-time Open-Meteo atmospheric vapor pressure and 10-meter Sentinel-2 satellite canopy transpiration. It is calibration-free, sensor-free, and spans the entire field.",
      aHi: "पारंपरिक सेंसर महंगे होते हैं और कुछ ही समय में खराब हो जाते हैं। किसान ऊर्जा विश्व खाद्य संगठन (FAO-56) के वैज्ञानिक जल संतुलन का उपयोग करती है, जिसमें उपग्रह और मौसम डेटा से सीधे खेत की जड़ों में मौजूद नमी की सटीक गणना होती है। किसान को कोई उपकरण खरीदने की जरूरत नहीं।"
    },
    {
      qEn: "What happens during cloudy monsoon days when solar radiation drops?",
      qHi: "बादल या बारिश के दिनों में जब धूप कम हो, तब यह प्रणाली कैसे काम करती है?",
      aEn: "Our atmospheric model tracks hourly solar irradiance (W/m²) and cloud opacity. On overcast or rainy days, reference evapotranspiration drops and effective precipitation (Peff) replenishes root water. The system automatically reduces or suspends pumping recommendations, safeguarding groundwater and preventing root rot.",
      aHi: "बादल होने पर वाष्पीकरण घट जाता है और बारिश से मिट्टी में नमी बढ़ जाती है। प्रणाली स्वतः समझ जाती है कि पानी की जरूरत कम है और पम्प चलाने का निर्देश रोक देती है, जिससे फसल खराब होने से बचती है।"
    },
    {
      qEn: "Is KisanUrja compatible with PM-KUSUM solar pumps and existing electric tube-wells?",
      qHi: "क्या यह पीएम-कुसुम सोलर पम्प और सामान्य बिजली वाले ट्यूबवेल के साथ काम करती है?",
      aEn: "Yes. KisanUrja works seamlessly with any pump setup. For PM-KUSUM Standalone (Component B) or Feeder Solarized (Component C) installations, our algorithm syncs pumping to peak inverter efficiency curves. For grid and diesel setups, it provides the optimal run window to slash operating tariffs.",
      aHi: "हाँ, यह पीएम-कुसुम योजना के तहत लगे सोलर पम्पों और आम ट्यूबवेल दोनों के साथ पूरी तरह काम करती है। यह बताती है कि सौर पम्प को किस समय चलाने पर सबसे तेज पानी मिलेगा।"
    },
    {
      qEn: "Can older farmers or those who cannot read English use this platform?",
      qHi: "क्या बुजुर्ग किसान या कम पढ़े-लिखे किसान इसे आसानी से चला सकते हैं?",
      aEn: "Absolutely. We designed KisanUrja for accessibility from day one: 1-click Vernacular Voice AI Assistant (just tap the mic and speak in Hindi or English), instant text-to-speech narration of every diagnosis, dynamic font scaling (up to 140%), and an outdoor High-Contrast Sunlight Mode.",
      aHi: "बिल्कुल! इसमें 'बोलकर पूछें' (वॉयस मॉडल) की सुविधा है। किसान बस माइक दबाकर बोलें और किसान ऊर्जा बोलकर जवाब देती है। साथ ही बड़े अक्षरों और तेज धूप मोड की सुविधा भी दी गई है।"
    },
    {
      qEn: "How are groundwater conservation and diesel replacement verified for carbon credits?",
      qHi: "डीजल बचत और भूजल संरक्षण का प्रमाण कैसे मिलता है?",
      aEn: "Every completed irrigation cycle logs an immutable NIST-standard telemetry chain: GPS field polygon, soil hydraulics, satellite NDVI index, solar kWh utilized, and avoided diesel liters. This audit trail is ready for CPCB Green Credit verification and voluntary carbon credit registries.",
      aHi: "प्रत्येक सिंचाई का पूरा डिजिटल रिकॉर्ड तैयार होता है—जिसमें उपग्रह डेटा, सौर ऊर्जा का उपयोग और बचा हुआ डीजल दर्ज होता है। यह सरकारी व अंतर्राष्ट्रीय कार्बन क्रेडिट के लिए मान्य है।"
    },
    {
      qEn: "Can I explore the farm console right now without signing up or typing passwords?",
      qHi: "क्या मैं बिना नया खाता बनाए या पासवर्ड डाले अभी खेत डैशबोर्ड देख सकता हूँ?",
      aEn: "Yes! Click 'Launch Farm Console' or 'Overview' anytime. The platform comes pre-loaded with an authenticated demo estate in Karnal, Haryana (with real satellite bounds, weather telemetry, and water balance), letting you test every feature instantly.",
      aHi: "हाँ! आप बिना पासवर्ड डाले एक क्लिक में 'खेत डैशबोर्ड' खोल सकते हैं। इसमें करनाल, हरियाणा का मॉडल फार्म पहले से लोड है, जिससे आप सभी सुविधाएं तुरंत देख सकते हैं।"
    }
  ];

  const t = {
    en: {
      pill: "Transparent Answers",
      title: "Frequently Asked Questions",
      subtitle: "Everything you need to know about autonomous solar irrigation, satellite agronomy, and groundwater conservation.",
      stillHaveQuestions: "Ready to see your field in real time?",
      openConsoleBtn: "Open Interactive Farm Console"
    },
    hi: {
      pill: "स्पष्ट व पारदर्शी जानकारी",
      title: "अक्सर पूछे जाने वाले सवाल",
      subtitle: "सौर सिंचाई, उपग्रह निगरानी और भूजल बचत से जुड़े आपके सभी सवालों के सटीक उत्तर।",
      stillHaveQuestions: "अपने खेत का सीधा आंकलन देखना चाहते हैं?",
      openConsoleBtn: "खेत डैशबोर्ड तुरंत खोलें"
    }
  }[lang] || {};

  return (
    <div style={{
      maxWidth: '1080px',
      margin: '0 auto',
      padding: '48px 24px 80px 24px'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
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
          <HelpCircle size={16} color="var(--primary-emerald)" />
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

      {/* Accordion List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '56px' }}>
        {faqs.map((faq, idx) => {
          const isOpen = openFaq === idx;
          return (
            <div 
              key={idx}
              className="glass-panel"
              style={{
                borderRadius: 'var(--radius-lg)',
                border: isOpen ? '1.5px solid var(--primary-emerald)' : '1px solid var(--border-subtle)',
                overflow: 'hidden',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              <button
                type="button"
                onClick={() => setOpenFaq(isOpen ? null : idx)}
                style={{
                  width: '100%',
                  padding: '24px 28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  background: isOpen ? 'rgba(16, 185, 129, 0.08)' : 'transparent',
                  border: 'none',
                  color: '#ffffff',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.15rem',
                  fontWeight: 700
                }}
              >
                <span>{lang === 'hi' ? faq.qHi : faq.qEn}</span>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: isOpen ? 'var(--primary-emerald)' : 'rgba(18, 45, 32, 0.8)',
                  color: isOpen ? '#06120d' : 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.2s'
                }}>
                  {isOpen ? <Minus size={18} strokeWidth={2.5} /> : <Plus size={18} strokeWidth={2.5} />}
                </div>
              </button>

              {isOpen && (
                <div style={{
                  padding: '0 28px 24px 28px',
                  fontSize: '1.05rem',
                  lineHeight: 1.8,
                  color: 'var(--text-secondary)'
                }}>
                  <p>{lang === 'hi' ? faq.aHi : faq.aEn}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Conversion Prompt */}
      <div style={{
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(245, 158, 11, 0.12) 100%)',
        border: '1.5px solid var(--border-active)',
        borderRadius: 'var(--radius-xl)',
        padding: '48px 32px'
      }}>
        <h3 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#ffffff', marginBottom: '14px' }}>
          {t.stillHaveQuestions}
        </h3>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
          {lang === 'hi' ? 'करनाल मॉडल फार्म का लाइव सैटेलाइट डेटा और सौर पम्पिंग तुरंत देखें।' : 'Explore live Sentinel-2 satellite passes, soil hydrology, and solar pump dispatch.'}
        </p>
        <button
          type="button"
          onClick={onEnterConsole}
          className="btn-primary"
          style={{ padding: '16px 36px', fontSize: '1.1rem', borderRadius: 'var(--radius-md)' }}
        >
          <span>{t.openConsoleBtn}</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
