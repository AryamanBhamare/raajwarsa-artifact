import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { submitOrder } from '../lib/api';
import { INDIAN_STATES, BRAND, whatsappUrl, formatINR } from '../config';

const DELIVERY_MODES = [
  { id: 'STANDARD', label: 'Standard delivery', note: 'Delivered to your address anywhere in India', fee: 0 },
  { id: 'PICKUP', label: 'Store pickup', note: 'Collect in person at the Deo Wada studio', fee: 0 }
];

const PAYMENT_METHODS = [
  { id: 'UPI', label: 'UPI', hint: 'GPay · PhonePe · Paytm, BHIM & more' },
  { id: 'CARD', label: 'Credit / Debit card', hint: 'Visa · Mastercard · RuPay' },
  { id: 'NETBANKING', label: 'Net banking', hint: 'All major Indian banks' },
  { id: 'COD', label: 'Pay on delivery', hint: 'Cash or UPI when your piece arrives' }
];

const initialForm = { customerName: '', email: '', phone: '', address: '', city: '', state: '', pincode: '' };

export default function CheckoutPage() {
  const { items, clear } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [deliveryMode, setDeliveryMode] = useState('STANDARD');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState('form');
  const [submitting, setSubmitting] = useState(false);
  const [order, setOrder] = useState(null);

  const total = useMemo(() => items.reduce((s, i) => s + Number(i.artifact.price) * i.qty, 0), [items]);

  if (items.length === 0 && step !== 'done') {
    navigate('/cart', { replace: true });
    return null;
  }

  const setField = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors((err) => ({ ...err, [field]: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (!form.customerName.trim()) errs.customerName = 'Please enter your name';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errs.email = 'Please enter a valid email';
    if (!/^[0-9]{10,12}$/.test(form.phone.trim())) errs.phone = 'Enter a 10-digit phone number';
    if (!form.address.trim()) errs.address = 'Please enter your address';
    if (!form.city.trim()) errs.city = 'Please enter your city';
    if (!form.state) errs.state = 'Please select your state';
    if (!/^[0-9]{6}$/.test(form.pincode.trim())) errs.pincode = 'PIN code must be 6 digits';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const tryReview = () => {
    if (validate()) setStep('review');
    window.scrollTo(0, 0);
  };

  const onFormSubmit = (e) => {
    e.preventDefault();
    tryReview();
  };

  const placeOrder = async () => {
    setSubmitting(true);
    try {
      const placed = await submitOrder({
        ...form,
        customerName: form.customerName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state,
        pincode: form.pincode.trim(),
        deliveryMode,
        paymentMethod,
        items: items.map((i) => ({ artifactId: i.artifact.id, quantity: i.qty }))
      });
      setOrder(placed);
      clear();
      setStep('done');
      window.scrollTo(0, 0);
    } catch (err) {
      setErrors({ _form: err.message || 'Could not place the order. Please try again.' });
      setStep('form');
      window.scrollTo(0, 0);
    } finally {
      setSubmitting(false);
    }
  };

  if (step === 'done' && order) {
    return (
      <section className="checkout-done section-pad">
        <div className="container-narrow">
          <div className="checkout-done__mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="currentColor" strokeWidth="1.4">
              <path d="M4 12.5l5.2 5.2L20 6.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="eyebrow eyebrow--center">Order received</span>
          <h1 className="checkout-done__title">Thank you, {order.customerName.split(' ')[0]}.</h1>
          <p className="checkout-done__sub">
            Your order <strong>{order.orderNumber}</strong> for {formatINR(Number(order.totalAmount))} has been received.
            We will confirm the dispatch and payment on WhatsApp or by phone.
          </p>
          <ul className="checkout-done__facts">
            <li><span>Items</span><span>{order.items.reduce((s, i) => s + i.quantity, 0)}</span></li>
            <li><span>Deliver to</span><span>{order.city}, {order.state} · {order.pincode}</span></li>
            <li><span>Payment</span><span>{order.deliveryMode === 'PICKUP' ? 'At the studio' : order.paymentMethod}</span></li>
          </ul>
          <div className="checkout-done__actions">
            <a
              href={whatsappUrl(`Namaskar, I just placed order ${order.orderNumber} on Raajwarasa. Please confirm the details.`)}
              target="_blank"
              rel="noreferrer"
              className="btn btn--primary btn--lg"
            >
              Confirm on WhatsApp
              <span className="btn-arrow">→</span>
            </a>
            <Link to="/collection" className="btn btn--outline btn--lg">Continue exploring</Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="page-hero page-hero--short">
        <div className="page-hero__overlay" />
        <div className="container page-hero__content">
          <span className="eyebrow eyebrow--onhero">Checkout</span>
          <h1 className="page-hero__title">Finalise your order</h1>
          <p className="page-hero__sub">Tell us where in India to deliver — every piece is packed and shipped with care.</p>
        </div>
      </section>

      <section className="checkout section-pad">
        <div className="container-wide">
          {errors._form && <div className="checkout__banner" role="alert">{errors._form}</div>}

          <div className="checkout__grid">
            <div className="checkout__main">
              <div className="checkout__block">
                <div className="checkout__step-head">
                  <span className="checkout__step-num">1</span>
                  <div>
                    <h2 className="checkout__step-title">Delivery details</h2>
                    <p className="checkout__step-sub">{deliveryMode === 'PICKUP' ? "Pickup address — same day, in person." : 'We deliver across India.'}</p>
                  </div>
                </div>
                <form className="checkout__form" onSubmit={onFormSubmit} noValidate>
                  <div className="checkout__row">
                    <div className="form-field">
                      <label htmlFor="co-name">Full name *</label>
                      <input id="co-name" type="text" value={form.customerName} onChange={setField('customerName')} autoComplete="name" placeholder="Your name" />
                      {errors.customerName && <span className="form-error">{errors.customerName}</span>}
                    </div>
                  </div>
                  <div className="checkout__row checkout__row--2">
                    <div className="form-field">
                      <label htmlFor="co-phone">Phone *</label>
                      <input id="co-phone" type="tel" value={form.phone} onChange={setField('phone')} autoComplete="tel" placeholder="10-digit mobile number" />
                      {errors.phone && <span className="form-error">{errors.phone}</span>}
                    </div>
                    <div className="form-field">
                      <label htmlFor="co-email">Email *</label>
                      <input id="co-email" type="email" value={form.email} onChange={setField('email')} autoComplete="email" placeholder="you@example.com" />
                      {errors.email && <span className="form-error">{errors.email}</span>}
                    </div>
                  </div>
                  <div className="form-field">
                    <label htmlFor="co-address">Full address *</label>
                    <textarea id="co-address" rows="2" value={form.address} onChange={setField('address')} autoComplete="street-address" placeholder="House / building, street, landmark" />
                    {errors.address && <span className="form-error">{errors.address}</span>}
                  </div>
                  <div className="checkout__row checkout__row--3">
                    <div className="form-field">
                      <label htmlFor="co-city">City *</label>
                      <input id="co-city" type="text" value={form.city} onChange={setField('city')} autoComplete="address-level2" placeholder="City" />
                      {errors.city && <span className="form-error">{errors.city}</span>}
                    </div>
                    <div className="form-field">
                      <label htmlFor="co-state">State *</label>
                      <select id="co-state" value={form.state} onChange={setField('state')} autoComplete="address-level1">
                        <option value="">Select state</option>
                        {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      {errors.state && <span className="form-error">{errors.state}</span>}
                    </div>
                    <div className="form-field">
                      <label htmlFor="co-pin">PIN code *</label>
                      <input id="co-pin" type="text" inputMode="numeric" maxLength="6" value={form.pincode} onChange={setField('pincode')} autoComplete="postal-code" placeholder="411033" />
                      {errors.pincode && <span className="form-error">{errors.pincode}</span>}
                    </div>
                  </div>

                  <div className="checkout__modes">
                    {DELIVERY_MODES.map((m) => (
                      <label key={m.id} className={`checkout__mode ${deliveryMode === m.id ? 'checkout__mode--on' : ''}`}>
                        <input type="radio" name="delivery" value={m.id} checked={deliveryMode === m.id} onChange={() => setDeliveryMode(m.id)} />
                        <span className="checkout__mode-body">
                          <span className="checkout__mode-title">{m.label}</span>
                          <span className="checkout__mode-note">{m.note}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </form>
              </div>

              <div className="checkout__block">
                <div className="checkout__step-head">
                  <span className="checkout__step-num">2</span>
                  <div>
                    <h2 className="checkout__step-title">Payment method</h2>
                    <p className="checkout__step-sub">Choose how you would like to pay.</p>
                  </div>
                </div>
                <div className="checkout__pay">
                  {PAYMENT_METHODS.map((p) => (
                    <label key={p.id} className={`checkout__pay-opt ${paymentMethod === p.id ? 'checkout__pay-opt--on' : ''}`}>
                      <input type="radio" name="payment" value={p.id} checked={paymentMethod === p.id} onChange={() => setPaymentMethod(p.id)} />
                      <span className="checkout__pay-body">
                        <span className="checkout__pay-title">{p.label}</span>
                        <span className="checkout__pay-hint">{p.hint}</span>
                      </span>
                    </label>
                  ))}
                  <p className="checkout__pay-note">
                    Secure checkout. Payment links for {paymentMethod === 'COD' ? 'pay on delivery' : paymentMethod} are shared on WhatsApp once the order is confirmed.
                  </p>
                </div>
              </div>
            </div>

            <aside className="checkout__side">
              <h3 className="checkout__side-title">Your order</h3>
              <ul className="checkout__review-list">
                {items.map((i) => (
                  <li key={i.artifact.id} className="checkout__review-item">
                    <span className="checkout__review-qty">{i.qty}×</span>
                    <span className="checkout__review-name">{i.artifact.name}</span>
                    <span className="checkout__review-price">{formatINR(Number(i.artifact.price) * i.qty)}</span>
                  </li>
                ))}
              </ul>
              <div className="checkout__total">
                <span>Total</span>
                <span>{formatINR(total)}</span>
              </div>
              <button
                type="button"
                className={`btn btn--primary btn--lg checkout__place ${step !== 'review' ? 'checkout__place--hidden' : ''}`}
                onClick={placeOrder}
                disabled={submitting}
              >
                {submitting ? 'Placing order…' : `Place order · ${formatINR(total)}`}
                <span className="btn-arrow">→</span>
              </button>
              <button
                type="button"
                className={`btn btn--primary btn--lg checkout__place ${step === 'review' ? 'checkout__place--hidden' : ''}`}
                onClick={tryReview}
              >
                Continue to payment
                <span className="btn-arrow">→</span>
              </button>
              <p className="checkout__side-note">Questions before you order? We are one WhatsApp away on {BRAND.phoneDisplay}.</p>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}