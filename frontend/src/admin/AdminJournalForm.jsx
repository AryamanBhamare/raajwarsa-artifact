import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { adminApi } from '../lib/api';
import { prepareImageFile } from '../lib/image';

const EMPTY = {
  title: '',
  slug: '',
  category: '',
  content: '',
  coverImage: '',
  author: '',
  seoTitle: '',
  seoDescription: '',
  status: 'DRAFT'
};

export default function AdminJournalForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      adminApi.journalArticle(id).then((a) => {
        setForm({
          title: a.title || '',
          slug: a.slug || '',
          category: a.category || '',
          content: a.content || '',
          coverImage: a.coverImage || '',
          author: a.author || '',
          seoTitle: a.seoTitle || '',
          seoDescription: a.seoDescription || '',
          status: a.status || 'DRAFT'
        });
      });
    }
  }, [id, isEdit]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleCover = async (e) => {
    const rawFile = e.target.files?.[0];
    if (!rawFile) return;
    setUploading(true);
    try {
      const file = await prepareImageFile(rawFile);
      const media = await adminApi.uploadMedia(file, null, form.title, 'image');
      setForm((f) => ({ ...f, coverImage: media.url }));
    } catch {
      setError('Cover upload failed.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Title is required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (isEdit) await adminApi.updateJournal(id, form);
      else await adminApi.createJournal(form);
      navigate('/admin/journal');
    } catch (err) {
      setError(err.message || 'Failed to save article.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="a-page">
      <div className="a-page__head">
        <Link to="/admin/journal" className="a-back">← Journal</Link>
        <h1 className="a-page__title">{isEdit ? 'Edit Article' : 'New Article'}</h1>
      </div>

      {error && <div className="a-alert a-alert--error">{error}</div>}

      <form className="a-form" onSubmit={save}>
        <div className="a-card">
          <h2 className="a-card__title">Content</h2>
          <div className="a-form-grid">
            <div className="a-field">
              <label>Title *</label>
              <input className="a-input" value={form.title} onChange={set('title')} />
            </div>
            <div className="a-field">
              <label>Slug</label>
              <input className="a-input" value={form.slug} onChange={set('slug')} placeholder="auto if blank" />
            </div>
            <div className="a-field">
              <label>Category</label>
              <input className="a-input" value={form.category} onChange={set('category')} />
            </div>
            <div className="a-field">
              <label>Author</label>
              <input className="a-input" value={form.author} onChange={set('author')} />
            </div>
          </div>
          <div className="a-field">
            <label>Content (HTML)</label>
            <textarea className="a-input" rows="12" value={form.content} onChange={set('content')} placeholder="<p>Your article…</p>" />
          </div>
        </div>

        <div className="a-card">
          <h2 className="a-card__title">Cover & Publishing</h2>
          <div className="a-cover">
            {form.coverImage ? (
              <div className="a-cover__preview">
                <img src={form.coverImage} alt={`Cover preview of ${form.title || 'journal entry'}`} />
                <button type="button" className="a-btn a-btn--sm a-btn--danger" onClick={() => setForm((f) => ({ ...f, coverImage: '' }))}>Remove</button>
              </div>
            ) : (
              <div className="a-empty">No cover image set.</div>
            )}
            <label className="a-btn a-btn--outline a-btn--sm">
              {uploading ? 'Uploading…' : 'Upload cover'}
              <input type="file" accept="image/*" hidden onChange={handleCover} />
            </label>
            <span className="a-upload-hint">Any resolution works — optimized automatically.</span>
          </div>
          <div className="a-checkbox-row">
            <label className="a-checkbox">
              <input type="radio" name="status" checked={form.status === 'PUBLISHED'} onChange={() => setForm((f) => ({ ...f, status: 'PUBLISHED' }))} />
              <span>Published</span>
            </label>
            <label className="a-checkbox">
              <input type="radio" name="status" checked={form.status === 'DRAFT'} onChange={() => setForm((f) => ({ ...f, status: 'DRAFT' }))} />
              <span>Draft</span>
            </label>
          </div>
        </div>

        <div className="a-card">
          <h2 className="a-card__title">SEO</h2>
          <div className="a-field"><label>SEO Title</label><input className="a-input" value={form.seoTitle} onChange={set('seoTitle')} /></div>
          <div className="a-field"><label>SEO Description</label><textarea className="a-input" rows="2" value={form.seoDescription} onChange={set('seoDescription')} /></div>
        </div>

        <div className="a-card__actions">
          <button type="submit" className="a-btn a-btn--primary" disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create article'}
          </button>
        </div>
      </form>
    </div>
  );
}