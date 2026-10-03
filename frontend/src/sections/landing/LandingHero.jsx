import React, { useState, useEffect, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  Sun, 
  Droplets, 
  Satellite, 
  Mic, 
  Volume2, 
  VolumeX, 
  ArrowRight, 
  Sparkles, 
  Compass, 
  Calculator, 
  Zap, 
  Leaf,
  Shield,
  Activity,
  TrendingUp,
  Cloud,
  ChevronDown,
  Radio,
  Gauge,
  CheckCircle2
} from 'lucide-react';
import heroImg from '../../assets/solar_farm_irrigation.jpg';

gsap.registerPlugin(ScrollTrigger);

/* ─── Animated Counter Component ─── */
function AnimatedCounter({ end, suffix = '', prefix = '', duration = 2, decimals = 0 }) {
  const ref = useRef(null);
  const [value, setValue] = useState(0);
  const animated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animated.current) {
          animated.current = true;
          const startTime = performance.now();
          const numEnd = parseFloat(end);

          const animate = (now) => {
            const elapsed = (now - startTime) / 1000;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(numEnd * eased);
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [end, duration]);

  return (
    <span ref={ref}>
      {prefix}{decimals > 0 ? value.toFixed(decimals) : Math.round(value)}{suffix}
    </span>
  );
}

/* ─── Floating Particle System ─── */
function ParticleField() {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    size: 2.5 + Math.random() * 3.5,
    delay: Math.random() * 8,
    duration: 6 + Math.random() * 6,
    opacity: 0.35 + Math.random() * 0.45
  }));

  return (
    <div className="particle-field">
      {particles.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: p.left,
            bottom: '-10px',
            width: `${p.size}px`,
            height: `${p.size}px`,
            borderRadius: '50%',
            background: p.id % 3 === 0 ? 'var(--solar-amber)' : p.id % 3 === 1 ? 'var(--primary-emerald)' : 'var(--sky-blue)',
            opacity: 0,
            animation: `particleFloat ${p.duration}s linear ${p.delay}s infinite`,
            filter: `blur(${p.size > 3.5 ? 1 : 0}px)`
          }}
        />
      ))}
    </div>
  );
}

