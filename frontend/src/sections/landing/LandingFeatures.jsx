import React from 'react';
import { 
  Droplets, 
  Sun, 
  Satellite, 
  Mic, 
  ShieldCheck, 
  CheckCircle2, 
  TrendingUp, 
  Cpu, 
  Layers, 
  ArrowRight
} from 'lucide-react';
import satelliteImg from '../../assets/satellite_farm_multispectral.jpg';
import farmerVoiceImg from '../../assets/farmer_smart_advisory.jpg';

export default function LandingFeatures({ onEnterConsole, lang = 'en' }) {
  const t = {
    en: {
      sectionPill: "Architected for Real Farmlands",
      sectionTitle: "What is Yuva Energy?",
      sectionSubtitle: "Yuva Energy bridges the divide between cutting-edge computational agronomy and rural farmers. Our closed-loop architecture turns complex satellite telemetry and solar physics into effortless daily actions.",
      
      feat1Title: "Deterministic FAO-56 Water Balance",
      feat1Desc: "Root zone soil moisture is tracked dynamically using FAO-56 Penman-Monteith physics. We calculate Readily Available Water (RAW) and Total Available Water (TAW) so you never waste a drop or stress your crops.",
      feat1Formula: "Dr(t) = Dr(t-1) - Peff - Irr + ETc,adj + DP",

      feat2Title: "Daylight Solar Pumping Synchronization",
      feat2Desc: "Smart microgrid scheduling coordinates irrigation exclusively during peak solar irradiance (10:30 AM - 3:45 PM), entirely eliminating expensive peak-grid power bills and diesel emissions.",
      feat2Metric: "100% Zero-Diesel Operation",

      feat3Title: "Sentinel-2 Multispectral Satellite Canopy",
      feat3Desc: "High-resolution 10-meter multispectral satellite observations calculate NDVI, EVI, and NDRE indices every 5 days, spotting crop canopy stress days before it becomes visible to the naked eye.",
      feat3Metric: "10m Pixel Resolution",

      feat4Title: "AI Vernacular Voice Assistant",
      feat4Desc: "Engineered specifically for older farmers and those with visual impairments. Just tap the microphone and speak in Hindi or English—the assistant answers instantly in natural spoken audio.",
      feat4Metric: "Hands-Free Voice Interaction",

      stepHeading: "How Farmers Use Yuva Energy in 3 Simple Steps",
      step1Title: "1. Select or Map Your Plot",
      step1Desc: "Draw or select your plot boundary. SoilGrids 250m soil hydraulic properties are automatically extracted.",
      step2Title: "2. Automatic Atmospheric Modeling",
      step2Desc: "Open-Meteo microclimate and Sentinel-2 satellite canopy indices synchronize every hour in the background.",
      step3Title: "3. Clear Spoken Recommendations",
      step3Desc: "Receive exact irrigation runtimes and solar schedules with 1-click audio playback in your language.",

      ctaTitle: "Experience the Future of Indian Agriculture",
      ctaButton: "Open Interactive Farm Console"
    },
    hi: {
      sectionPill: "भारतीय खेतों के लिए विशेष निर्मित",
      sectionTitle: "युवा एनर्जी क्या है?",
      sectionSubtitle: "युवा एनर्जी जटिल उपग्रह डेटा और सौर ऊर्जा विज्ञान को सीधे किसान की सरल भाषा में बदलती है। सही समय पर सही सिंचाई, शून्य बिजली बिल और भरपूर पैदावार।",
      
      feat1Title: "वैज्ञानिक FAO-56 जल संतुलन",
      feat1Desc: "मिट्टी की नमी का वैज्ञानिक आंकलन। यह प्रणाली बताती है कि फसल की जड़ों में कितना पानी बचा है और सिंचाई कब जरूरी है ताकि एक बूंद भी बर्बाद न हो।",
      feat1Formula: "जल संतुलन: Dr = Dr(पूर्व) - वर्षा - सिंचाई + वाष्पोत्सर्जन",

      feat2Title: "सौर ऊर्जा पम्पिंग का सही समय",
      feat2Desc: "पंप को केवल तेज धूप के समय (सुबह 10:30 से दोपहर 3:45) चलाने का स्वचालित सुझाव, जिससे महंगे ग्रिड बिजली बिल और डीजल का खर्च पूरी तरह खत्म हो जाता है।",
      feat2Metric: "100% मुफ्त सौर ऊर्जा संचालन",

      feat3Title: "सेंटीनेल-2 उपग्रह से फसल निगरानी",
      feat3Desc: "अंतरिक्ष से 10-मीटर उपग्रह द्वारा हर 5 दिन में फसल के स्वास्थ्य (NDVI) की जांच। किसी भी बीमारी या पानी की कमी का संकेत तुरंत पहचानें।",
      feat3Metric: "10 मीटर सटीक उपग्रह पैमाना",

      feat4Title: "अपनी भाषा में बोलकर पूछें (वॉयस मॉडल)",
      feat4Desc: "बुजुर्ग किसानों और कमजोर नजर वाले साथियों के लिए सहज सुविधा। बस माइक दबाकर हिन्दी या अंग्रेजी में पूछें, युवा एनर्जी बोलकर जवाब देगी।",
      feat4Metric: "हाथ मुक्त आवाज सुविधा",

      stepHeading: "3 आसान चरणों में काम करता है युवा एनर्जी",
      step1Title: "1. अपना खेत चुनें",
      step1Desc: "नक्शे पर खेत का चयन करें। मिट्टी की किस्म और जल धारण क्षमता स्वतः लोड हो जाती है।",
      step2Title: "2. स्वचालित मौसम व उपग्रह गणना",
      step2Desc: "मौसम और उपग्रह डेटा हर घंटे अपने आप जांचे जाते हैं।",
      step3Title: "3. सीधा और सरल सुझाव",
      step3Desc: "सिंचाई का सटीक समय और सौर पंप चलाने का निर्देश अपनी भाषा में सुनें और देखें।",

      ctaTitle: "स्मार्ट सौर कृषि का अनुभव आज ही करें",
      ctaButton: "खेत डैशबोर्ड तुरंत खोलें"
    }
  }[lang] || {};

  return (
    <section style={{
      maxWidth: '1440px',
      margin: '0 auto',
      padding: '72px 24px 96px 24px'
    }}>
      {/* Section Header with Generous Negative Space */}
      <div style={{ textAlign: 'center', maxWidth: '840px', margin: '0 auto 64px auto' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(245, 158, 11, 0.12)',
          border: '1px solid rgba(245, 158, 11, 0.35)',
          borderRadius: 'var(--radius-full)',
          padding: '6px 16px',
          marginBottom: '16px'
        }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--solar-amber)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {t.sectionPill}
          </span>
        </div>

        <h2 style={{
          fontSize: 'clamp(2rem, 3.5vw, 2.8rem)',
          fontWeight: 800,
          letterSpacing: '-0.03em',
          marginBottom: '20px'
        }}>
          {t.sectionTitle}
        </h2>

        <p style={{
          fontSize: '1.2rem',
          lineHeight: 1.8,
          color: 'var(--text-secondary)'
        }}>
          {t.sectionSubtitle}
        </p>
      </div>

      {/* Grid of 4 Major Pillars */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '36px',
        marginBottom: '80px'
      }}>
        {/* Pillar 1: Water Balance */}
        <div className="glass-panel" style={{ padding: '36px', display: 'flex', flexDirection: 'column' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'rgba(14, 165, 233, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '24px'
          }}>
            <Droplets size={30} color="var(--sky-blue)" />
          </div>

          <h3 style={{ fontSize: '1.45rem', fontWeight: 700, marginBottom: '14px' }}>
            {t.feat1Title}
          </h3>

          <p style={{ fontSize: '1.05rem', lineHeight: 1.7, color: 'var(--text-secondary)', marginBottom: '24px', flex: 1 }}>
            {t.feat1Desc}
          </p>

          <div style={{
            background: 'rgba(14, 165, 233, 0.08)',
            border: '1px solid rgba(14, 165, 233, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            fontFamily: 'monospace',
            fontSize: '0.85rem',
            color: '#7dd3fc'
          }}>
            {t.feat1Formula}
          </div>
        </div>

        {/* Pillar 2: Solar Energy Dispatch */}
        <div className="glass-panel" style={{ padding: '36px', display: 'flex', flexDirection: 'column' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'rgba(245, 158, 11, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '24px'
          }}>
            <Sun size={30} color="var(--solar-amber)" />
          </div>

          <h3 style={{ fontSize: '1.45rem', fontWeight: 700, marginBottom: '14px' }}>
            {t.feat2Title}
          </h3>

          <p style={{ fontSize: '1.05rem', lineHeight: 1.7, color: 'var(--text-secondary)', marginBottom: '24px', flex: 1 }}>
            {t.feat2Desc}
          </p>

          <div style={{
            background: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid var(--border-solar)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.9rem',
            fontWeight: 700,
            color: 'var(--solar-amber)'
          }}>
            <CheckCircle2 size={16} />
            <span>{t.feat2Metric}</span>
          </div>
        </div>

        {/* Pillar 3: Satellite Multispectral (With Real Aerial Image) */}
        <div className="glass-panel" style={{ padding: '36px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'rgba(16, 185, 129, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '24px'
          }}>
            <Satellite size={30} color="var(--primary-emerald)" />
          </div>

          <h3 style={{ fontSize: '1.45rem', fontWeight: 700, marginBottom: '14px' }}>
            {t.feat3Title}
          </h3>

          <p style={{ fontSize: '1.05rem', lineHeight: 1.7, color: 'var(--text-secondary)', marginBottom: '20px' }}>
            {t.feat3Desc}
          </p>

          <div style={{
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            border: '1px solid var(--border-subtle)',
            marginBottom: '20px',
            maxHeight: '160px'
          }}>
            <img 
              src={satelliteImg} 
              alt="High-resolution multispectral farmland plots"
              style={{ width: '100%', height: '160px', objectFit: 'cover' }}
            />
          </div>

          <div style={{
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.9rem',
            fontWeight: 700,
            color: 'var(--primary-emerald-light)'
          }}>
            <TrendingUp size={16} />
            <span>{t.feat3Metric}</span>
          </div>
        </div>

        {/* Pillar 4: Vernacular Voice Assistant (With Real Farmer Image) */}
        <div className="glass-panel" style={{ padding: '36px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'rgba(245, 158, 11, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '24px'
          }}>
            <Mic size={30} color="var(--solar-amber)" />
          </div>

          <h3 style={{ fontSize: '1.45rem', fontWeight: 700, marginBottom: '14px' }}>
            {t.feat4Title}
          </h3>

          <p style={{ fontSize: '1.05rem', lineHeight: 1.7, color: 'var(--text-secondary)', marginBottom: '20px' }}>
            {t.feat4Desc}
          </p>

          <div style={{
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            border: '1px solid var(--border-subtle)',
            marginBottom: '20px',
            maxHeight: '160px'
          }}>
            <img 
              src={farmerVoiceImg} 
              alt="Farmer using smart voice assistant in sunlit field"
              style={{ width: '100%', height: '160px', objectFit: 'cover' }}
            />
          </div>

          <div style={{
            background: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid var(--border-solar)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.9rem',
            fontWeight: 700,
            color: 'var(--solar-amber)'
          }}>
            <Mic size={16} />
            <span>{t.feat4Metric}</span>
          </div>
        </div>
      </div>

      {/* 3-Step Journey Walkthrough */}
      <div style={{
        background: 'rgba(11, 31, 22, 0.65)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xl)',
        padding: '56px 40px',
        marginBottom: '80px'
      }}>
        <h3 style={{
          textAlign: 'center',
          fontSize: '1.85rem',
          fontWeight: 800,
          marginBottom: '48px',
          color: '#ffffff'
        }}>
          {t.stepHeading}
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '36px'
        }}>
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary-emerald)', marginBottom: '12px' }}>01</div>
            <h4 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '10px' }}>{t.step1Title}</h4>
            <p style={{ fontSize: '1rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>{t.step1Desc}</p>
          </div>

          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--solar-amber)', marginBottom: '12px' }}>02</div>
            <h4 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '10px' }}>{t.step2Title}</h4>
            <p style={{ fontSize: '1rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>{t.step2Desc}</p>
          </div>

          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--sky-blue)', marginBottom: '12px' }}>03</div>
            <h4 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '10px' }}>{t.step3Title}</h4>
            <p style={{ fontSize: '1rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>{t.step3Desc}</p>
          </div>
        </div>
      </div>

      {/* Bottom Conversion Banner */}
      <div style={{
        textAlign: 'center',
        padding: '64px 32px',
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(245, 158, 11, 0.1) 100%)',
        border: '1.5px solid var(--border-active)',
        borderRadius: 'var(--radius-xl)'
      }}>
        <h3 style={{
          fontSize: '2.2rem',
          fontWeight: 800,
          marginBottom: '20px',
          color: '#ffffff'
        }}>
          {t.ctaTitle}
        </h3>

        <button
          onClick={onEnterConsole}
          className="btn-primary"
          style={{
            padding: '18px 40px',
            fontSize: '1.15rem',
            borderRadius: 'var(--radius-md)'
          }}
        >
          <span>{t.ctaButton}</span>
          <ArrowRight size={20} />
        </button>
      </div>
    </section>
  );
}
