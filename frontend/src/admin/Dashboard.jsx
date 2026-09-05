import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../lib/api';
import { statusLabel, formatDate } from '../lib/utils';

const EMPTY = {
  totalArtifacts: 0,
  featuredArtifacts: 0,
  newEnquiries: 0,
  contacted: 0,
  followUps: 0,
  resolved: 0,
  recentEnquiries: [],
  enquiriesByStatus: {},
  enquiriesBySource: [],
  enquiriesOverTime: [],
  totalJournalPublished: 0
};

function StatCard({ label, value, tone = 'gold' }) {
  return (
    <div className={`a-stat a-stat--${tone}`}>
      <div className="a-stat__value">{value}</div>
      <div className="a-stat__label">{label}</div>
    </div>
  );
}

function BarChart({ data, color = 'var(--c-bronze)' }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="a-chart">
      <div className="a-chart__bars">
        {data.map((d, i) => (
          <div key={i} className="a-chart__col" title={`${d.date}: ${d.count}`}>
            <div
              className="a-chart__bar"
              style={{ height: `${(d.count / max) * 100}%`, background: color }}
            />
          </div>
        ))}
      </div>
      <div className="a-chart__labels">
        {data.filter((_, i) => i % 2 === 0).map((d, i) => (
          <span key={i} className="a-chart__label">{d.date}</span>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi
      .dashboard()
      .then(setData)
      .catch(() => setError('Could not load the dashboard.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="a-page">
        <div className="a-page__head">
          <h1 className="a-page__title">Dashboard</h1>
        </div>
        <div className="a-grid a-grid--4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="a-skeleton" style={{ height: 110 }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="a-page">
      <div className="a-page__head">
        <h1 className="a-page__title">Dashboard</h1>
        <p className="a-page__sub">An overview of the Raajwarasa archive</p>
      </div>

      {error && <div className="a-alert a-alert--error">{error}</div>}

      <div className="a-grid a-grid--4">
        <StatCard label="Total Artifacts" value={data.totalArtifacts} />
        <StatCard label="Featured Artifacts" value={data.featuredArtifacts} tone="red" />
        <StatCard label="New Enquiries" value={data.newEnquiries} tone="red" />
        <StatCard label="Journal Published" value={data.totalJournalPublished} />
      </div>

      <div className="a-grid a-grid--4">
        <StatCard label="Contacted" value={data.contacted} tone="green" />
        <StatCard label="Follow Ups" value={data.followUps} tone="amber" />
        <StatCard label="Resolved" value={data.resolved} tone="green" />
        <StatCard label="Closed" value={data.enquiriesByStatus?.CLOSED || 0} tone="muted" />
      </div>

      <div className="a-grid a-grid--2">
        <div className="a-card">
          <div className="a-card__head">
            <h2 className="a-card__title">Enquiries over time</h2>
          </div>
          {data.enquiriesOverTime && data.enquiriesOverTime.length > 0 ? (
            <BarChart data={data.enquiriesOverTime} />
          ) : (
            <div className="a-empty">No data yet.</div>
          )}
        </div>

        <div className="a-card">
          <div className="a-card__head">
            <h2 className="a-card__title">Enquiries by source</h2>
          </div>
          {data.enquiriesBySource && data.enquiriesBySource.length > 0 ? (
            <div className="a-source-list">
              {data.enquiriesBySource.map((s, i) => {
                const max = Math.max(...data.enquiriesBySource.map((x) => x.count), 1);
                return (
                  <div key={i} className="a-source">
                    <span className="a-source__label">{s.source}</span>
                    <div className="a-source__track">
                      <div className="a-source__fill" style={{ width: `${(s.count / max) * 100}%` }} />
                    </div>
                    <span className="a-source__count">{s.count}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="a-empty">No data yet.</div>
          )}
        </div>
      </div>

      <div className="a-card">
        <div className="a-card__head">
          <h2 className="a-card__title">Recent Enquiries</h2>
          <Link to="/admin/inquiries" className="a-link">View all</Link>
        </div>
        {data.recentEnquiries && data.recentEnquiries.length > 0 ? (
          <table className="a-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Artifact</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {data.recentEnquiries.map((inq) => (
                <tr key={inq.id}>
                  <td>
                    <Link to={`/admin/inquiries/${inq.id}`} className="a-table__link">{inq.name}</Link>
                  </td>
                  <td>{inq.artifactName || '—'}</td>
                  <td>
                    <span className={`a-badge a-badge--${(inq.status || '').toLowerCase()}`}>
                      {statusLabel(inq.status)}
                    </span>
                  </td>
                  <td>{inq.createdAt ? formatDate(inq.createdAt) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="a-empty">No enquiries yet.</div>
        )}
      </div>
    </div>
  );
}