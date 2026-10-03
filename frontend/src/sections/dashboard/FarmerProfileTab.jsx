import React from 'react';
import { 
  User, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  Zap, 
  Sun, 
  AlertTriangle,
  FileCheck,
  Building2,
  Sparkles
} from 'lucide-react';

export default function FarmerProfileTab({
  currentProfile,
  isPunjab,
  lang = 'en'
}) {
  const isHi = lang === 'hi';
  const name = currentProfile?.full_name || currentProfile?.name || (isPunjab ? 'Sardar Gurpreet Singh' : 'Rajesh Kumar');
  const avatar = currentProfile?.avatar || (isPunjab ? '👳‍♂️' : '👨‍🌾');
  const farmerId = currentProfile?.id 
    ? `KUSUM-${currentProfile.id.toUpperCase().replace('USER_', '')}` 
    : 'KUSUM-HR-77410';
  const phone = currentProfile?.phone || '+91 98120 44521';
  const location = currentProfile?.district 
    ? `${currentProfile.district}, ${currentProfile.state || (isPunjab ? 'Punjab' : 'Haryana')}`
    : (isPunjab ? 'Mansa, Punjab' : 'Nilokheri, Karnal, Haryana');
  const area = currentProfile?.farm?.total_area_hectares 
    ? `${(currentProfile.farm.total_area_hectares * 2.471).toFixed(1)} Acres (${currentProfile.farm.total_area_hectares} Hectares)`
    : (isPunjab ? '21.0 Acres (8.5 Hectares)' : '12.4 Acres (5.0 Hectares)');
  const pumpRating = currentProfile?.farm?.pump_type || (isPunjab ? '7.5 HP High-Discharge Solar Pump' : '5.0 HP Submersible Solar Pump');
  const discom = isPunjab ? 'PSPCL 11kV Rural Agro-Feeder' : 'DHBVN 3-Phase Dedicated AP Line';
  const kusumAppNo = isPunjab ? 'KUSUM-PB-2025-88410' : 'KUSUM-HR-2025-99214';
  const solarCapacity = isPunjab ? '12.5 kWp Polycrystalline Array' : '10.5 kWp Polycrystalline Array';
  const tariffCredit = isPunjab ? '₹3.92 / kWh Net Export Credit' : '₹3.85 / kWh Net Export Credit';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
      {/* Header Bar */}
      <div style={{
        background: '#0d181c',
        border: '1.5px solid #1a332d',
        borderRadius: '20px',
        padding: '26px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.45)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'rgba(56, 189, 248, 0.16)',
            border: '2px solid #38bdf8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 6px 20px rgba(56, 189, 248, 0.3)'
          }}>
            <User size={28} color="#38bdf8" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ffffff', margin: 0, letterSpacing: '-0.02em' }}>
              {isHi ? 'सत्यापित किसान पहचान व खाता प्रोफाइल' : 'Verified Farmer Identity & Farm Profile'}
            </h3>
            <span style={{ fontSize: '1.1rem', color: '#cbd5e1', fontWeight: 600, marginTop: '4px', display: 'block' }}>
              {isHi 
                ? 'कृषि मंत्रालय व राज्य डिस्कॉम सोलर रजिस्ट्री से डिजिटल प्रमाणित' 
                : 'Direct Linkage to Ministry of Agriculture & State Solar Discom Registry'}
            </span>
          </div>
        </div>

        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 24px',
          borderRadius: '9999px',
          background: 'rgba(16, 185, 129, 0.2)',
          border: '2px solid #10b981',
          color: '#34d399',
          fontSize: '1.05rem',
          fontWeight: 800,
          boxShadow: '0 4px 16px rgba(16, 185, 129, 0.25)'
        }}>
          <CheckCircle2 size={20} />
          <span>{isHi ? 'सत्यापित:' : 'Verified:'} {isPunjab ? 'Punjab Agriculture Dept' : 'Haryana Kisan Portal'}</span>
        </span>
      </div>

      {/* Row 1: Profile & PM-KUSUM Registration Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
        gap: '26px'
      }}>
        {/* Card 1: Farmer Identity */}
        <div style={{
          background: '#0d181c',
          border: '1.5px solid #1a332d',
          borderRadius: '20px',
          padding: '28px 32px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.45)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '26px' }}>
            <div style={{
              width: '76px',
              height: '76px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #f59e0b 0%, #10b981 100%)',
              padding: '3px',
              flexShrink: 0,
              boxShadow: '0 6px 20px rgba(16, 185, 129, 0.35)'
            }}>
              <div style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                background: '#132328',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.2rem'
              }}>
                {avatar}
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h4 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ffffff', margin: 0, letterSpacing: '-0.01em' }}>
                  {name}
                </h4>
                <CheckCircle2 size={24} color="#38bdf8" />
              </div>
              <div style={{ fontSize: '1.12rem', color: '#cbd5e1', marginTop: '6px', fontWeight: 600 }}>
                {isHi ? 'किसान पहचान ID:' : 'Farmer ID:'}{' '}
                <strong style={{ color: '#fbbf24', fontFamily: 'var(--font-mono)', fontSize: '1.22rem', fontWeight: 800 }}>
                  {farmerId}
                </strong>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <span style={{ color: '#94a3b8', fontSize: '1.12rem', fontWeight: 700 }}>
                {isHi ? 'पंजीकृत संपर्क मोबाइल:' : 'Registered Mobile:'}
              </span>
              <strong style={{ color: '#ffffff', fontSize: '1.25rem', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>
                {phone}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <span style={{ color: '#94a3b8', fontSize: '1.12rem', fontWeight: 700 }}>
                {isHi ? 'स्थान व जिला:' : 'Location / District:'}
              </span>
              <strong style={{ color: '#ffffff', fontSize: '1.22rem', fontWeight: 800 }}>
                {location}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <span style={{ color: '#94a3b8', fontSize: '1.12rem', fontWeight: 700 }}>
                {isHi ? 'कुल कृषि जोत (भूमि):' : 'Total Farmland Holding:'}
              </span>
              <strong style={{ color: '#34d399', fontSize: '1.25rem', fontWeight: 900 }}>
                {area}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <span style={{ color: '#94a3b8', fontSize: '1.12rem', fontWeight: 700 }}>
                {isHi ? 'राजस्व खतौनी / खसरा संख्या:' : 'Revenue Survey / Khatauni:'}
              </span>
              <strong style={{ color: '#ffffff', fontSize: '1.22rem', fontWeight: 800 }}>
                Plot No. 442/12 (Khasra 108/4)
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0' }}>
              <span style={{ color: '#94a3b8', fontSize: '1.12rem', fontWeight: 700 }}>
                {isHi ? 'बिजली डिस्कॉम फीडर:' : 'Electricity Discom Feeder:'}
              </span>
              <strong style={{ color: '#fbbf24', fontSize: '1.22rem', fontWeight: 800 }}>
                {discom}
              </strong>
            </div>
          </div>
        </div>

        {/* Card 2: PM-KUSUM Scheme Details */}
        <div style={{
          background: '#0d181c',
          border: '1.5px solid #1a332d',
          borderRadius: '20px',
          padding: '28px 32px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.45)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '26px', flexWrap: 'wrap', gap: '10px' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {isHi ? 'पीएम-कुसुम कंपोनेंट-सी सोलर ग्रिड कनेक्शन' : 'PM-KUSUM COMPONENT-C SUBSIDIZED SOLAR'}
            </span>
            <div style={{
              padding: '6px 18px',
              borderRadius: '9999px',
              background: 'rgba(245, 158, 11, 0.22)',
              border: '1.5px solid rgba(245, 158, 11, 0.5)',
              color: '#fbbf24',
              fontWeight: 800,
              fontSize: '1.02rem',
              boxShadow: '0 4px 14px rgba(245, 158, 11, 0.2)'
            }}>
              ✓ {isHi ? 'स्वीकृत (Sanctioned)' : 'Sanctioned & Active'}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <span style={{ color: '#94a3b8', fontSize: '1.12rem', fontWeight: 700 }}>
                {isHi ? 'स्वीकृति आवेदन संख्या:' : 'Sanction Application No.:'}
              </span>
              <strong style={{ color: '#ffffff', fontSize: '1.22rem', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>
                {kusumAppNo}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <span style={{ color: '#94a3b8', fontSize: '1.12rem', fontWeight: 700 }}>
                {isHi ? 'सोलर पम्प मोटर क्षमता:' : 'Pump Motor Rating:'}
              </span>
              <strong style={{ color: '#34d399', fontSize: '1.25rem', fontWeight: 900 }}>
                {pumpRating}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <span style={{ color: '#94a3b8', fontSize: '1.12rem', fontWeight: 700 }}>
                {isHi ? 'सोलर पैनल अरे क्षमता:' : 'Solar PV Array Capacity:'}
              </span>
              <strong style={{ color: '#fbbf24', fontSize: '1.25rem', fontWeight: 900 }}>
                {solarCapacity}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <span style={{ color: '#94a3b8', fontSize: '1.12rem', fontWeight: 700 }}>
                {isHi ? 'सब्सिडी व वित्त संरचना:' : 'Subsidy Structure:'}
              </span>
              <strong style={{ color: '#ffffff', fontSize: '1.18rem', fontWeight: 800 }}>
                60% Govt • 30% NABARD Loan • 10% Share
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0' }}>
              <span style={{ color: '#94a3b8', fontSize: '1.12rem', fontWeight: 700 }}>
                {isHi ? 'नेट मीटरिंग निर्यात दर:' : 'Net Metering Export Tariff:'}
              </span>
              <strong style={{ color: '#34d399', fontSize: '1.25rem', fontWeight: 900 }}>
                {tariffCredit}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Rural Farmer Safety & Maintenance Protocols */}
      <div style={{
        background: '#0d181c',
        border: '1.5px solid #1a332d',
        borderRadius: '20px',
        padding: '28px 32px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.45)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '22px' }}>
          <ShieldCheck size={26} color="#10b981" />
          <span style={{ fontSize: '1.18rem', fontWeight: 900, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {isHi ? 'ग्रामीण किसान सुरक्षा व सोलर रखरखाव मानक निर्देश' : 'RURAL FARMER SAFETY & SOLAR MAINTENANCE PROTOCOLS'}
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '22px'
        }}>
          {/* Protocol 1 */}
          <div style={{ background: 'rgba(0,0,0,0.35)', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '22px 24px' }}>
            <strong style={{ fontSize: '1.25rem', color: '#fbbf24', display: 'block', marginBottom: '10px', fontWeight: 800 }}>
              {isHi ? '१. सोलर पैनल की धूल सफाई' : '1. Solar Panel Dust Cleaning'}
            </strong>
            <p style={{ fontSize: '1.12rem', color: '#f1f5f9', margin: 0, lineHeight: 1.75, fontWeight: 500 }}>
              {isHi 
                ? 'हर 10-14 दिन में सुबह जल्दी नरम पानी से पैनल धोएं। दोपहर की तेज धूप में ठंडे पानी से कभी न धोएं, जिससे कांच टूटने का खतरा रहता है।'
                : 'Wash panels every 10–14 days during early morning hours using soft water. Never splash cold water onto scorching hot afternoon panels to avoid glass thermal shock.'}
            </p>
          </div>

          {/* Protocol 2 */}
          <div style={{ background: 'rgba(0,0,0,0.35)', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '22px 24px' }}>
            <strong style={{ fontSize: '1.25rem', color: '#38bdf8', display: 'block', marginBottom: '10px', fontWeight: 800 }}>
              {isHi ? '२. अर्थिंग व आकाशीय बिजली सुरक्षा' : '2. Lightning & Earthing Inspection'}
            </strong>
            <p style={{ fontSize: '1.12rem', color: '#f1f5f9', margin: 0, lineHeight: 1.75, fontWeight: 500 }}>
              {isHi
                ? 'मानसून से पहले तांबे के अर्थिंग गड्ढे की जांच करें। इन्वर्टर और मोटर को आकाशीय बिजली से सुरक्षित रखने के लिए अर्थिंग प्रतिरोध 5 ओम से नीचे रखें।'
                : 'Inspect copper earthing pit before every monsoon. Ensure grounding resistance is strictly below 5 Ohms to protect the VFD inverter from lightning strikes.'}
            </p>
          </div>

          {/* Protocol 3 */}
          <div style={{ background: 'rgba(0,0,0,0.35)', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '22px 24px' }}>
            <strong style={{ fontSize: '1.25rem', color: '#f87171', display: 'block', marginBottom: '10px', fontWeight: 800 }}>
              {isHi ? '३. ड्राई-रन व पम्प मोटर सुरक्षा' : '3. Dry-Run & Cavitation Safety'}
            </strong>
            <p style={{ fontSize: '1.12rem', color: '#f1f5f9', margin: 0, lineHeight: 1.75, fontWeight: 500 }}>
              {isHi
                ? 'ट्यूबवेल में जल स्तर गिरने पर पम्प को बिना पानी के न चलने दें। ड्राई-रन सुरक्षा सेंसर को कभी भी बायपास न करें ताकि मोटर सुरक्षित रहे।'
                : 'Ensure low-water float switch in the tubewell casing is operational. Never bypass the dry-run protection circuit to prevent pump impeller overheating.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