export default function LandingHero({ 
  onEnterConsole, 
  onOpenAuth, 
  onOpenVoice,
  lang = 'en'
}) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [simMode, setSimMode] = useState('SUNNY'); // 'SUNNY' | 'RAIN' | 'HEAT'
  const heroRef = useRef(null);
  const imgRef = useRef(null);

  const t = {
    en: {
      tag: "India's 1st Autonomous Solar-Agro Intelligence",
      titleLine1: "Sun-Powered",
      titleLine2: "Precision Water",
      titleLine3: "for Every Indian Farmer",
      description: "Empowering rural farmers with deterministic FAO-56 hydrologic modeling, 10-meter Sentinel-2 satellite canopy monitoring, and solar microgrid pump synchronization. Zero cost. Zero complexity.",
      enterConsole: "Launch Farm Console",
      calcRoi: "Solar ROI Calculator",
      scanCanopy: "Satellite Scanner",
      talkVoice: "Voice AI Assistant",
      listenStory: "Listen Platform Audio",
      stopAudio: "Stop Audio",
      stat1Val: 100,
      stat1Suffix: "%",
      stat1Label: "Solar Pumping Coverage",
      stat2Val: 35,
      stat2Suffix: "%+",
      stat2Label: "Groundwater Conserved",
      stat3Val: 10,
      stat3Suffix: "m",
      stat3Label: "Satellite Resolution",
      stat4Val: 0,
      stat4Prefix: "₹",
      stat4Label: "Peak Grid Cost",
      scrollHint: "Scroll to explore platform",
      hudTitle: "LIVE AGRO-SOLAR TELEMETRY MATRIX",
      hudSubtitle: "Sentinel-2 Multi-Spectral + Open-Meteo API Sync",
      solarTitle: "Solar Irradiance & Generation",
      solarVal: simMode === 'RAIN' ? '240 W/m² (Monsoon Diffuse)' : simMode === 'HEAT' ? '895 W/m² (Severe Heat)' : '820 W/m² (Peak Daylight)',
      solarSub: simMode === 'RAIN' ? 'Solar Pump in Standby Mode' : '7.5 HP Submersible • ₹0 Grid Electricity',
      ndviTitle: "Sentinel-2 Canopy Health",
      ndviVal: simMode === 'HEAT' ? 'NDVI: 0.58 (Water Deficit Alert)' : 'NDVI: 0.76 (Vibrant Vegetative Health)',
      ndviSub: 'Band 8 (NIR) / Band 4 (Red) Reflectance Optimal',
      waterTitle: "FAO-56 Hydrologic Root Zone",
      waterVal: simMode === 'RAIN' ? 'Dr: 4.0 mm (Saturated Soil)' : simMode === 'HEAT' ? 'Dr: 44.5 mm (Stress Breached)' : 'Dr: 22.4 mm (RAW Safe Range)',
      waterSub: simMode === 'HEAT' ? 'CWSI 0.54 • Immediate Solar Dispatch' : 'CWSI 0.18 • Transpiration Normal',
      audioScript: "Welcome to KisanUrja. We combine solar energy and satellite intelligence to help you irrigate your fields at the exact right moment, saving water, cutting electricity bills to zero, and protecting crop health."
    },
    hi: {
      tag: "भारत का प्रथम सजीव कृषि-सौर बुद्धिमत्ता सेतु",
      titleLine1: "सौर ऊर्जा",
      titleLine2: "आधारित सटीक सिंचाई",
      titleLine3: "हर किसान के लिए",
      description: "ग्रामीण किसानों के लिए वैज्ञानिक FAO-56 जल संतुलन, 10-मीटर सेंटीनेल-2 उपग्रह फसल निगरानी, और सौर पंपिंग का सीधा तालमेल। पानी और बिजली दोनों की शत-प्रतिशत बचत।",
      enterConsole: "खेत डैशबोर्ड शुरू करें",
      calcRoi: "बचत का हिसाब लगाएं",
      scanCanopy: "उपग्रह स्कैनर",
      talkVoice: "आवाज से बात करें",
      listenStory: "बोलकर सुनाएं",
      stopAudio: "ऑडियो बंद करें",
      stat1Val: 100,
      stat1Suffix: "%",
      stat1Label: "सौर पम्प कवरेज",
      stat2Val: 35,
      stat2Suffix: "%+",
      stat2Label: "भूजल बचत",
      stat3Val: 10,
      stat3Suffix: "m",
      stat3Label: "उपग्रह निगरानी",
      stat4Val: 0,
      stat4Prefix: "₹",
      stat4Label: "ग्रिड बिजली खर्च",
      scrollHint: "नीचे स्क्रोल करें",
      hudTitle: "सजीव कृषि-सौर टेलीमेट्री मैट्रिक्स",
      hudSubtitle: "सेंटीनेल-2 उपग्रह + ओपन-मेटियो लाइव सिंक",
      solarTitle: "सौर विकिरण व ऊर्जा उत्पादन",
      solarVal: simMode === 'RAIN' ? '240 W/m² (बादल व वर्षा)' : simMode === 'HEAT' ? '895 W/m² (भीषण धूप)' : '820 W/m² (प्रखर दोपहर)',
      solarSub: simMode === 'RAIN' ? 'वर्षा संचयन मोड • पम्प बंद' : '7.5 HP सौर पम्प • ₹0 ग्रिड बिजली खर्च',
      ndviTitle: "सेंटीनेल-2 फसल स्वास्थ्य",
      ndviVal: simMode === 'HEAT' ? 'NDVI: 0.58 (जल तनाव चेतावनी)' : 'NDVI: 0.76 (उत्तम हरी फसल स्वास्थ्य)',
      ndviSub: 'बैंड 8 व बैंड 4 परावर्तन सटीक',
      waterTitle: "FAO-56 जड़ नमी संतुलन",
      waterVal: simMode === 'RAIN' ? 'Dr: 4.0 mm (पर्याप्त नमी)' : simMode === 'HEAT' ? 'Dr: 44.5 mm (सिंचाई आवश्यक)' : 'Dr: 22.4 mm (सुरक्षित नमी सीमा)',
      waterSub: simMode === 'HEAT' ? 'CWSI 0.54 • तुरंत पम्प चालू करें' : 'CWSI 0.18 • फसल सुरक्षित',
      audioScript: "किसान ऊर्जा में आपका स्वागत है। हम सौर ऊर्जा और सैटेलाइट तकनीक की मदद से आपको बताते हैं कि खेत में कब और कितना पानी देना है।"
    }
  }[lang] || {};

  // Parallax subtle scrub
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    if (imgRef.current && heroRef.current) {
      const ctx = gsap.context(() => {
        gsap.to(imgRef.current, {
          yPercent: 12,
          ease: 'none',
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 0.5
          }
        });
      }, heroRef);

      return () => ctx.revert();
    }
  }, []);

  const handleToggleVoiceStory = () => {
    if (!('speechSynthesis' in window)) {
      alert("Text-to-speech is not supported on this browser.");
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(t.audioScript);
    utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
    setIsPlayingAudio(true);
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section ref={heroRef} className="hero-cinematic">
      {/* Layer 0: Background Image (Parallax) */}
      <div className="hero-bg-layer">
        <img 
          ref={imgRef}
          src={heroImg} 
          alt="Solar panels powering irrigation in lush Indian farmland"
          loading="eager"
        />
      </div>

      {/* Layer 1: Aurora Light Overlay */}
      <div className="hero-aurora-overlay" />

      {/* Layer 2: Particles */}
      <ParticleField />

      {/* Layer 3: Gradient Scrim for Text Readability */}
      <div className="hero-scrim" />

      {/* Layer 4: Full-Width Content Container */}
      <div className="hero-content-layer" style={{
        maxWidth: '1760px',
        width: '96%',
        margin: '0 auto',
        padding: '130px 40px 90px 40px',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.25fr) minmax(420px, 1fr)',
        gap: '56px',
        alignItems: 'center'
      }}>
        {/* LEFT COLUMN: HERO HEADLINE & CALL TO ACTION */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Eyebrow Tag */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '14px',
            background: 'rgba(16, 185, 129, 0.18)',
            border: '1.5px solid rgba(16, 185, 129, 0.5)',
            borderRadius: 'var(--radius-full)',
            padding: '14px 32px',
            width: 'fit-content',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            boxShadow: '0 6px 24px rgba(16, 185, 129, 0.3)'
          }}>
            <span className="pulse-dot" style={{ width: '11px', height: '11px' }} />
            <Sparkles size={20} color="var(--primary-emerald-light)" />
            <span style={{
              fontSize: '1.08rem',
              fontWeight: 800,
              color: 'var(--primary-emerald-light)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em'
            }}>
              {t.tag}
            </span>
          </div>

          {/* Headline */}
          <div>
            <h1 style={{
              fontSize: 'clamp(3.6rem, 6.2vw, 5.8rem)',
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: '-0.04em',
              margin: 0,
              color: '#ffffff'
            }}>
              <span style={{ display: 'block' }}>{t.titleLine1}</span>
              <span style={{ display: 'block' }} className="gradient-text-aurora">{t.titleLine2}</span>
              <span style={{ display: 'block', fontSize: '0.72em', fontWeight: 700, opacity: 0.92, marginTop: '8px' }}>
                {t.titleLine3}
              </span>
            </h1>
          </div>

          {/* Description */}
          <p style={{
            fontSize: '1.38rem',
            lineHeight: 1.8,
            color: '#e2e8f0',
            maxWidth: '820px',
            margin: 0,
            fontWeight: 400
          }}>
            {t.description}
          </p>

          {/* Guaranteed Visible, Large CTA Buttons */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '18px',
            alignItems: 'center',
            paddingTop: '10px'
          }}>
            <button
              id="hero-launch-console-btn"
              onClick={onEnterConsole}
              className="btn-primary"
              style={{
                padding: '22px 46px',
                fontSize: '1.25rem',
                borderRadius: 'var(--radius-full)',
                boxShadow: '0 10px 36px rgba(16, 185, 129, 0.55)',
                letterSpacing: '-0.01em',
                fontWeight: 800
              }}
            >
              <Compass size={24} />
              <span>{t.enterConsole}</span>
              <ArrowRight size={22} />
            </button>

            <button
              onClick={() => scrollToSection('calculator-section')}
              className="btn-secondary"
              style={{
                padding: '20px 32px',
                fontSize: '1.14rem',
                borderRadius: 'var(--radius-full)',
                fontWeight: 700
              }}
            >
              <Calculator size={22} color="var(--primary-emerald)" />
              <span>{t.calcRoi}</span>
            </button>

            <button
              onClick={() => scrollToSection('satellite-scanner-section')}
              className="btn-secondary"
              style={{
                padding: '20px 32px',
                fontSize: '1.14rem',
                borderRadius: 'var(--radius-full)',
                fontWeight: 700
              }}
            >
              <Satellite size={22} color="var(--sky-blue)" />
              <span>{t.scanCanopy}</span>
            </button>

            <button
              id="hero-voice-assistant-btn"
              onClick={onOpenVoice}
              className="btn-solar"
              style={{
                padding: '20px 34px',
                fontSize: '1.14rem',
                borderRadius: 'var(--radius-full)',
                fontWeight: 800
              }}
              title="Speak directly to the agronomy assistant"
            >
              <Mic size={22} />
              <span>{t.talkVoice}</span>
            </button>

            <button
              onClick={handleToggleVoiceStory}
              className="btn-secondary"
              style={{
                padding: '18px 28px',
                fontSize: '1.05rem',
                borderRadius: 'var(--radius-full)',
                borderColor: isPlayingAudio ? 'var(--primary-emerald)' : undefined,
                background: isPlayingAudio ? 'rgba(16, 185, 129, 0.2)' : undefined,
                fontWeight: 700
              }}
              title="Listen to overview narration"
            >
              {isPlayingAudio ? <VolumeX size={22} color="#ef4444" /> : <Volume2 size={22} color="var(--solar-amber)" />}
              <span>{isPlayingAudio ? t.stopAudio : t.listenStory}</span>
            </button>
          </div>

          {/* Big Stat Counters Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '28px',
            paddingTop: '36px',
            borderTop: '1px solid rgba(255, 255, 255, 0.15)'
          }}>
            <div>
              <div className="stat-value" style={{ color: 'var(--solar-amber)', fontSize: '3.4rem', fontWeight: 900 }}>
                <AnimatedCounter end={t.stat1Val} suffix={t.stat1Suffix} />
              </div>
              <div className="stat-label" style={{ fontSize: '1.02rem', color: '#cbd5e1', fontWeight: 600 }}>{t.stat1Label}</div>
            </div>

            <div>
              <div className="stat-value" style={{ color: 'var(--primary-emerald)', fontSize: '3.4rem', fontWeight: 900 }}>
                <AnimatedCounter end={t.stat2Val} suffix={t.stat2Suffix} />
              </div>
              <div className="stat-label" style={{ fontSize: '1.02rem', color: '#cbd5e1', fontWeight: 600 }}>{t.stat2Label}</div>
            </div>

            <div>
              <div className="stat-value" style={{ color: 'var(--sky-blue)', fontSize: '3.4rem', fontWeight: 900 }}>
                <AnimatedCounter end={t.stat3Val} suffix={t.stat3Suffix} />
              </div>
              <div className="stat-label" style={{ fontSize: '1.02rem', color: '#cbd5e1', fontWeight: 600 }}>{t.stat3Label}</div>
            </div>

            <div>
              <div className="stat-value" style={{ color: '#fcd34d', fontSize: '3.4rem', fontWeight: 900 }}>
                <AnimatedCounter end={t.stat4Val} prefix={t.stat4Prefix} />
              </div>
              <div className="stat-label" style={{ fontSize: '1.02rem', color: '#cbd5e1', fontWeight: 600 }}>{t.stat4Label}</div>
            </div>
          </div>
        </div>

        {/* Right: Dimensional Photoreal Asset Frame with Layered Holographic Badges */}
        <div style={{ position: 'relative' }}>
          {/* Main Visual Box */}
          <div style={{
            position: 'relative',
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 32px 72px -16px rgba(0, 0, 0, 0.85), 0 0 40px rgba(16, 185, 129, 0.2)',
            border: '2px solid rgba(52, 211, 153, 0.35)'
          }}>
            <img 
              src={heroImg} 
              alt="Lush green Basmati rice field with solar photovoltaic panels powering automated water pump"
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
                objectFit: 'cover',
                transform: 'scale(1.02)',
                transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            />

            {/* Subtle Gradient Scrim at Bottom for High Contrast Telemetry */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, rgba(6, 18, 13, 0.1) 0%, transparent 40%, rgba(6, 18, 13, 0.95) 100%)',
              pointerEvents: 'none'
            }} />

            {/* Floating Live Badge Top Right: Solar Irradiance */}
            <div style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'rgba(6, 18, 13, 0.85)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1.5px solid rgba(245, 158, 11, 0.55)',
              borderRadius: '9999px',
              padding: '10px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)'
            }}>
              <Sun size={20} color="var(--solar-amber)" />
              <span style={{ fontSize: '0.94rem', fontWeight: 800, color: '#ffffff' }}>
                820 W/m² <span style={{ color: 'var(--solar-amber)' }}>Peak Sun</span>
              </span>
            </div>

            {/* Floating Live Badge Top Left: Sentinel-2 NDVI */}
            <div style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              background: 'rgba(6, 18, 13, 0.85)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1.5px solid rgba(16, 185, 129, 0.55)',
              borderRadius: '9999px',
              padding: '10px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)'
            }}>
              <Satellite size={19} color="var(--primary-emerald)" />
              <span style={{ fontSize: '0.94rem', fontWeight: 800, color: '#ffffff' }}>
                NDVI: <span style={{ color: '#34d399' }}>0.76 (Healthy)</span>
              </span>
            </div>

            {/* Floating Live Telemetry Cockpit at Bottom */}
            <div style={{
              position: 'absolute',
              bottom: '20px',
              left: '20px',
              right: '20px',
              padding: '20px 24px',
              background: 'rgba(8, 22, 16, 0.92)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: '16px',
              border: '1.5px solid rgba(16, 185, 129, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '14px',
              boxShadow: '0 12px 32px rgba(0, 0, 0, 0.7)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span className="pulse-dot" style={{ width: '10px', height: '10px' }} />
                <div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
                    {lang === 'hi' ? 'करनाल मॉडल एग्रो-सोलर फार्म' : 'Karnal Model Agro-Solar Field'}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#34d399', fontWeight: 600, marginTop: '2px' }}>
                    {lang === 'hi' ? 'सक्रिय सिंचाई: 5HP सौर पम्प चालू' : 'Automated Irrigation: 5HP Solar Pump Active'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  background: 'rgba(14, 165, 233, 0.18)',
                  color: '#38bdf8',
                  padding: '8px 14px',
                  borderRadius: '9999px',
                  fontSize: '0.9rem',
                  fontWeight: 800,
                  border: '1px solid rgba(14, 165, 233, 0.4)'
                }}>
                  Dr: 22.4mm
                </div>

                <div style={{
                  background: 'rgba(245, 158, 11, 0.18)',
                  color: '#fbbf24',
                  padding: '8px 14px',
                  borderRadius: '9999px',
                  fontSize: '0.9rem',
                  fontWeight: 800,
                  border: '1px solid rgba(245, 158, 11, 0.4)'
                }}>
                  {lang === 'hi' ? '₹0 ग्रिड बिल' : '₹0 Grid Cost'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Hint */}
      <div style={{
        position: 'absolute',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
        zIndex: 10,
        opacity: 0.7,
        animation: 'float 3s ease-in-out infinite'
      }}>
        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#e2e8f0', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          {t.scrollHint}
        </span>
        <ChevronDown size={20} color="var(--primary-emerald)" />
      </div>

      <style>{`
        @media (max-width: 1080px) {
          .hero-content-layer {
            grid-template-columns: 1fr !important;
            padding-top: 100px !important;
            gap: 40px !important;
          }
        }
      `}</style>
    </section>
  );
}
