import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { adminApi } from '../lib/api';
import { statusLabel, formatDate } from '../lib/utils';

export default function AdminInquiryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [inq, setInq] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () => {
    adminApi.inquiry(id).then((data) => {
      setInq(data);
      setAdminNotes(data.adminNotes || '');
      setLoading(false);
    });
  };

  useEffect(() => {
    setLoading(true);
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const changeStatus = async (status) => {
    setBusy(true);
    try {
      await adminApi.setInquiryStatus(id, status);
      load();
    } finally {
      setBusy(false);
    }
  };

  const addNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setBusy(true);
    try {
      await adminApi.addInquiryNote(id, newNote);
      setNewNote('');
      load();
    } finally {
      setBusy(false);
    }
  };

  const saveAdminNotes = async () => {
    setBusy(true);
    try {
      await adminApi.saveInquiryNotes(id, adminNotes);
      load();
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div className="a-page"><div className="a-skeleton" style={{ height: 400 }} /></div>;
  if (!inq) return <div className="a-page"><div className="a-empty">Enquiry not found.</div></div>;

  const contactMethods = [
    { label: `Call${inq.phone ? ' ' + inq.phone : ''}`, href: inq.phone ? `tel:${inq.phone.replace(/[^+\d]/g, '')}` : null, primary: true },
    { label: `Email ${inq.email}`, href: `mailto:${inq.email}`, primary: false },
    ...(inq.preferredContact && inq.preferredContact !== 'Email' ? [{ label: `Contact via ${inq.preferredContact}`, href: null, primary: false }] : [])
  ];

  return (
    <div className="a-page">
      <div className="a-page__head">
        <Link to="/admin/inquiries" className="a-back">← Inquiries</Link>
        <h1 className="a-page__title">{inq.name}</h1>
        <span className={`a-badge a-badge--${inq.status.toLowerCase()}`}>{statusLabel(inq.status)}</span>
      </div>

      <div className="a-grid a-grid--2">
        {/* Customer + Interest */}
        <div className="a-card">
          <h2 className="a-card__title">Customer Details</h2>
          <div className="a-kv-list">
            <div className="a-kv"><span>Name</span><span>{inq.name}</span></div>
            <div className="a-kv"><span>Email</span><span>{inq.email}</span></div>
            <div className="a-kv"><span>Phone</span><span>{inq.phone || '—'}</span></div>
            <div className="a-kv"><span>City</span><span>{inq.city || '—'}</span></div>
            <div className="a-kv"><span>Source</span><span>{inq.source || '—'}</span></div>
            <div className="a-kv"><span>Preferred</span><span>{inq.preferredContact || '—'}</span></div>
          </div>

          <div className="a-contact-actions">
            {contactMethods.map((m, i) => (
              <span key={i}>
                {m.href ? (
                  <a href={m.href} className={`a-btn a-btn--sm ${m.primary ? 'a-btn--primary' : 'a-btn--outline'}`}>
                    {m.primary && '📞 '}{m.label}
                  </a>
                ) : (
                  <span className="a-muted-text">{m.label}</span>
                )}
              </span>
            ))}
          </div>
        </div>

        <div className="a-card">
          <h2 className="a-card__title">Interested In</h2>
          {inq.artifactName ? (
            <div className="a-interest">
              <span className="a-interest__name">{inq.artifactName}</span>
              {inq.artifactId && (
                <span className="a-muted-text">Artifact #{inq.artifactId}</span>
              )}
            </div>
          ) : (
            <p className="a-muted-text">General enquiry</p>
          )}

          <h2 className="a-card__title a-card__title--spaced">Message</h2>
          <div className="a-message">{inq.message || 'No message provided.'}</div>
        </div>
      </div>

      {/* Status actions */}
      <div className="a-card">
        <h2 className="a-card__title">Update Status</h2>
        <div className="a-status-actions">
          <button type="button" className="a-btn a-btn--sm a-btn--primary" disabled={busy} onClick={() => changeStatus('CONTACTED')}>
            Mark as Contacted
          </button>
          <button type="button" className="a-btn a-btn--sm a-btn--amber" disabled={busy} onClick={() => changeStatus('FOLLOW_UP')}>
            Add Follow-up
          </button>
          <button type="button" className="a-btn a-btn--sm a-btn--green" disabled={busy} onClick={() => changeStatus('RESOLVED')}>
            Resolve
          </button>
          <button type="button" className="a-btn a-btn--sm a-btn--muted" disabled={busy} onClick={() => changeStatus('CLOSED')}>
            Close
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="a-card">
        <h2 className="a-card__title">Timeline</h2>
        <div className="a-timeline">
          <div className="a-timeline__item">
            <span className="a-timeline__dot" />
            <div>
              <span className="a-timeline__label">Created</span>
              <span className="a-timeline__date">{formatDate(inq.createdAt)}</span>
            </div>
          </div>
          <div className="a-timeline__item">
            <span className="a-timeline__dot" />
            <div>
              <span className="a-timeline__label">Last updated</span>
              <span className="a-timeline__date">{formatDate(inq.updatedAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="a-card">
        <h2 className="a-card__title">Admin Notes</h2>
        <textarea
          className="a-input"
          rows="3"
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
          placeholder="Private notes visible only to admins…"
        />
        <div className="a-card__actions">
          <button type="button" className="a-btn a-btn--sm a-btn--outline" disabled={busy} onClick={saveAdminNotes}>
            Save notes
          </button>
        </div>
      </div>

      {/* Conversation notes */}
      <div className="a-card">
        <h2 className="a-card__title">Internal Conversation</h2>
        <div className="a-notes">
          {(inq.notes || []).length === 0 && <div className="a-empty">No notes added yet.</div>}
          {(inq.notes || []).map((note) => (
            <div key={note.id} className="a-note">
              <div className="a-note__head">
                <span className="a-note__by">{note.createdBy || 'admin'}</span>
                <span className="a-note__date">{formatDate(note.createdAt)}</span>
              </div>
              <p className="a-note__body">{note.note}</p>
            </div>
          ))}
        </div>
        <form className="a-note-form" onSubmit={addNote}>
          <input
            className="a-input"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add a note…"
          />
          <button type="submit" className="a-btn a-btn--sm a-btn--primary" disabled={busy}>
            Add Note
          </button>
        </form>
      </div>
    </div>
  );
}