import { useState } from 'react';
import { submitInquiry } from '../lib/api';
import Reveal from '../components/Reveal';

export default function EnquirePage() {
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

  const setField = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors((err) => ({ ...err, [field]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Please enter your name';
    if (!form.email.trim()) e.email = 'Please enter your email';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Please enter a valid email';
    if (form.phone && !/^[+\d][\d\s-]{6,14}$/.test(form.phone)) e.phone = 'Please enter a valid phone number';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await submitInquiry({ ...form, artifactId: null, artifactName: null });
      setDone(true);
    } catch {
      setErrors({ _form: 'Something went wrong while submitting. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <section className="page-hero page-hero--short">
        <div className="page-hero__overlay" />
        <div className="container page-hero__content">
          <span className="eyebrow eyebrow--onhero">Enquire</span>
          <h1 className="page-hero__title">Begin the conversation</h1>
          <p className="page-hero__sub">
            Tell us what you are looking for, and our team will be in touch.
          </p>
        </div>
      </section>

      <section className="enquire-page section-pad">
        <div className="container enquire-page__grid">
          <Reveal className="enquire-page__info">
            <span className="eyebrow eyebrow--left">How it works</span>
            <h2 className="enquire-page__info-title">A personal enquiry</h2>
            <p className="enquire-page__info-text">
              Heritage artifacts are not sold like ordinary goods. Each piece may require
              discussion of availability, provenance, condition and care. When you enquire,
              a member of the Raajwarasa team personally responds.
            </p>
            <ul className="enquire-page__list">
              <li>Availability confirmation</li>
              <li>Provenance and documentation</li>
              <li>Condition and preservation</li>
              <li>Pricing and delivery discussion</li>
            </ul>
            <a
              href="https://instagram.com/raajwarasa_artifacts"
              target="_blank"
              rel="noreferrer"
              className="enquire-page__insta"
            >
              Or message us on Instagram → @raajwarasa_artifacts
            </a>
          </Reveal>

          <Reveal delay={120} className="enquire-page__form-wrap">
            {done ? (
              <div className="enquire-page__done">
                <div className="enquire-page__done-mark">
                  <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.4">
                    <path d="M4 12.5l5.2 5.2L20 6.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h2 className="enquire-page__done-title">Thank you.</h2>
                <p className="enquire-page__done-sub">Our team will get in touch with you.</p>
              </div>
            ) : (
              <form className="enquire-page__form" onSubmit={submit} noValidate>
                <div className="form-grid">
                  <div className="form-field">
                    <label htmlFor="eq-name">Name *</label>
                    <input id="eq-name" type="text" value={form.name} onChange={setField('name')} autoComplete="name" />
                    {errors.name && <span className="form-error">{errors.name}</span>}
                  </div>
                  <div className="form-field">
                    <label htmlFor="eq-email">Email *</label>
                    <input id="eq-email" type="email" value={form.email} onChange={setField('email')} autoComplete="email" />
                    {errors.email && <span className="form-error">{errors.email}</span>}
                  </div>
                  <div className="form-field">
                    <label htmlFor="eq-phone">Phone</label>
                    <input id="eq-phone" type="tel" value={form.phone} onChange={setField('phone')} autoComplete="tel" />
                    {errors.phone && <span className="form-error">{errors.phone}</span>}
                  </div>
                  <div className="form-field">
                    <label htmlFor="eq-city">City</label>
                    <input id="eq-city" type="text" value={form.city} onChange={setField('city')} />
                  </div>
                </div>
                <div className="form-field">
                  <label htmlFor="eq-message">Message</label>
                  <textarea id="eq-message" rows="5" value={form.message} onChange={setField('message')} placeholder="What would you like to know about?" />
                </div>
                <div className="form-grid">
                  <div className="form-field">
                    <label htmlFor="eq-source">How did you discover us?</label>
                    <select id="eq-source" value={form.source} onChange={setField('source')}>
                      <option>Instagram</option><option>Google</option><option>Friend / Family</option><option>Website</option><option>Other</option>
                    </select>
                  </div>
                  <div className="form-field">
                    <label htmlFor="eq-contact">Preferred contact</label>
                    <select id="eq-contact" value={form.preferredContact} onChange={setField('preferredContact')}>
                      <option>Email</option><option>Phone</option><option>WhatsApp</option>
                    </select>
                  </div>
                </div>
                {errors._form && <div className="form-error form-error--block">{errors._form}</div>}
                <button type="submit" className="btn btn--primary btn--lg enquire-page__submit" disabled={submitting}>
                  {submitting ? 'Submitting…' : 'Submit Enquiry'}
                  <span className="btn-arrow">→</span>
                </button>
              </form>
            )}
          </Reveal>
        </div>
      </section>
    </>
  );
}