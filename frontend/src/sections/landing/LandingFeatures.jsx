import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Sun,
  Droplets,
  Satellite,
  Zap,
  Shield,
  Leaf,
  TrendingUp,
  Activity,
  Cloud,
  Database,
  Cpu,
  Waves,
  ArrowRight,
  Compass,
  Globe,
  Radio
} from 'lucide-react';
import LiveTelemetryTicker from './LiveTelemetryTicker';
import AgriShowcaseDashboard from './AgriShowcaseDashboard';
import SolarAgroCalculator from './SolarAgroCalculator';
import SatelliteCanopyScanner from './SatelliteCanopyScanner';
import FaqSection from './FaqSection';

gsap.registerPlugin(ScrollTrigger);

/* ─── Scroll Reveal Hook ─── */
function useScrollReveal(ref) {
  useEffect(() => {
    if (!ref.current) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const elements = ref.current.querySelectorAll('.reveal-up, .reveal-left, .reveal-right, .reveal-scale');
    if (prefersReducedMotion) {
      elements.forEach(el => el.classList.add('revealed'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
    );

    elements.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [ref]);
}

/* ─── Feature Bento Card ─── */
function BentoCard({ icon, iconBg, title, description, metric, metricLabel, metricColor, span = 1, delay = 0 }) {
  return (
    <div
      className={`feature-card-premium reveal-up stagger-${Math.min(delay + 1, 6)}`}
      style={{
        gridColumn: span > 1 ? `span ${span}` : 'span 1',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        padding: '36px 32px'
      }}
    >
      <div className="feature-icon-container" style={{
        background: iconBg,
        boxShadow: `0 8px 24px ${iconBg}`,
        width: '62px',
        height: '62px'
      }}>
        {icon}
      </div>

      <h3 style={{
        fontSize: '1.45rem',
        fontWeight: 800,
        letterSpacing: '-0.03em',
        color: 'var(--text-primary)',
        margin: 0
      }}>
        {title}
      </h3>

      <p style={{
        fontSize: '1.12rem',
        lineHeight: 1.75,
        color: 'var(--text-secondary)',
        flex: 1,
        margin: 0
      }}>
        {description}
      </p>

      {metric && (
        <div style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: '10px',
          paddingTop: '18px',
          borderTop: '1px solid var(--border-subtle)'
        }}>
          <span style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '2.4rem',
            fontWeight: 900,
            color: metricColor,
            letterSpacing: '-0.03em'
          }}>
            {metric}
          </span>
          <span style={{ fontSize: '0.92rem', color: 'var(--text-tertiary)', fontWeight: 700 }}>
            {metricLabel}
          </span>
        </div>
      )}
    </div>
  );
}

/* ─── Process Step ─── */
function ProcessStep({ number, title, description, icon, isActive, delay = 0 }) {
  return (
    <div
      className={`reveal-up stagger-${Math.min(delay + 1, 6)}`}
      style={{
        display: 'flex',
        gap: '20px',
        padding: '28px',
        background: isActive ? 'var(--bg-glass-card)' : 'transparent',
        border: `1px solid ${isActive ? 'var(--border-active)' : 'var(--border-subtle)'}`,
        borderRadius: 'var(--radius-xl)',
        backdropFilter: isActive ? 'blur(16px)' : 'none',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        cursor: 'default'
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--border-active)';
        e.currentTarget.style.background = 'var(--bg-glass-card)';
        e.currentTarget.style.transform = 'translateX(8px)';
      }}
      onMouseLeave={e => {
        if (!isActive) {
          e.currentTarget.style.borderColor = 'var(--border-subtle)';
          e.currentTarget.style.background = 'transparent';
        }
        e.currentTarget.style.transform = 'translateX(0)';
      }}
    >
      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: 'var(--radius-md)',
        background: isActive ? 'linear-gradient(135deg, var(--primary-emerald), var(--solar-amber))' : 'var(--bg-surface-elevated)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        transition: 'all 0.3s ease'
      }}>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontWeight: 800,
          fontSize: '1.1rem',
          color: isActive ? '#fff' : 'var(--text-tertiary)'
        }}>
          {number}
        </span>
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          {icon}
          <h4 style={{
            fontSize: '1.05rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em'
          }}>
            {title}
          </h4>
        </div>
        <p style={{
          fontSize: '0.9rem',
          lineHeight: 1.6,
          color: 'var(--text-secondary)'
        }}>
          {description}
        </p>
      </div>
    </div>
  );
}

