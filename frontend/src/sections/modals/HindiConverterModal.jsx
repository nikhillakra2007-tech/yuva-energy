import React, { useState } from 'react';
import { 
  Languages, 
  X, 
  Copy, 
  Check, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  ArrowRightLeft,
  RotateCcw
} from 'lucide-react';

export default function HindiConverterModal({ isOpen, onClose, lang = 'en' }) {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  if (!isOpen) return null;

  // Agricultural Hinglish to Devanagari Dictionary & Replacer
  const hinglishMap = [
    { en: 'khet', hi: 'खेत' },
    { en: 'paani', hi: 'पानी' },
    { en: 'pani', hi: 'पानी' },
    { en: 'dhan', hi: 'धान' },
    { en: 'basmati', hi: 'बासमती' },
    { en: 'gehu', hi: 'गेहूं' },
    { en: 'gehun', hi: 'गेहूं' },
    { en: 'sarso', hi: 'सरसों' },
    { en: 'sarson', hi: 'सरसों' },
    { en: 'ganna', hi: 'गन्ना' },
    { en: 'kapas', hi: 'कपास' },
    { en: 'fasal', hi: 'फसल' },
    { en: 'mitti', hi: 'मिट्टी' },
    { en: 'nami', hi: 'नमी' },
    { en: 'sinchai', hi: 'सिंचाई' },
    { en: 'dhoop', hi: 'धूप' },
    { en: 'bijli', hi: 'बिजली' },
    { en: 'bijlee', hi: 'बिजली' },
    { en: 'diesel', hi: 'डीजल' },
    { en: 'bachat', hi: 'बचत' },
    { en: 'kharch', hi: 'खर्च' },
    { en: 'paisa', hi: 'रुपये' },
    { en: 'kisan', hi: 'किसान' },
    { en: 'kisanon', hi: 'किसानों' },
    { en: 'solar', hi: 'सौर ऊर्जा' },
    { en: 'pump', hi: 'पम्प' },
    { en: 'motor', hi: 'मोटर' },
    { en: 'satellite', hi: 'उपग्रह' },
    { en: 'mausam', hi: 'मौसम' },
    { en: 'barish', hi: 'बारिश' },
    { en: 'barsat', hi: 'बरसात' },
    { en: 'batao', hi: 'बताएं' },
    { en: 'kab', hi: 'कब' },
    { en: 'kitna', hi: 'कितना' },
    { en: 'kaise', hi: 'कैसे' },
    { en: 'chalu', hi: 'चालू' },
    { en: 'band', hi: 'बंद' },
    { en: 'karo', hi: 'करें' },
    { en: 'kare', hi: 'करें' },
    { en: 'haryana', hi: 'हरियाणा' },
    { en: 'punjab', hi: 'पंजाब' },
    { en: 'rajasthan', hi: 'राजस्थान' },
    { en: 'uttar pradesh', hi: 'उत्तर प्रदेश' },
    { en: 'karnal', hi: 'करनाल' },
    { en: 'ludhiana', hi: 'लुधियाना' },
    { en: 'meerut', hi: 'मेरठ' },
    { en: 'kota', hi: 'कोटा' }
  ];

  const handleConvert = (text) => {
    setInputText(text);
    if (!text.trim()) {
      setOutputText('');
      return;
    }

    let converted = text;
    // Replace whole words from Hinglish agricultural dictionary
    hinglishMap.forEach(({ en, hi }) => {
      const regex = new RegExp(`\\b${en}\\b`, 'gi');
      converted = converted.replace(regex, hi);
    });

    setOutputText(converted);
  };

  const handleCopy = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    if (!('speechSynthesis' in window) || !outputText) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(outputText);
    utterance.lang = 'hi-IN';
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const quickPhrases = [
    { en: "khet me sinchai kab kare", label: "सिंचाई कब करें" },
    { en: "solar pump kitne baje chalaye", label: "सौर पम्प कब चलाएं" },
    { en: "mitti me kitni nami hai", label: "मिट्टी में कितनी नमी है" },
    { en: "aaj dhoop aur solar radiation kitna hai", label: "धूप व सौर ऊर्जा स्थिति" },
    { en: "barish hone wali hai kya", label: "क्या बारिश होने वाली है" }
  ];

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1100 }}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '640px', padding: '32px' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #10b981 0%, #f59e0b 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Languages size={22} color="#06120d" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff' }}>
                {lang === 'hi' ? 'हिंदी रूपांतरण व अनुवादक' : 'Hindi Transliterator & Converter'}
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {lang === 'hi' ? 'अंग्रेजी या हिंग्लिश टाइप करें और शुद्ध हिंदी में बदलें' : 'Type in Hinglish or English to convert to Hindi agricultural script'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn-secondary"
            style={{ padding: '8px', borderRadius: '50%' }}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div style={{ marginBottom: '18px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', fontWeight: 700, marginBottom: '8px' }}>
            {lang === 'hi' ? 'अक्सर पूछे जाने वाले कृषि प्रश्न:' : 'Common Agricultural Questions:'}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {quickPhrases.map((phrase, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleConvert(phrase.en)}
                style={{
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: 'var(--primary-emerald-light)',
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {phrase.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input Box */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', marginBottom: '6px' }}>
            {lang === 'hi' ? 'हिंग्लिश / अंग्रेजी में लिखें:' : 'Type in English / Hinglish:'}
          </label>
          <textarea
            value={inputText}
            onChange={(e) => handleConvert(e.target.value)}
            placeholder="e.g. khet me solar pump chalu kare ya barish ka intezar kare..."
            style={{
              width: '100%',
              height: '80px',
              background: 'rgba(11, 31, 22, 0.85)',
              border: '1.5px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
              color: '#ffffff',
              fontSize: '0.95rem',
              fontFamily: 'var(--font-body)',
              outline: 'none',
              resize: 'none'
            }}
          />
        </div>

        {/* Output Box */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-emerald-light)' }}>
              {lang === 'hi' ? 'शुद्ध हिंदी रूपांतरण:' : 'Converted Hindi Text (देवनागरी):'}
            </label>

            {outputText && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleSpeak}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--solar-amber)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
                  <span>{isSpeaking ? 'Stop' : 'Listen'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopy}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: 'transparent',
                    border: 'none',
                    color: copied ? 'var(--primary-emerald-light)' : 'var(--text-secondary)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            )}
          </div>

          <div style={{
            minHeight: '80px',
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1.5px solid var(--border-active)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 14px',
            color: '#ffffff',
            fontSize: '1.05rem',
            lineHeight: 1.6
          }}>
            {outputText || (
              <span style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>
                {lang === 'hi' ? 'यहाँ हिंदी में बदला हुआ पाठ दिखेगा...' : 'Converted Hindi text will appear here in real time...'}
              </span>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            type="button"
            onClick={() => { setInputText(''); setOutputText(''); }}
            className="btn-secondary"
            style={{ padding: '10px 18px', fontSize: '0.88rem' }}
          >
            <RotateCcw size={15} />
            <span>{lang === 'hi' ? 'साफ़ करें' : 'Clear'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="btn-primary"
            style={{ padding: '10px 22px', fontSize: '0.88rem' }}
          >
            <span>{lang === 'hi' ? 'संपन्न' : 'Done'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
