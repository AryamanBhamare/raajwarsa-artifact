import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../lib/api';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await adminLogin(username, password);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err.status === 401 ? 'Invalid username or password.' : 'Cannot reach the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="a-login">
      <div className="a-login__card">
        <div className="a-login__brand">
          <span className="a-login__mark">रा</span>
          <div className="a-login__word">RAAJWARASA</div>
          <div className="a-login__sub">ADMIN ACCESS</div>
        </div>

        <form className="a-login__form" onSubmit={submit}>
          {error && <div className="a-login__error">{error}</div>}
          <div className="a-field">
            <label htmlFor="adm-user">Username</label>
            <input
              id="adm-user"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              autoFocus
              required
            />
          </div>
          <div className="a-field">
            <label htmlFor="adm-pass">Password</label>
            <input
              id="adm-pass"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          <button type="submit" className="a-btn a-btn--primary a-login__submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <a href="/" className="a-login__back">← Back to website</a>
      </div>
    </div>
  );
}