/* ─── Social Proof / Trust Strip ─── */
function TrustStrip({ lang }) {
  const items = lang === 'hi' ? [
    { icon: <Shield size={18} />, text: 'Row-Level Security' },
    { icon: <Database size={18} />, text: 'PostgreSQL 18 + PostGIS' },
    { icon: <Globe size={18} />, text: 'Open-Meteo API' },
    { icon: <Satellite size={18} />, text: 'Sentinel-2 10m' },
    { icon: <Cpu size={18} />, text: 'FAO-56 Penman-Monteith' },
    { icon: <Radio size={18} />, text: 'PM-KUSUM Integration' }
  ] : [
    { icon: <Shield size={18} />, text: 'Tenant Row-Level Security' },
    { icon: <Database size={18} />, text: 'PostgreSQL 18 + PostGIS 3.6' },
    { icon: <Globe size={18} />, text: 'Open-Meteo Weather API' },
    { icon: <Satellite size={18} />, text: 'Sentinel-2 10m Resolution' },
    { icon: <Cpu size={18} />, text: 'FAO-56 Penman-Monteith Engine' },
    { icon: <Radio size={18} />, text: 'PM-KUSUM Solar Integration' }
  ];

  return (
    <div className="reveal-up" style={{
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: '16px',
      padding: '32px 24px',
      marginTop: '48px'
    }}>
      {items.map((item, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            background: 'var(--bg-glass-card)',
            backdropFilter: 'blur(10px)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-full)',
            color: 'var(--text-secondary)',
            fontSize: '0.82rem',
            fontWeight: 700,
            fontFamily: 'var(--font-mono)',
            transition: 'all 0.3s ease',
            cursor: 'default'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--border-active)';
            e.currentTarget.style.color = 'var(--primary-emerald-light)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border-subtle)';
            e.currentTarget.style.color = 'var(--text-secondary)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <span style={{ color: 'var(--primary-emerald)' }}>{item.icon}</span>
          {item.text}
        </div>
      ))}
    </div>
  );
}

