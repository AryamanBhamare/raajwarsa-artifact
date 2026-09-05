import { useEffect, useMemo, useState } from 'react';
import { submitInquiry } from '../lib/api';
import { firstImage, availabilityLabel } from '../lib/utils';

const SOURCES = ['Instagram', 'Google', 'Friend / Family', 'Website', 'Other'];
const CONTACT_METHODS = ['Email', 'Phone', 'WhatsApp'];

export default function EnquiryModal({ open, artifact, onClose }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    message: '',
    source: 'Instagram',
    preferredContact: 'Email'
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (open) {
      setDone(false);
      setErrors({});
      const body = document.body;
      body.style.overflow = 'hidden';
      const onKey = (e) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', onKey);
      return () => {
        body.style.overflow = '';
        window.removeEventListener('keydown', onKey);
      };
    }
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      setForm((f) => ({ ...f, ...(artifact ? { message: artifact.name ? `I would like to know more about the ${artifact.name}.` : '' } : {}) }));
    }
  }, [open, artifact]);

  const artifactName = useMemo(() => artifact?.name || '', [artifact]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Please enter your name';
    if (!form.email.trim()) {
      e.email = 'Please enter your email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = 'Please enter a valid email';
    }
    if (form.phone && !/^[+\d][\d\s-]{6,14}$/.test(form.phone)) {
      e.phone = 'Please enter a valid phone number';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (field) => (ev) => {
    setForm((f) => ({ ...f, [field]: ev.target.value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await submitInquiry({
        ...form,
        artifactId: artifact?.id || null,
        artifactName: artifactName || null
      });
      setDone(true);
    } catch {
      setErrors({ _form: 'Something went wrong while submitting. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="enquiry" role="dialog" aria-modal="true" aria-label="Enquire about this artifact">
      <div className="enquiry__backdrop" onClick={onClose} />

      <div className="enquiry__panel">
        <button type="button" className="enquiry__close" onClick={onClose} aria-label="Close enquiry form">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.4">
            <path d="M5 5l14 14M19 5L5 19" strokeLinecap="round" />
          </svg>
        </button>

        {done ? (
          <div className="enquiry__done">
            <div className="enquiry__done-mark">
              <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" strokeWidth="1.4">
                <path d="M4 12.5l5.2 5.2L20 6.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="enquiry__done-title">Thank you.</h3>
            <p className="enquiry__done-sub">Our team will get in touch with you.</p>
            <button type="button" className="btn btn--outline btn--sm" onClick={onClose}>
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="enquiry__head">
              <span className="enquiry__eyebrow">ENQUIRE</span>
              <h3 className="enquiry__title">Enquire about this artifact</h3>
              {artifact && (
                <div className="enquiry__artifact">
                  <div className="enquiry__artifact-img">
                    <img src={firstImage(artifact)} alt={artifact.name} />
                  </div>
                  <div className="enquiry__artifact-info">
                    <span className="enquiry__artifact-name">{artifact.name}</span>
                    <span className="enquiry__artifact-meta">
                      {artifact.category?.name}
                      {artifact.availability ? ` · ${availabilityLabel(artifact.availability)}` : ''}
                    </span>
                  </div>
                </div>
              )}
              <p className="enquiry__intro">
                Share your details and we will get back to you with availability, pricing and more about this piece.
              </p>
            </div>

            <form className="enquiry__form" onSubmit={handleSubmit} noValidate>
              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="enq-name">Name *</label>
                  <input
                    id="enq-name"
                    type="text"
                    value={form.name}
                    onChange={handleChange('name')}
                    placeholder="Your full name"
                    autoComplete="name"
                  />
                  {errors.name && <span className="form-error">{errors.name}</span>}
                </div>
                <div className="form-field">
                  <label htmlFor="enq-email">Email *</label>
                  <input
                    id="enq-email"
                    type="email"
                    value={form.email}
                    onChange={handleChange('email')}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                  {errors.email && <span className="form-error">{errors.email}</span>}
                </div>
                <div className="form-field">
                  <label htmlFor="enq-phone">Phone</label>
                  <input
                    id="enq-phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange('phone')}
                    placeholder="+91 …"
                    autoComplete="tel"
                  />
                  {errors.phone && <span className="form-error">{errors.phone}</span>}
                </div>
                <div className="form-field">
                  <label htmlFor="enq-city">City</label>
                  <input
                    id="enq-city"
                    type="text"
                    value={form.city}
                    onChange={handleChange('city')}
                    placeholder="Your city"
                    autoComplete="address-level2"
                  />
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="enq-message">Message</label>
                <textarea
                  id="enq-message"
                  rows="4"
                  value={form.message}
                  onChange={handleChange('message')}
                  placeholder="Tell us what you would like to know…"
                />
              </div>

              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="enq-source">How did you discover us?</label>
                  <select id="enq-source" value={form.source} onChange={handleChange('source')}>
                    {SOURCES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="form-field">
                  <label htmlFor="enq-contact">Preferred contact method</label>
                  <select id="enq-contact" value={form.preferredContact} onChange={handleChange('preferredContact')}>
                    {CONTACT_METHODS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>

              {errors._form && <div className="form-error form-error--block">{errors._form}</div>}

              <button type="submit" className="btn btn--primary btn--lg enquiry__submit" disabled={submitting}>
                {submitting ? 'Submitting…' : 'Submit Enquiry'}
                <span className="btn-arrow">→</span>
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}