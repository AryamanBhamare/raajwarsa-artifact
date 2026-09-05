import { Fragment, useEffect, useState } from 'react';
import { adminApi } from '../lib/api';
import { formatDate } from '../lib/utils';
import { formatINR } from '../config';

const STATUS_ORDER = ['NEW', 'CONFIRMED', 'PAID', 'DISPATCHED', 'DELIVERED', 'CANCELLED'];

const STATUS_LABEL = {
  NEW: 'New',
  CONFIRMED: 'Confirmed',
  PAID: 'Paid',
  DISPATCHED: 'Dispatched',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled'
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [saving, setSaving] = useState(null);
  const [error, setError] = useState('');

  const load = () =>
    adminApi
      .orders()
      .then((data) => setOrders(data.content || data || []))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const filtered = filter ? orders.filter((o) => o.status === filter) : orders;

  const changeStatus = (id, status) => {
    setSaving(id);
    setError('');
    adminApi
      .setOrderStatus(id, status)
      .then((updated) => {
        setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...updated } : o)));
        setExpanded(null);
      })
      .catch(() => setError('Could not update the order. Please try again.'))
      .finally(() => setSaving(null));
  };

  return (
    <div className="a-page">
      <div className="a-page__head">
        <h1 className="a-page__title">Orders</h1>
        <p className="a-page__sub">{orders.length} total</p>
      </div>

      <div className="a-filters">
        <button
          type="button"
          className={`a-filter-chip ${filter === '' ? 'a-filter-chip--active' : ''}`}
          onClick={() => setFilter('')}
        >
          All
        </button>
        {STATUS_ORDER.map((s) => (
          <button
            key={s}
            type="button"
            className={`a-filter-chip ${filter === s ? 'a-filter-chip--active' : ''}`}
            onClick={() => setFilter(s)}
          >
            {STATUS_LABEL[s]}
          </button>
        ))}
      </div>

      {error && <div className="a-alert a-alert--error">{error}</div>}

      {loading && <div className="a-skeleton" style={{ height: 300 }} />}

      {!loading && filtered.length === 0 && (
        <div className="a-empty">No orders{filter ? ` with status ${STATUS_LABEL[filter]}` : ''} yet.</div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="a-card a-card--flush">
          <div className="a-table-wrap">
            <table className="a-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <Fragment key={o.id}>
                    <tr>
                      <td className="a-table__strong">{o.orderNumber}</td>
                      <td>
                        {o.customerName}
                        <div className="a-table__muted">
                          {o.phone || '—'}
                          {o.city ? ` · ${o.city}` : ''}
                        </div>
                      </td>
                      <td>{o.items.reduce((n, i) => n + i.quantity, 0)} pieces</td>
                      <td className="a-table__strong">{formatINR(Number(o.totalAmount))}</td>
                      <td>
                        <div>{o.paymentMethod || '—'}</div>
                        <div className={`a-badge a-badge--${(o.paymentStatus || '').toLowerCase()}`}>
                          {o.paymentStatus || '—'}
                        </div>
                      </td>
                      <td>
                        <span className={`a-badge a-badge--${(o.status || '').toLowerCase()}`}>
                          {STATUS_LABEL[o.status]}
                        </span>
                      </td>
                      <td>{o.createdAt ? formatDate(o.createdAt) : '—'}</td>
                      <td>
                        <button
                          type="button"
                          className="a-btn a-btn--sm a-btn--ghost"
                          onClick={() => setExpanded(expanded === o.id ? null : o.id)}
                        >
                          {expanded === o.id ? 'Close' : 'Manage'}
                        </button>
                      </td>
                    </tr>
                    {expanded === o.id && (
                      <tr className="a-table__detail-row">
                        <td colSpan={8}>
                          <div className="a-order-detail">
                            <div className="a-order-detail__grid">
                              <div>
                                <h4 className="a-order-detail__title">Delivery</h4>
                                <p className="a-order-detail__text">
                                  {o.address ? `${o.address}, ` : ''}
                                  {o.city ? `${o.city}, ` : ''}
                                  {o.state ? `${o.state} ` : ''}
                                  {o.pincode ? `— ${o.pincode}` : ''}
                                </p>
                                <p className="a-order-detail__text">
                                  Mode: {o.deliveryMode}
                                </p>
                              </div>
                              <div>
                                <h4 className="a-order-detail__title">Status</h4>
                                <div className="a-order-detail__status">
                                  <select
                                    className="a-input a-input--inline"
                                    value={o.status}
                                    disabled={saving === o.id}
                                    onChange={(e) => changeStatus(o.id, e.target.value)}
                                  >
                                    {STATUS_ORDER.map((s) => (
                                      <option key={s} value={s}>
                                        {STATUS_LABEL[s]}
                                      </option>
                                    ))}
                                  </select>
                                  {saving === o.id && <span className="a-order-detail__saving">Saving…</span>}
                                </div>
                              </div>
                            </div>
                            <div className="a-order-items">
                              {o.items.map((it) => (
                                <div className="a-order-items__row" key={it.artifactId}>
                                  {it.artifactUrl && (
                                    <img
                                      src={it.artifactUrl}
                                      alt={it.artifactName}
                                      className="a-order-items__thumb"
                                    />
                                  )}
                                  <div className="a-order-items__name">
                                    {it.artifactName}
                                    <div className="a-table__muted">× {it.quantity}</div>
                                  </div>
                                  <span className="a-order-items__price">
                                    {formatINR(Number(it.lineTotal))}
                                  </span>
                                </div>
                              ))}
                              <div className="a-order-items__total">
                                <span>Total ({o.paymentMethod || ''} payment)</span>
                                <strong>{formatINR(Number(o.totalAmount))}</strong>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}