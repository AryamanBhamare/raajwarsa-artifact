import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../lib/api';
import { statusLabel, formatDate } from '../lib/utils';

const STATUS_ORDER = ['NEW', 'CONTACTED', 'FOLLOW_UP', 'RESOLVED', 'CLOSED'];

export default function AdminInquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    adminApi
      .inquiries({ page: 0, size: 200 })
      .then((data) => setInquiries(data.content || []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter
    ? inquiries.filter((i) => i.status === filter)
    : inquiries;

  return (
    <div className="a-page">
      <div className="a-page__head">
        <h1 className="a-page__title">Inquiries</h1>
        <p className="a-page__sub">{inquiries.length} total</p>
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
            {statusLabel(s)}
          </button>
        ))}
      </div>

      {loading && <div className="a-skeleton" style={{ height: 300 }} />}

      {!loading && filtered.length === 0 && (
        <div className="a-empty">No enquiries{filter ? ` with status ${statusLabel(filter)}` : ''}.</div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="a-card a-card--flush">
          <div className="a-table-wrap">
            <table className="a-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Artifact</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Source</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inq) => (
                  <tr key={inq.id}>
                    <td>
                      <Link to={`/admin/inquiries/${inq.id}`} className="a-table__link">
                        {inq.name}
                      </Link>
                    </td>
                    <td>{inq.artifactName || 'General'}</td>
                    <td>{inq.phone || '—'}</td>
                    <td>
                      <span className={`a-badge a-badge--${inq.status.toLowerCase()}`}>
                        {statusLabel(inq.status)}
                      </span>
                    </td>
                    <td>{inq.source || '—'}</td>
                    <td>{inq.createdAt ? formatDate(inq.createdAt) : '—'}</td>
                    <td>
                      <Link to={`/admin/inquiries/${inq.id}`} className="a-btn a-btn--sm a-btn--ghost">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}