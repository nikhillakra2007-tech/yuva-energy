import React, { useState } from 'react';
import { X, Lock, Mail, User, ShieldCheck } from 'lucide-react';
import { api, setAuthToken, setCurrentUser } from '../../services/api';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, lang = 'en' }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const t = {
    en: {
      loginTitle: "Sign In to KisanUrja",
      registerTitle: "Create Farmer Account",
      subtitle: "Secure agronomic tenant access with PostgreSQL Row-Level Security.",
      nameLabel: "Full Name",
      emailLabel: "Email Address",
      pwdLabel: "Password",
      loginBtn: "Sign In",
      registerBtn: "Create Account",
      demoBtn: "Use Demo Farmer Account",
      noAccount: "Don't have an account? Sign up",
      hasAccount: "Already have an account? Sign in",
      processing: "Authenticating..."
    },
    hi: {
      loginTitle: "किसान ऊर्जा में लॉग इन करें",
      registerTitle: "नया किसान खाता बनाएं",
      subtitle: "मृदा एवं सौर डेटा के लिए सुरक्षित बहु-किरायेदार पहुंच।",
      nameLabel: "पूरा नाम",
      emailLabel: "ईमेल पता",
      pwdLabel: "पासवर्ड",
      loginBtn: "लॉग इन करें",
      registerBtn: "खाता बनाएं",
      demoBtn: "डेमो किसान खाता इस्तेमाल करें",
      noAccount: "खाता नहीं है? पंजीकरण करें",
      hasAccount: "पहले से खाता है? लॉग इन करें",
      processing: "प्रमाणीकरण हो रहा है..."
    }
  }[lang] || {};

  const handleDemoLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.login({
        email: 'farmer@example.com',
        password: 'Password123!'
      });
      setAuthToken(res.access_token);
      setCurrentUser(res.user);
      onAuthSuccess(res.user);
      onClose();
    } catch {
      try {
        const regRes = await api.register({
          email: 'farmer@example.com',
          password: 'Password123!',
          full_name: 'Rajesh Kumar'
        });
        setAuthToken(regRes.access_token);
        setCurrentUser(regRes.user);
        onAuthSuccess(regRes.user);
        onClose();
      } catch (regErr) {
        setError(regErr.message || 'Demo authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let res;
      if (isRegister) {
        res = await api.register({
          email,
          password,
          full_name: fullName
        });
      } else {
        res = await api.login({
          email,
          password
        });
      }

      setAuthToken(res.access_token);
      setCurrentUser(res.user);
      onAuthSuccess(res.user);
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '440px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
              {isRegister ? t.registerTitle : t.loginTitle}
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {t.subtitle}
            </p>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{ padding: '10px 14px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', borderRadius: 'var(--radius-sm)', color: '#f87171', fontSize: '0.85rem', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {isRegister && (
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                {t.nameLabel}
              </label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ramesh Patel"
                  className="input-field"
                  style={{ paddingLeft: '36px' }}
                />
                <User size={16} color="var(--text-secondary)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              </div>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
              {t.emailLabel}
            </label>
            <div style={{ position: 'relative' }}>
              <input 
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="farmer@example.com"
                className="input-field"
                style={{ paddingLeft: '36px' }}
              />
              <Mail size={16} color="var(--text-secondary)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
              {t.pwdLabel}
            </label>
            <div style={{ position: 'relative' }}>
              <input 
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field"
                style={{ paddingLeft: '36px' }}
              />
              <Lock size={16} color="var(--text-secondary)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', marginTop: '6px' }}
          >
            {loading ? t.processing : (isRegister ? t.registerBtn : t.loginBtn)}
          </button>

          <div style={{ textAlign: 'center', margin: '8px 0', fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
            OR
          </div>

          <button 
            type="button" 
            onClick={handleDemoLogin}
            disabled={loading}
            className="btn-secondary"
            style={{ width: '100%' }}
          >
            <ShieldCheck size={16} color="var(--primary-emerald)" />
            {t.demoBtn}
          </button>

          <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '0.82rem' }}>
            <span 
              onClick={() => { setIsRegister(!isRegister); setError(null); }}
              style={{ color: 'var(--primary-emerald)', cursor: 'pointer', textDecoration: 'underline' }}
            >
              {isRegister ? t.hasAccount : t.noAccount}
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
