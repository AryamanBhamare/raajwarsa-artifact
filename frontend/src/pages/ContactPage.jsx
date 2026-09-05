import { useState } from 'react';
import { submitContact } from '../lib/api';
import Reveal from '../components/Reveal';
import { BRAND, whatsappUrl, mapEmbedUrl, mapLinkUrl } from '../config';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const setField = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors((err) => ({ ...err, [field]: undefined }));
  };

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim()) errs.name = 'Please enter your name';
    if (!form.email.trim()) errs.email = 'Please enter your email';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Please enter a valid email';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSubmitting(true);
    try {
      await submitContact(form);
      setDone(true);
    } catch {
      setErrors({ _form: 'Something went wrong. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <section className="page-hero page-hero--short">
        <div className="page-hero__overlay" />
        <div className="container page-hero__content">
          <span className="eyebrow eyebrow--onhero">Contact</span>
          <h1 className="page-hero__title">Get in touch</h1>
          <p className="page-hero__sub">We would be glad to hear from you.</p>
        </div>
      </section>

      <section className="contact-page section-pad">
        <div className="container">
          <Reveal className="contact-page__grid">
            <div className="contact-page__info">
              <span className="eyebrow eyebrow--left">Reach us</span>
              <h2 className="contact-page__info-title">Let's talk heritage</h2>
              <p className="contact-page__info-text">
                Whether you are curious about a piece, the collection, or heritage in general,
                we would be glad to talk.
              </p>

              <div className="contact-page__channel">
                <span className="contact-page__channel-label">Instagram</span>
                <a href={BRAND.instagramUrl} target="_blank" rel="noreferrer" className="contact-page__channel-value">
                  @{BRAND.instagramHandle}
                </a>
              </div>
              <div className="contact-page__channel">
                <span className="contact-page__channel-label">WhatsApp</span>
                <a href={whatsappUrl()} target="_blank" rel="noreferrer" className="contact-page__channel-value">
                  {BRAND.phoneDisplay}
                </a>
              </div>
              <div className="contact-page__channel">
                <span className="contact-page__channel-label">Phone</span>
                <a href={`tel:+${BRAND.whatsappNumber}`} className="contact-page__channel-value">
                  {BRAND.phoneDisplay}
                </a>
              </div>
              <div className="contact-page__channel">
                <span className="contact-page__channel-label">Email</span>
                <span className="contact-page__channel-value contact-page__channel-value--muted">
                  {BRAND.emailDisplay}
                </span>
              </div>
              <div className="contact-page__channel">
                <span className="contact-page__channel-label">Location</span>
                <span className="contact-page__channel-value">{BRAND.address}</span>
              </div>
              <div className="contact-page__channel">
                <span className="contact-page__channel-label">Map code</span>
                <span className="contact-page__channel-value">{BRAND.mapPlusCode}</span>
              </div>
            </div>

            <div className="contact-page__form-wrap">
              {done ? (
                <div className="contact-page__done">
                  <div className="contact-page__done-mark">
                    <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.4">
                      <path d="M4 12.5l5.2 5.2L20 6.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h2 className="contact-page__done-title">Thank you.</h2>
                  <p className="contact-page__done-sub">Our team will get in touch with you.</p>
                </div>
              ) : (
                <form className="contact-page__form" onSubmit={submit} noValidate>
                  <div className="form-field">
                    <label htmlFor="ct-name">Name *</label>
                    <input id="ct-name" type="text" value={form.name} onChange={setField('name')} autoComplete="name" />
                    {errors.name && <span className="form-error">{errors.name}</span>}
                  </div>
                  <div className="form-field">
                    <label htmlFor="ct-email">Email *</label>
                    <input id="ct-email" type="email" value={form.email} onChange={setField('email')} autoComplete="email" />
                    {errors.email && <span className="form-error">{errors.email}</span>}
                  </div>
                  <div className="form-field">
                    <label htmlFor="ct-phone">Phone</label>
                    <input id="ct-phone" type="tel" value={form.phone} onChange={setField('phone')} autoComplete="tel" />
                  </div>
                  <div className="form-field">
                    <label htmlFor="ct-message">Message *</label>
                    <textarea id="ct-message" rows="5" value={form.message} onChange={setField('message')} placeholder="How can we help?" />
                  </div>
                  {errors._form && <div className="form-error form-error--block">{errors._form}</div>}
                  <button type="submit" className="btn btn--primary btn--lg contact-page__submit" disabled={submitting}>
                    {submitting ? 'Sending…' : 'Send Message'}
                    <span className="btn-arrow">→</span>
                  </button>
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="visit section-pad" aria-label="Visit the studio">
        <div className="container">
          <Reveal className="visit__head">
            <span className="eyebrow eyebrow--center">Find us</span>
            <h2 className="visit__title">Visit the Deo Wada studio</h2>
            <p className="visit__sub">Walk-ins by appointment — message us on WhatsApp and we will be glad to receive you.</p>
          </Reveal>

          <Reveal className="visit__grid">
            <div className="visit__map">
              <iframe
                src={mapEmbedUrl}
                title={`Map of ${BRAND.name} — ${BRAND.mapQuery}`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
            <div className="visit__card">
              <h3 className="visit__card-title">{BRAND.name}</h3>
              <p className="visit__card-address">{BRAND.mapQuery}</p>
              <ul className="visit__card-list">
                <li>
                  <span className="visit__card-label">Phone / WhatsApp</span>
                  <a href={whatsappUrl('Namaskar, I would like to visit the Raajwarasa studio.')}>{BRAND.phoneDisplay}</a>
                </li>
                <li>
                  <span className="visit__card-label">Plus code</span>
                  <span>{BRAND.mapPlusCode}</span>
                </li>
              </ul>
              <div className="visit__actions">
                <a href={mapLinkUrl} target="_blank" rel="noreferrer" className="btn btn--primary">
                  Get directions
                  <span className="btn-arrow">→</span>
                </a>
                <a href={whatsappUrl()} target="_blank" rel="noreferrer" className="btn btn--outline">
                  WhatsApp us
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}