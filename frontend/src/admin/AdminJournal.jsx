import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../lib/api';
import { pickPlaceholder, formatDate } from '../lib/utils';

const coverOf = (a) => a.coverImage || pickPlaceholder(a.slug || a.title || '');

export default function AdminJournal() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .journal({ page: 0, size: 100 })
      .then((data) => setItems(data.items || []))
      .finally(() => setLoading(false));
  }, []);

  const remove = async (id) => {
    if (!window.confirm('Delete this article?')) return;
    await adminApi.deleteJournal(id);
    setItems((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="a-page">
      <div className="a-page__head a-page__head--between">
        <div>
          <h1 className="a-page__title">Journal Articles</h1>
          <p className="a-page__sub">{items.length} total</p>
        </div>
        <Link to="/admin/journal/new" className="a-btn a-btn--primary">+ New Article</Link>
      </div>

      {loading && <div className="a-skeleton" style={{ height: 260 }} />}

      {!loading && items.length === 0 && (
        <div className="a-empty">No journal articles have been published yet.</div>
      )}

      {!loading && items.length > 0 && (
        <div className="a-card a-card--flush">
          <div className="a-table-wrap">
            <table className="a-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Updated</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <div className="a-table__title-cell">
                        <img src={coverOf(a)} alt={coverOf(a) ? `Cover of ${a.title}` : ''} className="a-table__thumb" />
                        {a.title}
                      </div>
                    </td>
                    <td>{a.category || '—'}</td>
                    <td>
                      <span className={`a-badge a-badge--${(a.status || '').toLowerCase()}`}>{a.status}</span>
                    </td>
                    <td>{a.updatedAt ? formatDate(a.updatedAt) : '—'}</td>
                    <td>
                      <Link to={`/admin/journal/edit/${a.id}`} className="a-btn a-btn--sm a-btn--outline">Edit</Link>
                      <button type="button" className="a-btn a-btn--sm a-btn--danger" onClick={() => remove(a.id)}>Delete</button>
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