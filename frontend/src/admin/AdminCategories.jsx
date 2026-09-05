import { useEffect, useState } from 'react';
import { adminApi } from '../lib/api';

export default function AdminCategories() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');

  const load = () => {
    adminApi.categories().then(setItems).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const save = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setError('');
    try {
      if (editing) {
        await adminApi.updateCategory(editing, { name, description: desc });
      } else {
        await adminApi.createCategory({ name, description: desc });
      }
      setName('');
      setDesc('');
      setEditing(null);
      load();
    } catch (err) {
      setError(err.message || 'Failed to save category.');
    }
  };

  const beginEdit = (cat) => {
    setEditing(cat.id);
    setName(cat.name);
    setDesc(cat.description || '');
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    await adminApi.deleteCategory(id);
    load();
  };

  return (
    <div className="a-page">
      <div className="a-page__head">
        <h1 className="a-page__title">Categories</h1>
        <p className="a-page__sub">Organise the collection</p>
      </div>

      {error && <div className="a-alert a-alert--error">{error}</div>}

      <div className="a-grid a-grid--2">
        <div className="a-card">
          <h2 className="a-card__title">{editing ? 'Edit category' : 'New category'}</h2>
          <form className="a-form" onSubmit={save}>
            <div className="a-field">
              <label>Name *</label>
              <input className="a-input" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="a-field">
              <label>Description</label>
              <textarea className="a-input" rows="2" value={desc} onChange={(e) => setDesc(e.target.value)} />
            </div>
            <div className="a-card__actions">
              <button type="submit" className="a-btn a-btn--primary a-btn--sm">{editing ? 'Update' : 'Create'}</button>
              {editing && (
                <button type="button" className="a-btn a-btn--ghost a-btn--sm" onClick={() => { setEditing(null); setName(''); setDesc(''); }}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="a-card">
          <h2 className="a-card__title">Existing categories</h2>
          {loading && <div className="a-skeleton" style={{ height: 120 }} />}
          {!loading && items.length === 0 && <div className="a-empty">No categories yet.</div>}
          {!loading && items.length > 0 && (
            <div className="a-cat-list">
              {items.map((c) => (
                <div key={c.id} className="a-cat">
                  <div>
                    <div className="a-cat__name">{c.name}</div>
                    {c.description && <div className="a-cat__desc">{c.description}</div>}
                  </div>
                  <div className="a-cat__actions">
                    <button type="button" className="a-btn a-btn--sm a-btn--outline" onClick={() => beginEdit(c)}>Edit</button>
                    <button type="button" className="a-btn a-btn--sm a-btn--danger" onClick={() => remove(c.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}