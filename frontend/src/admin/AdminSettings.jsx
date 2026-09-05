import { Link } from 'react-router-dom';
import { adminLogout } from '../lib/api';

export default function AdminSettings() {
  const username = localStorage.getItem('rw_admin_username') || 'admin';

  return (
    <div className="a-page">
      <div className="a-page__head">
        <h1 className="a-page__title">Settings</h1>
        <p className="a-page__sub">Account and system configuration</p>
      </div>

      <div className="a-grid a-grid--2">
        <div className="a-card">
          <h2 className="a-card__title">Administrator Account</h2>
          <div className="a-kv-list">
            <div className="a-kv"><span>Signed in as</span><span>{username}</span></div>
            <div className="a-kv"><span>Role</span><span>ROLE_ADMIN</span></div>
          </div>
          <p className="a-settings-note">
            Default credentials are defined via <code>RAAJWARASA_ADMIN_USERNAME</code> and{' '}
            <code>RAAJWARASA_ADMIN_PASSWORD</code> environment variables (or{' '}
            <code>application.properties</code>). Change them before going live.
          </p>
        </div>

        <div className="a-card">
          <h2 className="a-card__title">System Information</h2>
          <div className="a-kv-list">
            <div className="a-kv"><span>Backend API</span><span>Spring Boot · port 8080</span></div>
            <div className="a-kv"><span>Database</span><span>MySQL · raajwarasa</span></div>
            <div className="a-kv"><span>Authentication</span><span>JWT · 24h expiry</span></div>
            <div className="a-kv"><span>Uploads</span><span>Served from /uploads</span></div>
          </div>
        </div>
      </div>

      <div className="a-card">
        <h2 className="a-card__title">Session</h2>
        <p className="a-settings-note">
          Logging out clears the stored token from this browser. You will need to sign in again to
          manage the site.
        </p>
        <div className="a-card__actions">
          <button
            type="button"
            className="a-btn a-btn--danger"
            onClick={() => {
              adminLogout();
              window.location.href = '/admin/login';
            }}
          >
            Log out
          </button>
          <Link to="/" className="a-btn a-btn--ghost" target="_blank">
            View website ↗
          </Link>
        </div>
      </div>
    </div>
  );
}