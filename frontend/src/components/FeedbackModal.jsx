import React, { useState } from 'react';
import { X, CheckCircle, ThumbsUp, ThumbsDown, MessageSquare, Clock } from 'lucide-react';
import { api } from '../services/api';

export default function FeedbackModal({ recommendation, isOpen, onClose, onSuccess, lang = 'en' }) {
  const [actionTaken, setActionTaken] = useState('FOLLOWED_EXACTLY');
  const [actualDuration, setActualDuration] = useState(
    recommendation?.recommended_duration_minutes || 60
  );
  const [rating, setRating] = useState(5);
  const [comments, setComments] = useState('');
  const [rejectionCode, setRejectionCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !recommendation) return null;

  const t = {
    en: {
      title: "Farmer Advisory Feedback",
      subtitle: "Your real-world feedback continuously trains our local agronomic engine.",
      actionLabel: "Action Taken",
      followed: "Followed Exactly as Recommended",
      partial: "Followed Partially (Adjusted Timing / Duration)",
      deferred: "Deferred to a Later Time",
      rejectedDisagreed: "Rejected: Disagreed with Agronomic Advice",
      rejectedInfra: "Rejected: Infrastructure Issue (Pump/Canal/Power)",
      durationLabel: "Actual Pumping Duration (Minutes)",
      ratingLabel: "Advice Helpfulness Rating (1 to 5)",
      commentsLabel: "Farmer Notes / Observations (Optional)",
      submit: "Submit Verified Feedback",
      submitting: "Recording in Audit Trail...",
      close: "Cancel"
    },
    hi: {
      title: "किसान प्रतिक्रिया एवं सत्यापन",
      subtitle: "आपकी वास्तविक प्रतिक्रिया हमारे स्थानीय कृषि विज्ञान मॉडल को और अधिक सटीक बनाती है।",
      actionLabel: "आपके द्वारा की गई कार्रवाई",
      followed: "सलाह के अनुसार पूरी तरह सिंचाई की",
      partial: "आंशिक रूप से पालन किया (समय या अवधि में बदलाव)",
      deferred: "सिंचाई बाद के समय के लिए टाल दी",
      rejectedDisagreed: "अस्वीकार: सलाह से असहमत",
      rejectedInfra: "अस्वीकार: उपकरण या नहर की समस्या",
      durationLabel: "वास्तविक पम्पिंग समय (मिनट)",
      ratingLabel: "सलाह की उपयोगिता रेटिंग (1 से 5)",
      commentsLabel: "आपकी टिप्पणी / अवलोकन (वैकल्पिक)",
      submit: "प्रतिक्रिया दर्ज करें",
      submitting: "दर्ज की जा रही है...",
      close: "रद्द करें"
    }
  }[lang] || {};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await api.submitFeedback(recommendation.id, {
        action_taken: actionTaken,
        actual_irrigation_duration_minutes: parseInt(actualDuration, 10),
        feedback_rating: parseInt(rating, 10),
        farmer_comments: comments || null,
        rejection_reason_code: (actionTaken.startsWith('REJECTED')) ? (rejectionCode || 'DISAGREED_SOIL_STATUS') : null
      });

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{t.title}</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{t.subtitle}</p>
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Action Taken Select */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
              {t.actionLabel}
            </label>
            <select 
              value={actionTaken}
              onChange={(e) => setActionTaken(e.target.value)}
              className="input-field"
            >
              <option value="FOLLOWED_EXACTLY">{t.followed}</option>
              <option value="FOLLOWED_PARTIALLY">{t.partial}</option>
              <option value="DEFERRED">{t.deferred}</option>
              <option value="REJECTED_DISAGREED">{t.rejectedDisagreed}</option>
              <option value="REJECTED_INFRA_ISSUE">{t.rejectedInfra}</option>
            </select>
          </div>

          {/* Actual Duration */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
              {t.durationLabel}
            </label>
            <input 
              type="number"
              min="0"
              max="1440"
              value={actualDuration}
              onChange={(e) => setActualDuration(e.target.value)}
              className="input-field"
            />
          </div>

          {/* Rating */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
              {t.ratingLabel}
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: 'var(--radius-sm)',
                    border: rating >= star ? '1px solid var(--solar-amber)' : '1px solid var(--border-subtle)',
                    background: rating >= star ? 'rgba(245, 158, 11, 0.2)' : 'var(--bg-surface-elevated)',
                    color: rating >= star ? 'var(--solar-amber)' : 'var(--text-secondary)',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  ★ {star}
                </button>
              ))}
            </div>
          </div>

          {/* Comments */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
              {t.commentsLabel}
            </label>
            <textarea 
              rows="3"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="e.g. Irrigated early morning before grid trip; soil moisture was indeed low."
              className="input-field"
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <button 
              type="button" 
              onClick={onClose}
              className="btn-secondary"
            >
              {t.close}
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="btn-primary"
            >
              <CheckCircle size={16} />
              {isSubmitting ? t.submitting : t.submit}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
