import React, { useState } from 'react';
import { 
  Sun, 
  Droplets, 
  Satellite, 
  Mic, 
  Volume2, 
  VolumeX, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Compass, 
  Calculator, 
  Activity, 
  Zap, 
  Layers,
  Leaf
} from 'lucide-react';
import heroImg from '../../assets/solar_farm_irrigation.jpg';

export default function LandingHero({ 
  onEnterConsole, 
  onOpenAuth, 
  onOpenVoice,
  lang = 'en'
}) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const t = {
    en: {
      tag: "India's 1st Autonomous Solar-Agro Intelligence Setu",
      titleMain: "Sun-Powered Precision Water",
      titleSub: "for Every Indian Farmer",
      description: "Empowering rural farmers with deterministic FAO-56 Penman-Monteith hydrologic modeling, 10-meter Sentinel-2 satellite canopy monitoring, and solar microgrid pump synchronization—without complex technical jargon.",
      enterConsole: "Launch Farm Console",
      calcRoi: "Calculate Solar ROI",
      scanCanopy: "Satellite Scanner",
      signIn: "Farmer Access & Sign In",
      talkVoice: "Speak to Voice AI",
      listenStory: "Listen Platform Audio",
      stopAudio: "Stop Audio",
      stat1Val: "100%",
      stat1Label: "Daylight Solar Pumping",
      stat2Val: "35%+",
      stat2Label: "Groundwater Conserved",
      stat3Val: "10m",
      stat3Label: "Satellite Resolution",
      stat4Val: "₹0",
      stat4Label: "Peak Grid Cost",
      audioScript: "Welcome to KisanUrja. We combine solar energy and satellite intelligence to help you irrigate your fields at the exact right moment, saving water, cutting electricity bills to zero, and protecting crop health."
    },
    hi: {
      tag: "भारत का प्रथम सजीव कृषि-सौर बुद्धिमत्ता सेतु",
      titleMain: "सौर ऊर्जा और उपग्रह आधारित",
      titleSub: "सटीक सिंचाई हर किसान के लिए",
      description: "ग्रामीण किसानों के लिए वैज्ञानिक FAO-56 जल संतुलन, 10-मीटर सेंटीनेल-2 उपग्रह फसल निगरानी, और सौर पंपिंग का सीधा तालमेल। पानी और बिजली दोनों की शत-प्रतिशत बचत।",
      enterConsole: "खेत डैशबोर्ड शुरू करें",
      calcRoi: "अपनी बचत का हिसाब लगाएं",
      scanCanopy: "उपग्रह स्कैनर देखें",
      signIn: "किसान लॉगिन व खाता",
      talkVoice: "आवाज से बात करें (माइक)",
      listenStory: "बोलकर सुनाएं (ऑडियो)",
      stopAudio: "ऑडियो बंद करें",
      stat1Val: "100%",
      stat1Label: "दिन में मुफ्त सौर ऊर्जा",
      stat2Val: "35%+",
      stat2Label: "भूजल की सीधी बचत",
      stat3Val: "10m",
      stat3Label: "उपग्रह निगरानी स्तर",
      stat4Val: "₹0",
      stat4Label: "ग्रिड बिजली का खर्च",
      audioScript: "किसान ऊर्जा में आपका स्वागत है। हम सौर ऊर्जा और सैटेलाइट तकनीक की मदद से आपको बताते हैं कि खेत में कब और कितना पानी देना है, जिससे पानी और बिजली की पूरी बचत हो।"
    }
  }[lang] || {};

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
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section style={{
      position: 'relative',
      padding: '48px 24px 72px 24px',
      maxWidth: '1440px',
      margin: '0 auto',
      overflow: 'hidden'
    }}>
      {/* Background Graphic Accents */}
      <div style={{
        position: 'absolute',
        top: '-15%',
        right: '-8%',
        width: '650px',
        height: '650px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, rgba(245, 158, 11, 0.05) 45%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      {/* Main Hero Container */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '56px',
        alignItems: 'center'
      }}>
        {/* Left: Inspiring Headline & Typography */}
        <div>
          {/* Eyebrow Chip */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            borderRadius: 'var(--radius-full)',
            padding: '8px 18px',
            marginBottom: '24px',
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.2)'
          }}>
            <span className="pulse-dot" />
            <Sparkles size={16} color="var(--primary-emerald)" />
            <span style={{
              fontSize: '0.85rem',
              fontWeight: 800,
              color: 'var(--primary-emerald-light)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em'
            }}>
              {t.tag}
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2.5rem, 4.4vw, 4.0rem)',
            fontWeight: 800,
            lineHeight: 1.12,
            letterSpacing: '-0.035em',
            marginBottom: '24px'
          }}>
            {t.titleMain} <br />
            <span className="gradient-text-emerald">{t.titleSub}</span>
          </h1>

          <p style={{
            fontSize: '1.2rem',
            lineHeight: 1.75,
            color: 'var(--text-secondary)',
            marginBottom: '36px',
            maxWidth: '640px'
          }}>
            {t.description}
          </p>

          {/* Action Callout Row */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '14px',
            alignItems: 'center',
            marginBottom: '40px'
          }}>
            {/* Primary Action Button */}
            <button
              id="hero-launch-console-btn"
              onClick={onEnterConsole}
              className="btn-primary"
              style={{
                padding: '16px 32px',
                fontSize: '1.08rem',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35)'
              }}
            >
              <Compass size={20} />
              <span>{t.enterConsole}</span>
              <ArrowRight size={18} />
            </button>

            {/* Quick jump to calculator */}
            <button
              onClick={() => scrollToSection('calculator-section')}
              className="btn-secondary"
              style={{
                padding: '16px 22px',
                fontSize: '1rem',
                borderRadius: 'var(--radius-md)'
              }}
            >
              <Calculator size={18} color="var(--primary-emerald)" />
              <span>{t.calcRoi}</span>
            </button>

            {/* Quick jump to satellite scanner */}
            <button
              onClick={() => scrollToSection('satellite-scanner-section')}
              className="btn-secondary"
              style={{
                padding: '16px 20px',
                fontSize: '1rem',
                borderRadius: 'var(--radius-md)'
              }}
            >
              <Satellite size={18} color="var(--sky-blue)" />
              <span>{t.scanCanopy}</span>
            </button>

            {/* Voice button */}
            <button
              id="hero-voice-assistant-btn"
              onClick={onOpenVoice}
              className="btn-solar"
              style={{
                padding: '16px 24px',
                fontSize: '1rem',
                borderRadius: 'var(--radius-md)'
              }}
              title="Speak directly to the agronomy assistant"
            >
              <Mic size={18} />
              <span>{t.talkVoice}</span>
            </button>

            {/* Speech story narration */}
            <button
              onClick={handleToggleVoiceStory}
              className="btn-secondary"
              style={{
                padding: '16px 18px',
                fontSize: '0.95rem',
                borderRadius: 'var(--radius-md)',
                borderColor: isPlayingAudio ? 'var(--primary-emerald)' : 'var(--border-subtle)',
                background: isPlayingAudio ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-surface-elevated)'
              }}
              title="Listen to overview narration"
            >
              {isPlayingAudio ? <VolumeX size={18} color="#ef4444" /> : <Volume2 size={18} color="var(--solar-amber)" />}
              <span>{isPlayingAudio ? t.stopAudio : t.listenStory}</span>
            </button>
          </div>

          {/* Real Metrics Banner */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '16px',
            paddingTop: '28px',
            borderTop: '1px solid var(--border-subtle)'
          }}>
            <div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--solar-amber)', fontFamily: 'var(--font-heading)' }}>
                {t.stat1Val}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                {t.stat1Label}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--primary-emerald)', fontFamily: 'var(--font-heading)' }}>
                {t.stat2Val}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                {t.stat2Label}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--sky-blue)', fontFamily: 'var(--font-heading)' }}>
                {t.stat3Val}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                {t.stat3Label}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#fcd34d', fontFamily: 'var(--font-heading)' }}>
                {t.stat4Val}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                {t.stat4Label}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Dimensional Photoreal Asset Frame with Layered Holographic Badges */}
        <div style={{ position: 'relative' }}>
          {/* Main Visual Box */}
          <div style={{
            position: 'relative',
            borderRadius: 'var(--radius-xl)',
            overflow: 'hidden',
            boxShadow: '0 32px 72px -16px rgba(0, 0, 0, 0.85)',
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
              border: '1px solid rgba(245, 158, 11, 0.45)',
              borderRadius: 'var(--radius-full)',
              padding: '8px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)'
            }}>
              <Sun size={18} color="var(--solar-amber)" />
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#ffffff' }}>
                680 W/m² <span style={{ color: 'var(--solar-amber)' }}>Peak Sun</span>
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
              border: '1px solid rgba(16, 185, 129, 0.45)',
              borderRadius: 'var(--radius-full)',
              padding: '8px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)'
            }}>
              <Satellite size={16} color="var(--primary-emerald)" />
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#ffffff' }}>
                NDVI: <span style={{ color: 'var(--primary-emerald-light)' }}>0.76 (Healthy)</span>
              </span>
            </div>

            {/* Floating Live Telemetry Cockpit at Bottom */}
            <div style={{
              position: 'absolute',
              bottom: '20px',
              left: '20px',
              right: '20px',
              padding: '18px 22px',
              background: 'rgba(8, 22, 16, 0.92)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--border-active)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '14px',
              boxShadow: '0 12px 32px rgba(0, 0, 0, 0.7)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="pulse-dot" />
                <div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#ffffff' }}>
                    {lang === 'hi' ? 'करनाल मॉडल एग्रो-सोलर फार्म' : 'Karnal Model Agro-Solar Field'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--primary-emerald-light)', fontWeight: 600 }}>
                    {lang === 'hi' ? 'सक्रिय सिंचाई: 5HP सौर पम्प चालू' : 'Automated Irrigation: 5HP Solar Pump Active'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  background: 'rgba(14, 165, 233, 0.15)',
                  color: 'var(--sky-blue)',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  border: '1px solid rgba(14, 165, 233, 0.3)'
                }}>
                  Dr: 22.4mm
                </div>

                <div style={{
                  background: 'rgba(245, 158, 11, 0.15)',
                  color: 'var(--solar-amber)',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  border: '1px solid var(--border-solar)'
                }}>
                  {lang === 'hi' ? '₹0 ग्रिड बिल' : '₹0 Grid Cost'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
