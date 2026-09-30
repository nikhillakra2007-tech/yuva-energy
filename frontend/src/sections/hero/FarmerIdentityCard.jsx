import React from 'react';
import { 
  User, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  Zap, 
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HelpCircle,
  LogOut,
  Calculator,
  Droplets,
  Sun
} from 'lucide-react';
import { DEMO_PROFILES } from '../../services/api';

export default function FarmerIdentityCard({
  user,
  field,
  weather,
  waterBalance,
  lang = 'en',
  onOpenScientificModal,
  onLogout
}) {
  // Lock strictly to the selected user profile - no state switching inside the dashboard!
  const currentProfile = DEMO_PROFILES.find(p => p.id === user?.id) || user || DEMO_PROFILES[0];
  const isAdmin = currentProfile?.role === 'ADMIN' || user?.role === 'ADMIN';

  const t = {
    en: {
      accountBadge: isAdmin ? "Central Agronomy Admin Console" : "Verified Farmer Account",
      stateLabel: "State & District",
      phoneLabel: "Registered Mobile",
      farmLabel: "Estate / Farm Name",
      pumpLabel: "Solar Irrigation System",
      tariffLabel: "Annual Tariff Offset",
      switchNotice: "Logged in as this verified farm. To inspect a different state or farmer, sign out to access the profile selector.",
      switchBtn: "Switch Profile / Sign Out",
      safetyTitle: "Farm Operation & Safety Precautions Guide",
      safetySub: "Daily operational instructions to protect crop health, preserve groundwater, and eliminate grid electricity costs:",
      doTitle: "✅ What To Do Today (Recommended)",
      do1: "Run 5.0 HP Solar Pump between 11:30 AM – 1:30 PM (Peak Solar Generation, ₹0 Grid Cost).",
      do2: "Maintain root zone moisture above RAW threshold (38.4 mm) for optimal stomatal transpiration.",
      do3: "Inspect drip line lateral filters before commencing the solar pumping cycle.",
      dontTitle: "⛔ What NOT To Do (Prohibited & Cutoffs)",
      dont1: "Do NOT pump after 3:45 PM: Avoid Discom peak grid surcharge hours (₹8.20/kWh).",
      dont2: "Do NOT bypass dry-run protection sensor: Impeller damage risk if borehole drops below suction level.",
      dont3: "Do NOT exceed daily extraction quota (45,000 L/day) to prevent local water table drawdown.",
      safetyStatusLabel: "Operational Safety Systems Active:",
      gfciActive: "Ground Fault Interrupter: ARMED",
      dryRunActive: "Thermal Dry-Run Cutoff: ACTIVE",
      openScientificBtn: "🔬 View Full Scientific Calculations & Telemetry Simulator"
    },
    hi: {
      accountBadge: isAdmin ? "केंद्रीय कृषि व ग्रिड प्रशासक कंसोल" : "सत्यापित किसान खाता",
      stateLabel: "राज्य व जिला",
      phoneLabel: "पंजीकृत मोबाइल",
      farmLabel: "खेत व फार्म का नाम",
      pumpLabel: "सौर पम्प प्रणाली",
      tariffLabel: "सालाना बिजली बचत",
      switchNotice: "आप इस सत्यापित खेत में लॉग इन हैं। किसी अन्य राज्य या किसान को देखने के लिए प्रोफाइल बदलें / लॉगआउट करें।",
      switchBtn: "प्रोफाइल बदलें / लॉगआउट",
      safetyTitle: "खेत संचालन व सुरक्षा सावधानियां गाइड",
      safetySub: "फसल स्वास्थ्य सुरक्षा, भूजल संरक्षण और शून्य बिजली बिल के लिए दैनिक निर्देश:",
      doTitle: "✅ आज क्या करें (अनुशंसित कार्य)",
      do1: "सुबह 11:30 से दोपहर 1:30 के बीच 5.0 HP सौर पम्प चलाएं (सर्वश्रेष्ठ धूप, ₹0 बिजली खर्च)।",
      do2: "जड़ों में नमी की मात्रा हमेशा 38.4 mm (RAW सीमा) से ऊपर बनाए रखें।",
      do3: "पम्प चलाने से पहले ड्रिप लाइन व फिल्टर की जांच अवश्य करें।",
      dontTitle: "⛔ क्या बिल्कुल न करें (वर्जित व सुरक्षा प्रतिबंध)",
      dont1: "दोपहर 3:45 के बाद पम्प न चलाएं: शाम के महंगे ग्रिड बिजली शुल्क (₹8.20/यूनिट) से बचें।",
      dont2: "ड्राई-रन सेंसर को कभी बायपास न करें: पानी कम होने पर पम्प जलने का खतरा रहता है।",
      dont3: "दैनिक जल निकासी सीमा (45,000 लीटर/दिन) से अधिक पानी न निकालें ताकि भूजल सुरक्षित रहे।",
      safetyStatusLabel: "सक्रिय सुरक्षा प्रणालियां:",
      gfciActive: "अर्थ फॉल्ट प्रोटेक्शन: सक्रिय",
      dryRunActive: "ड्राई-रन कटऑफ सेंसर: चालू",
      openScientificBtn: "🔬 विस्तृत वैज्ञानिक गणना व मौसम सिमुलेटर देखें"
    }
  }[lang] || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '32px' }}>
      {/* =========================================================================
          SECTION 1: VERIFIED FARMER PROFILE (Spacious, Crisp ScrapSetu Light Aesthetic)
          ========================================================================= */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1.5px solid var(--border-card)',
        borderRadius: 'var(--radius-xl)',
        padding: '30px 34px',
        boxShadow: 'var(--shadow-card)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px',
          paddingBottom: '22px',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          {/* Avatar & Farmer Details */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '18px',
              background: isAdmin 
                ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' 
                : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.12)',
              flexShrink: 0
            }}>
              {currentProfile.avatar || '👨‍🌾'}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span className="pulse-dot" style={{ background: isAdmin ? 'var(--solar-amber)' : 'var(--primary-emerald)' }} />
                <span style={{
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  color: isAdmin ? 'var(--solar-amber)' : 'var(--primary-emerald)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  {t.accountBadge}
                </span>
              </div>

              <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '4px' }}>
                {currentProfile.full_name}
              </h2>

              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '14px', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                <span>✉️ {currentProfile.email}</span>
                <span>•</span>
                <span>📞 {currentProfile.phone}</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Badges & Profile Exit */}
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <MapPin size={20} color="var(--primary-emerald)" />
              <div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>
                  {t.stateLabel}
                </div>
                <div style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {lang === 'hi' ? (currentProfile.stateHi || currentProfile.state) : currentProfile.state}
                </div>
              </div>
            </div>

            <div style={{
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <Zap size={20} color="var(--solar-amber)" />
              <div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>
                  {t.tariffLabel}
                </div>
                <div style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--solar-amber)' }}>
                  {currentProfile.farm?.grid_tariff_offset || '₹94,200/yr saved'}
                </div>
              </div>
            </div>

            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="btn-secondary"
                style={{ padding: '10px 16px', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                title={t.switchNotice}
              >
                <LogOut size={16} />
                <span>{t.switchBtn}</span>
              </button>
            )}
          </div>
        </div>

        {/* Farm & Solar Pump Specs Strip */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '18px',
          paddingTop: '18px'
        }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '2px' }}>
              {t.farmLabel}
            </div>
            <div style={{ fontSize: '1.02rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {currentProfile.farm?.name || 'Karnal Model Agro-Solar Estate'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '2px' }}>
              {t.pumpLabel}
            </div>
            <div style={{ fontSize: '1.02rem', fontWeight: 700, color: 'var(--primary-emerald)' }}>
              {currentProfile.farm?.pump_type || '5.0 HP Submersible Solar Pump'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '2px' }}>
              Irrigation Grid
            </div>
            <div style={{ fontSize: '1.02rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              {currentProfile.farm?.irrigation_source || 'Solar Microgrid (PM-KUSUM)'}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 2: SAFETY PRECAUTIONS & ACTIONABLE GUIDE ("WHAT TO DO / WHAT NOT TO DO")
          ========================================================================= */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1.5px solid var(--border-card)',
        borderRadius: 'var(--radius-xl)',
        padding: '28px 34px',
        boxShadow: 'var(--shadow-card)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '20px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <ShieldCheck size={22} color="var(--primary-emerald)" />
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                {t.safetyTitle}
              </h3>
            </div>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', margin: 0 }}>
              {t.safetySub}
            </p>
          </div>

          {/* Button to open Deep Scientific Details Modal */}
          {onOpenScientificModal && (
            <button
              type="button"
              onClick={onOpenScientificModal}
              className="btn-primary"
              style={{ padding: '10px 20px', fontSize: '0.92rem' }}
            >
              <Calculator size={16} />
              <span>{t.openScientificBtn}</span>
            </button>
          )}
        </div>

        {/* 2-Column: What To Do vs What NOT To Do */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px',
          marginBottom: '20px'
        }}>
          {/* Card A: What To Do */}
          <div style={{
            background: 'var(--bg-surface-elevated)',
            border: '1.5px solid #a7f3d0',
            borderRadius: 'var(--radius-lg)',
            padding: '20px 24px'
          }}>
            <h4 style={{
              fontSize: '1.08rem',
              fontWeight: 800,
              color: '#047857',
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              {t.doTitle}
            </h4>

            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                <CheckCircle2 size={18} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{t.do1}</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                <CheckCircle2 size={18} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{t.do2}</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                <CheckCircle2 size={18} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{t.do3}</span>
              </li>
            </ul>
          </div>

          {/* Card B: What NOT To Do */}
          <div style={{
            background: 'var(--bg-surface-elevated)',
            border: '1.5px solid #fecaca',
            borderRadius: 'var(--radius-lg)',
            padding: '20px 24px'
          }}>
            <h4 style={{
              fontSize: '1.08rem',
              fontWeight: 800,
              color: '#b91c1c',
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              {t.dontTitle}
            </h4>

            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                <XCircle size={18} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{t.dont1}</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.95rem', color: '#dc2626', lineHeight: 1.5, fontWeight: 600 }}>
                <XCircle size={18} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{t.dont2}</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                <XCircle size={18} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{t.dont3}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Safety System Badges Strip */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          paddingTop: '14px',
          borderTop: '1px solid var(--border-subtle)',
          fontSize: '0.85rem'
        }}>
          <span style={{ color: 'var(--text-tertiary)', fontWeight: 600 }}>
            {t.safetyStatusLabel}
          </span>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            <span className="badge badge-optimal">
              <ShieldCheck size={14} />
              {t.gfciActive}
            </span>
            <span className="badge badge-optimal">
              <ShieldCheck size={14} />
              {t.dryRunActive}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