export default function LandingFeatures({ onEnterConsole, lang = 'en' }) {
  const sectionRef = useRef(null);
  useScrollReveal(sectionRef);

  const t = lang === 'hi' ? {
    featuresTitle: 'शक्तिशाली क्षमताएं',
    featuresSubtitle: 'वैज्ञानिक सटीकता, किसान सरलता',
    howTitle: 'कैसे काम करता है',
    howSubtitle: 'उपग्रह से खेत तक, पूर्ण स्वचालित',
    ctaTitle: 'आज ही अपना खेत जोड़ें',
    ctaDescription: 'मुफ्त में अपने खेत का पूरा वैज्ञानिक विश्लेषण पाएं।',
    ctaButton: 'फार्म कंसोल शुरू करें'
  } : {
    featuresTitle: 'Powerful Capabilities',
    featuresSubtitle: 'Scientific precision, farmer simplicity',
    howTitle: 'How It Works',
    howSubtitle: 'From satellite to field, fully autonomous',
    ctaTitle: 'Add Your Farm Today',
    ctaDescription: 'Get comprehensive scientific analysis of your fields for free.',
    ctaButton: 'Launch Farm Console'
  };

  const features = lang === 'hi' ? [
    {
      icon: <Sun size={26} color="#fff" />,
      iconBg: 'rgba(245, 158, 11, 0.2)',
      title: 'सौर पम्प सिंक्रनाइज़ेशन',
      description: 'PM-KUSUM सौर पैनलों के साथ पम्प का स्वचालित तालमेल। पीक सनलाइट में ₹0 बिजली खर्च।',
      metric: '₹0', metricLabel: 'ग्रिड बिजली खर्च', metricColor: 'var(--solar-amber)', span: 1
    },
    {
      icon: <Droplets size={26} color="#fff" />,
      iconBg: 'rgba(56, 189, 248, 0.2)',
      title: 'FAO-56 जल संतुलन',
      description: 'Penman-Monteith ET₀ गणना और मिट्टी जल विज्ञान से सटीक सिंचाई मार्गदर्शन।',
      metric: '35%+', metricLabel: 'जल बचत', metricColor: 'var(--sky-blue)', span: 1
    },
    {
      icon: <Satellite size={26} color="#fff" />,
      iconBg: 'rgba(16, 185, 129, 0.2)',
      title: '10m उपग्रह निगरानी',
      description: 'Sentinel-2 NDVI, EVI और मल्टीस्पेक्ट्रल बैंड से फसल स्वास्थ्य का रियल-टाइम आकलन।',
      metric: '10m', metricLabel: 'रिज़ॉल्यूशन', metricColor: 'var(--primary-emerald)', span: 1
    },
    {
      icon: <Activity size={26} color="#fff" />,
      iconBg: 'rgba(168, 85, 247, 0.2)',
      title: 'CWSI तनाव सूचकांक',
      description: 'Crop Water Stress Index से फसल के जल तनाव का वास्तविक समय में पता लगाएं।',
      metric: '<0.3', metricLabel: 'इष्टतम सीमा', metricColor: '#a855f7', span: 1
    },
    {
      icon: <Cloud size={26} color="#fff" />,
      iconBg: 'rgba(14, 165, 233, 0.2)',
      title: 'मौसम एकीकरण',
      description: 'Open-Meteo API से 7 दिन का पूर्वानुमान, वर्षा अलर्ट और ताप तनाव चेतावनी।',
      span: 1
    },
    {
      icon: <Shield size={26} color="#fff" />,
      iconBg: 'rgba(16, 185, 129, 0.15)',
      title: 'डेटा सुरक्षा',
      description: 'Row-Level Security, JWT प्रमाणीकरण और Supabase-ग्रेड मल्टी-टेनेंट आइसोलेशन।',
      span: 1
    }
  ] : [
    {
      icon: <Sun size={26} color="#fff" />,
      iconBg: 'rgba(245, 158, 11, 0.2)',
      title: 'Solar Pump Synchronization',
      description: 'Autonomous PM-KUSUM solar panel alignment with pump schedules. Zero grid electricity cost at peak sunlight hours.',
      metric: '₹0', metricLabel: 'Peak grid cost', metricColor: 'var(--solar-amber)', span: 1
    },
    {
      icon: <Droplets size={26} color="#fff" />,
      iconBg: 'rgba(56, 189, 248, 0.2)',
      title: 'FAO-56 Water Balance',
      description: 'Deterministic Penman-Monteith ET₀ computation and soil hydrology for precise irrigation scheduling.',
      metric: '35%+', metricLabel: 'water conserved', metricColor: 'var(--sky-blue)', span: 1
    },
    {
      icon: <Satellite size={26} color="#fff" />,
      iconBg: 'rgba(16, 185, 129, 0.2)',
      title: '10m Satellite Monitoring',
      description: 'Sentinel-2 NDVI, EVI and multispectral band analysis for real-time crop health assessment.',
      metric: '10m', metricLabel: 'resolution', metricColor: 'var(--primary-emerald)', span: 1
    },
    {
      icon: <Activity size={26} color="#fff" />,
      iconBg: 'rgba(168, 85, 247, 0.2)',
      title: 'CWSI Stress Detection',
      description: 'Crop Water Stress Index for real-time detection of plant water stress before visible wilting.',
      metric: '<0.3', metricLabel: 'optimal range', metricColor: '#a855f7', span: 1
    },
    {
      icon: <Cloud size={26} color="#fff" />,
      iconBg: 'rgba(14, 165, 233, 0.2)',
      title: 'Weather Integration',
      description: '7-day forecast from Open-Meteo API with precipitation alerts and heat stress warnings.',
      span: 1
    },
    {
      icon: <Shield size={26} color="#fff" />,
      iconBg: 'rgba(16, 185, 129, 0.15)',
      title: 'Enterprise Security',
      description: 'Row-Level Security, JWT authentication and Supabase-grade multi-tenant data isolation.',
      span: 1
    }
  ];

  const steps = lang === 'hi' ? [
    { icon: <Satellite size={20} color="var(--primary-emerald)" />, title: 'उपग्रह डेटा प्राप्ति', description: 'Sentinel-2 से 10m रिज़ॉल्यूशन की मल्टीस्पेक्ट्रल इमेजरी हर 5 दिन।' },
    { icon: <Cloud size={20} color="var(--sky-blue)" />, title: 'मौसम सिंक', description: 'Open-Meteo API से तापमान, आर्द्रता, विकिरण और वर्षा का ताज़ा डेटा।' },
    { icon: <Cpu size={20} color="#a855f7" />, title: 'FAO-56 गणना', description: 'Penman-Monteith ET₀, मिट्टी जल संतुलन, CWSI, और फसल गुणांक की सटीक गणना।' },
    { icon: <Zap size={20} color="var(--solar-amber)" />, title: 'सौर सिंचाई कार्रवाई', description: 'सौर विकिरण और जल आवश्यकता के आधार पर पम्प का स्वचालित शेड्यूलिंग।' }
  ] : [
    { icon: <Satellite size={20} color="var(--primary-emerald)" />, title: 'Satellite Data Ingestion', description: 'Sentinel-2 multispectral imagery at 10m resolution every 5 days for NDVI and EVI computation.' },
    { icon: <Cloud size={20} color="var(--sky-blue)" />, title: 'Weather Sync', description: 'Real-time temperature, humidity, radiation and precipitation data from Open-Meteo API.' },
    { icon: <Cpu size={20} color="#a855f7" />, title: 'FAO-56 Computation', description: 'Deterministic Penman-Monteith ET₀, soil water balance, CWSI, and crop coefficient calculation.' },
    { icon: <Zap size={20} color="var(--solar-amber)" />, title: 'Solar Irrigation Action', description: 'Automated pump scheduling based on solar irradiance availability and crop water demand.' }
  ];

  return (
    <div ref={sectionRef} style={{ position: 'relative' }}>
      {/* 1. Live Regional Telemetry Marquee Banner */}
      <LiveTelemetryTicker lang={lang} />

      {/* ═══════════════ FEATURES BENTO GRID ═══════════════ */}
      <section style={{
        maxWidth: '1760px',
        width: '96%',
        margin: '0 auto',
        padding: '90px 36px'
      }}>
        {/* Section Header */}
        <div className="reveal-up" style={{ textAlign: 'center', marginBottom: '64px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 20px',
            background: 'var(--bg-glass-card)',
            border: '1.5px solid var(--border-subtle)',
            borderRadius: 'var(--radius-full)',
            marginBottom: '22px',
            backdropFilter: 'blur(10px)'
          }}>
            <Leaf size={16} color="var(--primary-emerald)" />
            <span style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--primary-emerald)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {lang === 'hi' ? 'मुख्य विशेषताएं' : 'Core Features'}
            </span>
          </div>

          <h2 style={{
            fontSize: 'clamp(2.4rem, 4.4vw, 3.6rem)',
            fontWeight: 900,
            letterSpacing: '-0.04em',
            marginBottom: '18px'
          }}>
            {t.featuresTitle}
          </h2>
          <p style={{
            fontSize: '1.25rem',
            lineHeight: 1.7,
            color: 'var(--text-secondary)',
            maxWidth: '680px',
            margin: '0 auto'
          }}>
            {t.featuresSubtitle}
          </p>
        </div>

        {/* Bento Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '24px'
        }}>
          {features.map((f, i) => (
            <BentoCard key={i} {...f} delay={i} />
          ))}
        </div>

        {/* Trust Strip */}
        <TrustStrip lang={lang} />
      </section>

      {/* ═══════════════ HOW IT WORKS ═══════════════ */}
      <section style={{
        maxWidth: '1760px',
        width: '96%',
        margin: '0 auto',
        padding: '50px 36px 90px 36px'
      }}>
        <div className="section-divider" style={{ marginBottom: '64px' }} />

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '56px',
          alignItems: 'start'
        }}>
          {/* Left: Description */}
          <div className="reveal-left">
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              borderRadius: 'var(--radius-full)',
              marginBottom: '20px'
            }}>
              <Activity size={14} color="var(--solar-amber)" />
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--solar-amber)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {lang === 'hi' ? 'प्रक्रिया' : 'Process'}
              </span>
            </div>

            <h2 style={{
              fontWeight: 900,
              letterSpacing: '-0.04em',
              marginBottom: '16px'
            }}>
              {t.howTitle}
            </h2>
            <p style={{
              fontSize: '1.1rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.75,
              marginBottom: '32px',
              maxWidth: '480px'
            }}>
              {t.howSubtitle}
            </p>

            {/* CTA Card */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(245, 158, 11, 0.08) 100%)',
              border: '1px solid var(--border-active)',
              borderRadius: 'var(--radius-xl)',
              padding: '28px',
              backdropFilter: 'blur(10px)'
            }}>
              <h4 style={{ fontWeight: 800, marginBottom: '8px' }}>{t.ctaTitle}</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                {t.ctaDescription}
              </p>
              <button
                onClick={onEnterConsole}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '14px 24px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '1rem'
                }}
              >
                <Compass size={18} />
                <span>{t.ctaButton}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Right: Process Steps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {steps.map((step, i) => (
              <ProcessStep
                key={i}
                number={`0${i + 1}`}
                title={step.title}
                description={step.description}
                icon={step.icon}
                isActive={i === 0}
                delay={i}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 2. Unified AgriGreen / KisanUrja Showcase Dashboard */}
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
