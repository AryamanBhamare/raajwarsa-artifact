import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatINR } from '../config';

export default function CartPage() {
  const { items, setQty, removeItem } = useCart();
  const subtotal = items.reduce((s, i) => s + Number(i.artifact.price) * i.qty, 0);

  return (
    <>
      <section className="page-hero page-hero--short">
        <div className="page-hero__overlay" />
        <div className="container page-hero__content">
          <span className="eyebrow eyebrow--onhero">Collection cart</span>
          <h1 className="page-hero__title">Your cart</h1>
          <p className="page-hero__sub">{items.length ? 'Review the pieces you have chosen.' : 'Your cart is waiting to be filled.'}</p>
        </div>
      </section>

      <section className="cart section-pad">
        <div className="container-wide">
          {items.length === 0 ? (
            <div className="cart__empty">
              <div className="cart__empty-mark" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <circle cx="9.5" cy="20" r="1.6" />
                  <circle cx="17.5" cy="20" r="1.6" />
                  <path d="M2.5 3.5h3l2.6 12.2h10.6l2.3-8.2H6.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h2 className="cart__empty-title">Nothing in the cart yet</h2>
              <p className="cart__empty-text">Browse the collection and choose the pieces that speak to you.</p>
              <Link to="/collection" className="btn btn--primary">
                Explore the collection
                <span className="btn-arrow">→</span>
              </Link>
            </div>
          ) : (
            <div className="cart__grid">
              <ul className="cart__list">
                {items.map((i) => (
                  <li key={i.artifact.id} className="cart__item">
                    <Link to={`/collection/${i.artifact.slug}`} className="cart__thumb">
                      <img src={i.artifact.url || '/placeholders/bronze-vessel.svg'} alt={i.artifact.name} loading="lazy" />
                    </Link>
                    <div className="cart__info">
                      <Link to={`/collection/${i.artifact.slug}`} className="cart__name">{i.artifact.name}</Link>
                      <span className="cart__price">{formatINR(Number(i.artifact.price))}</span>
                      <div className="cart__controls">
                        <div className="cart__qty" role="group" aria-label={`Quantity of ${i.artifact.name}`}>
                          <button type="button" onClick={() => setQty(i.artifact.id, i.qty - 1)} aria-label="Decrease quantity">−</button>
                          <span>{i.qty}</span>
                          <button type="button" onClick={() => setQty(i.artifact.id, i.qty + 1)} aria-label="Increase quantity">+</button>
                        </div>
                        <button type="button" className="cart__remove" onClick={() => removeItem(i.artifact.id)}>
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="cart__line">{formatINR(Number(i.artifact.price) * i.qty)}</div>
                  </li>
                ))}
              </ul>

              <aside className="cart__summary">
                <h3 className="cart__summary-title">Order summary</h3>
                <div className="cart__summary-row">
                  <span>Subtotal</span>
                  <span>{formatINR(subtotal)}</span>
                </div>
                <p className="cart__summary-note">
                  Delivery is arranged personally — we confirm every detail with you on WhatsApp or phone.
                </p>
                <Link to="/checkout" className="btn btn--primary btn--lg cart__summary-btn">
                  Proceed to checkout
                  <span className="btn-arrow">→</span>
                </Link>
                <Link to="/collection" className="cart__continue">Continue exploring</Link>
              </aside>
            </div>
          )}
        </div>
      </section>
    </>
  );
}