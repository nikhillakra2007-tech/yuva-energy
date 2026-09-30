import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  X, 
  Sparkles, 
  MessageSquare, 
  Send, 
  Bot, 
  User, 
  HelpCircle,
  CheckCircle2,
  Sliders,
  Settings
} from 'lucide-react';

export default function VoiceAssistant({
  isOpen,
  onClose,
  field,
  waterBalance,
  weather,
  lang = 'en'
}) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [conversation, setConversation] = useState([
    {
      sender: 'ai',
      text: lang === 'hi' 
        ? "नमस्ते! मैं आपका किसान ऊर्जा कृषि-सौर सहायक हूँ। आप बोलकर या लिखकर पूछ सकते हैं—जैसे 'क्या आज सिंचाई करनी चाहिए?' या 'सोलर पंप की स्थिति क्या है?'"
        : "Namaste! I am your KisanUrja Agro-Solar Assistant. You can speak or type—ask things like 'Should I irrigate today?' or 'What is my solar pump status?'"
    }
  ]);
  const [inputText, setInputText] = useState('');
  const recognitionRef = useRef(null);
  const chatBottomRef = useRef(null);

  const t = {
    en: {
      title: "KisanUrja Agronomic Voice AI Assistant",
      subtitle: "Speak directly in Hindi or English to consult your field's live hydrologic and solar status.",
      micStart: "Tap & Speak Query",
      micListening: "Listening... (Speak Now)",
      typePlaceholder: "Or type your question here...",
      quickTitle: "Quick Voice Queries for Farmers:",
      q1: "Should I irrigate today?",
      q2: "What is my solar pump schedule?",
      q3: "How is my Basmati crop health?",
      q4: "What is the soil moisture depletion?",
      speaking: "Speaking answer aloud...",
      close: "Close Voice Assistant"
    },
    hi: {
      title: "किसान ऊर्जा कृषि-सौर वॉयस सहायक",
      subtitle: "माइक दबाकर बोलें—सिंचाई, सौर ऊर्जा और फसल स्वास्थ्य की सजीव जानकारी प्राप्त करें।",
      micStart: "माइक दबाएं और बोलें",
      micListening: "सुन रहा हूँ... (कृपया बोलें)",
      typePlaceholder: "या यहाँ अपना सवाल लिखें...",
      quickTitle: "किसानों के त्वरित प्रश्न:",
      q1: "क्या आज सिंचाई करनी चाहिए?",
      q2: "सोलर पंप चलाने का सही समय क्या है?",
      q3: "फसल का स्वास्थ्य (NDVI) कैसा है?",
      q4: "मिट्टी में पानी की कितनी कमी है?",
      speaking: "आवाज में बोलकर बता रहा हूँ...",
      close: "सहायक बंद करें"
    }
  }[lang] || {};

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  // Setup Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        handleUserQuery(text);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [lang, waterBalance, weather, field]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported on this browser. You can type your question below.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      try {
        recognitionRef.current.start();
      } catch {
        recognitionRef.current.stop();
        setTimeout(() => recognitionRef.current.start(), 200);
      }
    }
  };

  const [voices, setVoices] = useState([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState(() => localStorage.getItem('kisanurja_voice_uri') || '');
  const [speechRate, setSpeechRate] = useState(() => parseFloat(localStorage.getItem('kisanurja_voice_rate')) || 0.95);
  const [speechPitch, setSpeechPitch] = useState(() => parseFloat(localStorage.getItem('kisanurja_voice_pitch')) || 1.0);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);

  // Load available speech synthesis voices
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;

    const populateVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      if (allVoices && allVoices.length > 0) {
        setVoices(allVoices);
        const saved = localStorage.getItem('kisanurja_voice_uri');
        if (saved && allVoices.some(v => v.voiceURI === saved)) {
          setSelectedVoiceURI(saved);
        } else {
          // Find closest matching voice for Hindi or English
          const matched = allVoices.find(v => 
            lang === 'hi' 
              ? (v.lang.toLowerCase().includes('hi') || v.name.toLowerCase().includes('hindi')) 
              : (v.lang.toLowerCase().includes('in') || v.lang.toLowerCase().includes('en-gb') || v.lang.toLowerCase().includes('en-us'))
          ) || allVoices[0];
          if (matched) setSelectedVoiceURI(matched.voiceURI);
        }
      }
    };

    populateVoices();
    window.speechSynthesis.onvoiceschanged = populateVoices;
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [lang]);

  const handleVoiceChange = (uri) => {
    setSelectedVoiceURI(uri);
    localStorage.setItem('kisanurja_voice_uri', uri);
  };

  const handleRateChange = (newRate) => {
    setSpeechRate(newRate);
    localStorage.setItem('kisanurja_voice_rate', newRate.toString());
  };

  const handlePitchChange = (newPitch) => {
    setSpeechPitch(newPitch);
    localStorage.setItem('kisanurja_voice_pitch', newPitch.toString());
  };

  const testCurrentVoice = () => {
    const testPhrase = lang === 'hi'
      ? "नमस्ते! किसान ऊर्जा में आपका स्वागत है। आपकी फसल और सिंचाई सुरक्षित है।"
      : "Hello! Welcome to KisanUrja. Your crop hydrologic balance and solar pumps are running smoothly.";
    speakText(testPhrase);
  };

  const speakText = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Attach selected voice
    if (voices.length > 0) {
      const currentVoice = voices.find(v => v.voiceURI === selectedVoiceURI);
      if (currentVoice) {
        utterance.voice = currentVoice;
        utterance.lang = currentVoice.lang;
      } else {
        utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
      }
    } else {
      utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
    }

    utterance.rate = speechRate;
    utterance.pitch = speechPitch;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleUserQuery = (query) => {
    if (!query || !query.trim()) return;

    // Append user query
    setConversation(prev => [...prev, { sender: 'user', text: query }]);
    setIsListening(false);

    // Compute intelligent agronomic answer based on field metrics
    const qLower = query.toLowerCase();
    const dr = waterBalance?.depletion_dr_mm != null ? waterBalance.depletion_dr_mm : 22.4;
    const raw = waterBalance?.raw_mm != null ? waterBalance.raw_mm : 38.4;
    const solarWatts = weather?.solar_radiation_w_m2 != null ? Math.round(weather.solar_radiation_w_m2) : 680;
    const cropName = field?.crop_name || 'Basmati Rice';

    let answer = "";

    if (qLower.includes('irrigate') || qLower.includes('पानी') || qLower.includes('सिंचाई') || qLower.includes('water')) {
      if (dr >= raw) {
        answer = lang === 'hi'
          ? `आपके ${cropName} खेत में जड़ क्षेत्र का जल स्तर (Dr = ${dr.toFixed(1)} मिमी) क्रांतिक सीमा (RAW = ${raw.toFixed(1)} मिमी) से कम हो गया है। आज सौर ऊर्जा से 45 मिमी सिंचाई करने की सख्त सलाह दी जाती है।`
          : `For your ${cropName} plot, root zone depletion (Dr = ${dr.toFixed(1)} mm) has crossed the readily available water limit (RAW = ${raw.toFixed(1)} mm). Immediate irrigation of 45 mm during peak solar hours is recommended today.`;
      } else {
        const daysRemaining = Math.max(1, Math.round((raw - dr) / 4.6));
        answer = lang === 'hi'
          ? `मिट्टी में नमी अभी पर्याप्त है (Dr = ${dr.toFixed(1)} मिमी, सीमा = ${raw.toFixed(1)} मिमी)। आपको अगले ${daysRemaining} दिन तक सिंचाई करने की आवश्यकता नहीं है। इससे भूजल और बिजली दोनों की बचत हो रही है।`
          : `Soil moisture in the root zone is currently optimal (Dr = ${dr.toFixed(1)} mm vs RAW threshold = ${raw.toFixed(1)} mm). No irrigation is required for approximately ${daysRemaining} more days. You are saving water and energy.`;
      }
    } else if (qLower.includes('solar') || qLower.includes('सोलर') || qLower.includes('पंप') || qLower.includes('pump')) {
      answer = lang === 'hi'
        ? `वर्तमान सौर विकिरण ${solarWatts} वॉट प्रति वर्ग मीटर है। सौर पंप चलाने का सबसे उत्तम समय सुबह 10:30 से दोपहर 03:45 बजे तक है। इस समय ग्रिड बिजली का खर्च ₹0 रहेगा।`
        : `Current solar irradiance is ${solarWatts} W/m². The optimal daylight solar pumping window is active between 10:30 AM and 03:45 PM with zero grid tariff surcharges.`;
    } else if (qLower.includes('health') || qLower.includes('ndvi') || qLower.includes('स्वास्थ्य') || qLower.includes('फसल')) {
      answer = lang === 'hi'
        ? `सेंटीनेल-2 उपग्रह के अनुसार आपकी ${cropName} फसल का स्वास्थ्य सूचकांक (NDVI) 0.76 है, जो स्वस्थ हरी पत्तियों और मजबूत फसल विकास को दर्शाता है। फसल में कोई गंभीर तनाव नहीं है।`
        : `Sentinel-2 multispectral observations indicate a healthy crop canopy with an NDVI of 0.76 for your ${cropName}. Photosynthetic vigor is robust and uniform across the polygon.`;
    } else {
      answer = lang === 'hi'
        ? `आपके खेत '${field?.name || "करनाल बासमती"}' का मौसम सामान्य है। परिवेशी तापमान 29°C और सौर उत्पादन स्थिर है। क्या आप जल संतुलन या सौर पंप का समय जानना चाहते हैं?`
        : `Your field '${field?.name || "Karnal Basmati"}' telemetry is synchronized. Ambient temperature is 29°C and solar irradiance is strong. Would you like details on root zone water depletion or the solar pump window?`;
    }

    setTimeout(() => {
      setConversation(prev => [...prev, { sender: 'ai', text: answer }]);
      speakText(answer);
    }, 400);
  };

  const handleSendText = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const query = inputText;
    setInputText('');
    handleUserQuery(query);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '720px', padding: '36px' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Sparkles size={20} color="var(--solar-amber)" />
              <h3 style={{ fontSize: '1.45rem', fontWeight: 800 }}>
                {t.title}
              </h3>
            </div>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
              {t.subtitle}
            </p>
          </div>

          <button
            onClick={() => {
              if ('speechSynthesis' in window) window.speechSynthesis.cancel();
              onClose();
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '6px'
            }}
            title={t.close}
          >
            <X size={24} />
          </button>
        </div>

        {/* Voice Changer & Audio Settings Bar */}
        <div style={{
          marginBottom: '16px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '10px 14px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Volume2 size={18} color="var(--primary-emerald)" />
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {lang === 'hi' ? 'आवाज व उच्चारण सेटिंग्स' : 'Voice Persona & Speech Settings'}
              </span>
              <span style={{
                fontSize: '0.74rem',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(16, 185, 129, 0.15)',
                color: 'var(--primary-emerald-light)',
                fontWeight: 600
              }}>
                {voices.length > 0 ? `${voices.length} Voices Available` : 'Browser Synthesizer'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={testCurrentVoice}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid rgba(245, 158, 11, 0.4)',
                  color: '#fbbf24',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <Volume2 size={14} />
                <span>{lang === 'hi' ? 'आवाज सुनें (Test)' : 'Test Voice'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowVoiceSettings(prev => !prev)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: showVoiceSettings ? 'var(--primary-emerald)' : 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid var(--border-subtle)',
                  color: showVoiceSettings ? '#ffffff' : 'var(--text-secondary)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Sliders size={14} />
                <span>{showVoiceSettings ? (lang === 'hi' ? 'छुपाएं' : 'Hide') : (lang === 'hi' ? 'आवाज बदलें' : 'Change Voice')}</span>
              </button>
            </div>
          </div>

          {/* Expandable Voice Customization Drawer */}
          {showVoiceSettings && (
            <div style={{
              marginTop: '12px',
              paddingTop: '12px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {/* Voice Selector Dropdown */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
                  {lang === 'hi' ? 'सिस्टम में उपलब्ध आवाज चुनें:' : 'Select Speech Synthesis Voice:'}
                </label>
                <select
                  value={selectedVoiceURI}
                  onChange={(e) => handleVoiceChange(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-card)',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem',
                    fontFamily: 'inherit',
                    outline: 'none'
                  }}
                >
                  {voices.map((v, idx) => (
                    <option key={idx} value={v.voiceURI}>
                      {v.name} ({v.lang}) {v.default ? ' [Default]' : ''}
                    </option>
                  ))}
                  {voices.length === 0 && (
                    <option value="">Default OS Synthesis Voice</option>
                  )}
                </select>
              </div>

              {/* Speed Rate & Pitch Controls */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px'
              }}>
                {/* Speech Speed */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    <span>{lang === 'hi' ? 'बोलने की गति (Speed)' : 'Speech Rate'}</span>
                    <strong style={{ color: 'var(--primary-emerald-light)' }}>{speechRate}x</strong>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {[
                      { label: lang === 'hi' ? 'धीमी (0.8x)' : 'Slow (0.8x)', val: 0.8 },
                      { label: lang === 'hi' ? 'सामान्य (0.95x)' : 'Normal (0.95x)', val: 0.95 },
                      { label: lang === 'hi' ? 'तेज (1.15x)' : 'Fast (1.15x)', val: 1.15 }
                    ].map((rate) => (
                      <button
                        key={rate.val}
                        type="button"
                        onClick={() => handleRateChange(rate.val)}
                        style={{
                          flex: 1,
                          padding: '6px 4px',
                          borderRadius: '6px',
                          border: speechRate === rate.val ? '1px solid var(--primary-emerald)' : '1px solid rgba(255, 255, 255, 0.1)',
                          background: speechRate === rate.val ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                          color: speechRate === rate.val ? 'var(--primary-emerald-light)' : 'var(--text-secondary)',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        {rate.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Speech Pitch */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    <span>{lang === 'hi' ? 'आवाज की टोन (Pitch)' : 'Voice Pitch'}</span>
                    <strong style={{ color: 'var(--solar-amber-light)' }}>{speechPitch.toFixed(1)}</strong>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {[
                      { label: lang === 'hi' ? 'गंभीर (0.9)' : 'Deep (0.9)', val: 0.9 },
                      { label: lang === 'hi' ? 'संतुलित (1.0)' : 'Natural (1.0)', val: 1.0 },
                      { label: lang === 'hi' ? 'तीखी (1.2)' : 'Bright (1.2)', val: 1.2 }
                    ].map((pitch) => (
                      <button
                        key={pitch.val}
                        type="button"
                        onClick={() => handlePitchChange(pitch.val)}
                        style={{
                          flex: 1,
                          padding: '6px 4px',
                          borderRadius: '6px',
                          border: speechPitch === pitch.val ? '1px solid var(--solar-amber)' : '1px solid rgba(255, 255, 255, 0.1)',
                          background: speechPitch === pitch.val ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                          color: speechPitch === pitch.val ? '#fbbf24' : 'var(--text-secondary)',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        {pitch.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Conversation Body */}
        <div style={{
          height: '280px',
          overflowY: 'auto',
          background: 'rgba(6, 18, 13, 0.75)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
          marginBottom: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {conversation.map((msg, i) => (
            <div 
              key={i} 
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%'
              }}
            >
              {msg.sender === 'ai' && (
                <div style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '10px',
                  background: 'rgba(16, 185, 129, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Bot size={18} color="var(--primary-emerald)" />
                </div>
              )}

              <div style={{
                background: msg.sender === 'user' ? 'var(--primary-emerald)' : 'var(--bg-surface-elevated)',
                color: msg.sender === 'user' ? '#ffffff' : 'var(--text-primary)',
                padding: '12px 18px',
                borderRadius: 'var(--radius-md)',
                fontSize: '1rem',
                lineHeight: 1.6,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)'
              }}>
                {msg.text}
              </div>

              {msg.sender === 'user' && (
                <div style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '10px',
                  background: 'rgba(245, 158, 11, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <User size={18} color="var(--solar-amber)" />
                </div>
              )}
            </div>
          ))}
          <div ref={chatBottomRef} />
        </div>

        {/* Large Tactile Microphone Button with Wave Animation */}
        <div style={{
          textAlign: 'center',
          marginBottom: '24px',
          padding: '16px',
          background: isListening ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.08)',
          border: `1.5px solid ${isListening ? '#ef4444' : 'var(--border-subtle)'}`,
          borderRadius: 'var(--radius-lg)'
        }}>
          {isListening && (
            <div className="voice-wave-container" style={{ marginBottom: '12px' }}>
              <div className="voice-wave-bar" />
              <div className="voice-wave-bar" />
              <div className="voice-wave-bar" />
              <div className="voice-wave-bar" />
              <div className="voice-wave-bar" />
            </div>
          )}

          <button
            id="voice-mic-main-btn"
            onClick={toggleListening}
            className={isListening ? "btn-solar" : "btn-primary"}
            style={{
              padding: '18px 36px',
              fontSize: '1.2rem',
              borderRadius: 'var(--radius-full)',
              background: isListening ? '#ef4444' : undefined,
              boxShadow: isListening ? '0 0 24px rgba(239, 68, 68, 0.6)' : undefined
            }}
          >
            {isListening ? <MicOff size={24} /> : <Mic size={24} />}
            <span>{isListening ? t.micListening : t.micStart}</span>
          </button>
        </div>

        {/* Quick Voice Chips */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '10px' }}>
            {t.quickTitle}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {[t.q1, t.q2, t.q3, t.q4].map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleUserQuery(q)}
                style={{
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-full)',
                  padding: '8px 14px',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'border-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary-emerald)'}
                onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
              >
                "{q}"
              </button>
            ))}
          </div>
        </div>

        {/* Text Input Fallback */}
        <form onSubmit={handleSendText} style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={t.typePlaceholder}
            className="input-field"
            style={{ flex: 1 }}
          />
          <button
            type="submit"
            className="btn-secondary"
            style={{ padding: '0 20px' }}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
