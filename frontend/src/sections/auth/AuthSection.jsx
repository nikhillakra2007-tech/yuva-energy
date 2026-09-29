import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ArrowLeft, 
  User, 
  Lock, 
  Mail, 
  Volume2, 
  Sparkles, 
  CheckCircle,
  Phone,
  Compass
} from 'lucide-react';
import { api } from '../../services/api';

export default function AuthSection({ 
  onSuccess, 
  onBackToLanding, 
  lang = 'en' 
}) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const t = {
    en: {
      backBtn: "Return to Landing Page",
      cardTitle: isLogin ? "Farmer Access & Sign In" : "Register Farm Account",
      subtitle: "Secure tenant access to your field telemetry, solar scheduling, and agronomic advisories.",
      demoHeading: "Fast 1-Click Access for Farmers",
      demoSub: "No typing required. Instantly load the live Karnal Model Basmati Farm demo.",
      demoBtn: "🌱 1-Click Demo Farmer Sign In",
      orDivider: "OR ENTER CREDENTIALS",
      emailLabel: "Mobile Number or Email",
      passwordLabel: "Security Password or PIN",
      nameLabel: "Full Name (Farmer / Estate)",
      submitLogin: "Sign In to Farm Console",
      submitRegister: "Create Farm Account",
      toggleToRegister: "Don't have an account yet? Register here",
      toggleToLogin: "Already have an account? Sign in here",
      voiceGuide: "Listen Login Instructions",
      voiceText: "To get started right away without typing, click the large green Demo Farmer button. Or type your mobile number and password below."
    },
    hi: {
      backBtn: "मुख्य पृष्ठ पर वापस जाएं",
      cardTitle: isLogin ? "किसान लॉगिन व प्रवेश" : "नया खेत खाता बनाएं",
      subtitle: "अपने खेत का डेटा, सौर पंपिंग समय और वैज्ञानिक सलाह सुरक्षित देखें।",
      demoHeading: "किसानों के लिए आसान 1-क्लिक प्रवेश",
      demoSub: "टाइप करने की जरूरत नहीं। तुरंत करनाल बासमती मॉडल खेत खोलें।",
      demoBtn: "🌱 1-क्लिक किसान सीधा लॉगिन",
      orDivider: "या मोबाइल नंबर / पासवर्ड से प्रवेश करें",
      emailLabel: "मोबाइल नंबर या ईमेल",
      passwordLabel: "सुरक्षा पिन या पासवर्ड",
      nameLabel: "पूरा नाम (किसान का नाम)",
      submitLogin: "खेत डैशबोर्ड में प्रवेश करें",
      submitRegister: "नया खाता बनाएं",
      toggleToRegister: "खाता नहीं है? यहाँ नया खाता बनाएं",
      toggleToLogin: "पहले से खाता है? यहाँ लॉगिन करें",
      voiceGuide: "ऑडियो निर्देश सुनें",
      voiceText: "बिना टाइप किए तुरंत देखने के लिए बड़े हरे बटन '1-क्लिक किसान सीधा लॉगिन' पर क्लिक करें।"
    }
  }[lang] || {};

  const handleVoiceGuide = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(t.voiceText);
    utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  const handle1ClickDemo = async () => {
    setLoading(true);
    setError('');
    try {
      let res;
      try {
        res = await api.login({ email: 'farmer@example.com', password: 'Password123!' });
      } catch {
        res = await api.register({
          email: 'farmer@example.com',
          password: 'Password123!',
          full_name: 'Rajesh Kumar (Karnal)'
        });
      }
      localStorage.setItem('yuva_token', res.access_token);
      localStorage.setItem('yuva_user', JSON.stringify(res.user));
      onSuccess(res.user);
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let res;
      if (isLogin) {
        res = await api.login({ email, password });
      } else {
        res = await api.register({ email, password, full_name: fullName });
      }
      localStorage.setItem('yuva_token', res.access_token);
      localStorage.setItem('yuva_user', JSON.stringify(res.user));
      onSuccess(res.user);
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section style={{
      maxWidth: '680px',
      margin: '40px auto 80px auto',
      padding: '0 24px'
    }}>
      {/* Reverse Transition: Back to Landing Page */}
      <button
        onClick={onBackToLanding}
        className="btn-secondary"
        style={{
          marginBottom: '28px',
          padding: '10px 20px',
          fontSize: '0.95rem'
        }}
      >
        <ArrowLeft size={18} />
        <span>{t.backBtn}</span>
      </button>

      {/* Main Auth Card with Generous Negative Space */}
      <div className="glass-panel" style={{ padding: '44px 36px' }}>
        {/* Header & Voice Guide */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '1.9rem', fontWeight: 800, marginBottom: '8px' }}>
              {t.cardTitle}
            </h2>
            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
              {t.subtitle}
            </p>
          </div>

          <button
            type="button"
            onClick={handleVoiceGuide}
            className="btn-secondary"
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
            title="Listen to login instructions"
          >
            <Volume2 size={16} color="var(--solar-amber)" />
            <span>{t.voiceGuide}</span>
          </button>
        </div>

        {/* 1-Click Demo Login Highlight Card */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.18) 0%, rgba(11, 31, 22, 0.9) 100%)',
          border: '1.5px solid var(--primary-emerald)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          marginBottom: '32px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <Sparkles size={20} color="var(--primary-emerald-light)" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff' }}>
              {t.demoHeading}
            </h3>
          </div>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            {t.demoSub}
          </p>

          <button
            id="auth-demo-farmer-btn"
            onClick={handle1ClickDemo}
            disabled={loading}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '16px',
              fontSize: '1.1rem',
              borderRadius: 'var(--radius-md)'
            }}
          >
            <span>{loading ? 'Entering...' : t.demoBtn}</span>
            <Compass size={18} />
          </button>
        </div>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          margin: '28px 0',
          color: 'var(--text-tertiary)',
          fontSize: '0.8rem',
          fontWeight: 700,
          letterSpacing: '0.08em'
        }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
          <span>{t.orDivider}</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#f87171',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            marginBottom: '24px',
            fontSize: '0.95rem'
          }}>
            {error}
          </div>
        )}

        {/* Standard Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {!isLogin && (
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>
                {t.nameLabel}
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Gurpreet Singh"
                className="input-field"
              />
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>
              {t.emailLabel}
            </label>
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. 9876543210 or farmer@example.com"
              className="input-field"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>
              {t.passwordLabel}
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input-field"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-secondary"
            style={{
              padding: '14px',
              fontSize: '1.05rem',
              fontWeight: 700,
              marginTop: '8px'
            }}
          >
            <Lock size={16} />
            <span>{loading ? 'Verifying...' : (isLogin ? t.submitLogin : t.submitRegister)}</span>
          </button>
        </form>

        {/* Toggle Mode */}
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <button
            type="button"
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--primary-emerald-light)',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {isLogin ? t.toggleToRegister : t.toggleToLogin}
          </button>
        </div>
      </div>
    </section>
  );
}
