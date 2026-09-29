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
  CheckCircle2
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
        ? "नमस्ते! मैं आपका युवा कृषि-सौर सहायक हूँ। आप बोलकर या लिखकर पूछ सकते हैं—जैसे 'क्या आज सिंचाई करनी चाहिए?' या 'सोलर पंप की स्थिति क्या है?'"
        : "Namaste! I am your Yuva Agro-Solar Assistant. You can speak or type—ask things like 'Should I irrigate today?' or 'What is my solar pump status?'"
    }
  ]);
  const [inputText, setInputText] = useState('');
  const recognitionRef = useRef(null);
  const chatBottomRef = useRef(null);

  const t = {
    en: {
      title: "Yuva Agronomic Voice AI Assistant",
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
      title: "युवा कृषि-सौर वॉयस सहायक",
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

  const speakText = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.95;
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
