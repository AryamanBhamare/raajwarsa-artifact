import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { adminApi } from '../lib/api';
import { prepareImageFile } from '../lib/image';

const EMPTY_FORM = {
  name: '',
  slug: '',
  categoryId: '',
  description: '',
  historicalContext: '',
  craftsmanship: '',
  material: '',
  period: '',
  origin: '',
  region: '',
  size: '',
  condition: '',
  preservation: '',
  provenance: '',
  availability: 'ON_REQUEST',
  featured: false,
  active: true,
  sortOrder: 0
};

const AVAILABILITY_OPTIONS = ['ON_REQUEST', 'AVAILABLE', 'LIMITED', 'UNAVAILABLE', 'IN_COLLECTION'];

export default function AdminArtifactForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = useState(EMPTY_FORM);
  const [initialImages, setInitialImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi.categories().then(setCategories);
    if (isEdit) {
      adminApi.artifact(id).then((a) => {
        setForm({
          name: a.name || '',
          slug: a.slug || '',
          categoryId: a.category?.id || '',
          description: a.description || '',
          historicalContext: a.historicalContext || '',
          craftsmanship: a.craftsmanship || '',
          material: a.material || '',
          period: a.period || '',
          origin: a.origin || '',
          region: a.region || '',
          size: a.size || '',
          condition: a.condition || '',
          preservation: a.preservation || '',
          provenance: a.provenance || '',
          availability: a.availability || 'ON_REQUEST',
          featured: a.featured,
          active: a.active,
          sortOrder: a.sortOrder || 0
        });
        setInitialImages(a.images || []);
      });
    }
  }, [id, isEdit]);

  const set = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    setError('');
    try {
      for (const rawFile of files) {
        const file = await prepareImageFile(rawFile);
        const media = await adminApi.uploadMedia(file, id ? Number(id) : null, form.name, 'image');
        setImages((prev) => [...prev, media.url]);
      }
    } catch {
      setError('Upload failed. Check that the image is a valid file.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const allImages = isEdit ? [...initialImages.filter((i) => i.url).map((i) => i.url), ...images] : images;

  const save = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Artifact name is required.');
      return;
    }
    if (!form.categoryId) {
      setError('Please select a category.');
      return;
    }
    setSaving(true);
    setError('');
    const payload = {
      ...form,
      categoryId: Number(form.categoryId),
      images: allImages.map((url, i) => ({ url, altText: form.name, sortOrder: i }))
    };
    try {
      if (isEdit) await adminApi.updateArtifact(id, payload);
      else await adminApi.createArtifact(payload);
      navigate('/admin/artifacts');
    } catch (err) {
      setError(err.message || 'Failed to save artifact.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="a-page">
      <div className="a-page__head a-page__head--between">
        <div>
          <Link to="/admin/artifacts" className="a-back">← Artifacts</Link>
          <h1 className="a-page__title">{isEdit ? 'Edit Artifact' : 'New Artifact'}</h1>
        </div>
      </div>

      {error && <div className="a-alert a-alert--error">{error}</div>}

      <form className="a-form" onSubmit={save}>
        <div className="a-card">
          <h2 className="a-card__title">Basics</h2>
          <div className="a-form-grid">
            <div className="a-field">
              <label>Name *</label>
              <input className="a-input" value={form.name} onChange={set('name')} placeholder="Artifact name" />
            </div>
            <div className="a-field">
              <label>Slug</label>
              <input className="a-input" value={form.slug} onChange={set('slug')} placeholder="auto-generated if blank" />
            </div>
            <div className="a-field">
              <label>Category *</label>
              <select className="a-input" value={form.categoryId} onChange={set('categoryId')}>
                <option value="">Select category…</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="a-field">
              <label>Availability</label>
              <select className="a-input" value={form.availability} onChange={set('availability')}>
                {AVAILABILITY_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>
          <div className="a-form-grid a-form-grid--1">
            <div className="a-field">
              <label>Description</label>
              <textarea className="a-input" rows="3" value={form.description} onChange={set('description')} />
            </div>
          </div>
          <div className="a-checkbox-row">
            <label className="a-checkbox">
              <input type="checkbox" checked={form.featured} onChange={set('featured')} />
              <span>Featured on homepage</span>
            </label>
            <label className="a-checkbox">
              <input type="checkbox" checked={form.active} onChange={set('active')} />
              <span>Active (visible)</span>
            </label>
          </div>
        </div>

        <div className="a-card">
          <h2 className="a-card__title">Story & Context</h2>
          <div className="a-form-grid a-form-grid--1">
            <div className="a-field">
              <label>Historical Context</label>
              <textarea className="a-input" rows="4" value={form.historicalContext} onChange={set('historicalContext')} placeholder="Only verified information" />
            </div>
            <div className="a-field">
              <label>Craftsmanship</label>
              <textarea className="a-input" rows="3" value={form.craftsmanship} onChange={set('craftsmanship')} />
            </div>
            <div className="a-field">
              <label>Preservation</label>
              <textarea className="a-input" rows="2" value={form.preservation} onChange={set('preservation')} />
            </div>
            <div className="a-field">
              <label>Provenance</label>
              <input className="a-input" value={form.provenance} onChange={set('provenance')} />
            </div>
          </div>
        </div>

        <div className="a-card">
          <h2 className="a-card__title">Details</h2>
          <div className="a-form-grid">
            <div className="a-field"><label>Material</label><input className="a-input" value={form.material} onChange={set('material')} /></div>
            <div className="a-field"><label>Period</label><input className="a-input" value={form.period} onChange={set('period')} /></div>
            <div className="a-field"><label>Origin</label><input className="a-input" value={form.origin} onChange={set('origin')} /></div>
            <div className="a-field"><label>Region</label><input className="a-input" value={form.region} onChange={set('region')} /></div>
            <div className="a-field"><label>Size</label><input className="a-input" value={form.size} onChange={set('size')} /></div>
            <div className="a-field"><label>Condition</label><input className="a-input" value={form.condition} onChange={set('condition')} /></div>
            <div className="a-field"><label>Sort order</label><input className="a-input" type="number" value={form.sortOrder} onChange={set('sortOrder')} /></div>
          </div>
        </div>

        <div className="a-card">
          <h2 className="a-card__title">Images</h2>
          <div className="a-upload-grid">
            {allImages.length === 0 && <div className="a-empty">No images yet. Upload below.</div>}
            {allImages.map((url, i) => (
              <div key={i} className="a-upload-thumb">
                <img src={url} alt="" />
                <button
                  type="button"
                  className="a-upload-remove"
                  onClick={() => {
                    if (isEdit) setInitialImages((prev) => prev.filter((x) => x.url !== url));
                    else setImages((prev) => prev.filter((x) => x !== url));
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <div className="a-upload-btn-wrap">
            <label className="a-btn a-btn--outline a-btn--sm">
              {uploading ? 'Uploading…' : 'Upload images'}
              <input type="file" accept="image/*" multiple hidden onChange={handleUpload} />
            </label>
            <span className="a-upload-hint">Any resolution works — optimized automatically.</span>
          </div>
        </div>

        <div className="a-card__actions">
          <button type="submit" className="a-btn a-btn--primary" disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create artifact'}
          </button>
          <Link to="/admin/artifacts" className="a-btn a-btn--ghost">Cancel</Link>
        </div>
      </form>
    </div>
  );
}