import { useEffect, useState } from 'react';
import { adminApi } from '../lib/api';
import { formatDate } from '../lib/utils';
import { prepareImageFile } from '../lib/image';

export default function AdminMedia() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    adminApi
      .media()
      .then((data) => setItems(data || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    setError('');
    try {
      for (const rawFile of files) {
        const file = await prepareImageFile(rawFile);
        await adminApi.uploadMedia(file, null, file.name, 'image');
      }
      load();
    } catch {
      setError('One or more uploads failed.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this media item?')) return;
    await adminApi.deleteMedia(id);
    setItems((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <div className="a-page">
      <div className="a-page__head a-page__head--between">
        <div>
          <h1 className="a-page__title">Media Library</h1>
          <p className="a-page__sub">Images uploaded from the admin panel</p>
        </div>
        <label className="a-btn a-btn--primary">
          {uploading ? 'Uploading…' : '+ Upload'}
          <input type="file" accept="image/*" multiple hidden onChange={handleUpload} />
        </label>
      </div>
      <p className="a-page__hint">Any resolution works — large photos are optimized automatically for the web.</p>

      {error && <div className="a-alert a-alert--error">{error}</div>}

      {loading && <div className="a-skeleton" style={{ height: 260 }} />}

      {!loading && items.length === 0 && (
        <div className="a-empty">No media uploaded yet.</div>
      )}

      {!loading && items.length > 0 && (
        <div className="a-media-grid">
          {items.map((m) => (
            <div key={m.id} className="a-media">
              <div className="a-media__img">
                <img src={m.url} alt={m.altText || 'Uploaded image'} loading="lazy" />
              </div>
              <div className="a-media__info">
                <div className="a-media__alt" title={m.altText || ''}>{m.altText || 'Untitled'}</div>
                <div className="a-media__meta">{m.kind || 'image'} · uploaded {m.uploadedAt ? formatDate(m.uploadedAt) : '—'}</div>
              </div>
              <div className="a-media__actions">
                <button type="button" className="a-btn a-btn--sm a-btn--ghost" onClick={() => navigator.clipboard?.writeText(m.url)}>
                  Copy URL
                </button>
                <button type="button" className="a-btn a-btn--sm a-btn--danger" onClick={() => remove(m.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}