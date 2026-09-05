import { useEffect } from 'react';
import { Routes, Route, Navigate, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { isAdminAuthed, adminLogout } from '../lib/api';

import Dashboard from './Dashboard';
import AdminArtifacts from './AdminArtifacts';
import AdminArtifactForm from './AdminArtifactForm';
import AdminInquiries from './AdminInquiries';
import AdminInquiryDetail from './AdminInquiryDetail';
import AdminJournal from './AdminJournal';
import AdminJournalForm from './AdminJournalForm';
import AdminCategories from './AdminCategories';
import AdminMedia from './AdminMedia';
import AdminOrders from './AdminOrders';
import AdminSettings from './AdminSettings';

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: '⌂', end: true },
  { to: '/admin/artifacts', label: 'Artifacts', icon: '◈' },
  { to: '/admin/categories', label: 'Categories', icon: '≡' },
  { to: '/admin/inquiries', label: 'Enquiries', icon: '✉' },
  { to: '/admin/orders', label: 'Orders', icon: '☰' },
  { to: '/admin/journal', label: 'Journal', icon: '✎' },
  { to: '/admin/media', label: 'Media', icon: '▣' },
  { to: '/admin/settings', label: 'Settings', icon: '⚙' }
];

function Sidebar({ open, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const username = localStorage.getItem('rw_admin_username') || 'admin';

  const handleLogout = () => {
    adminLogout();
    navigate('/admin/login');
  };

  return (
    <>
      {open && <div className="a-sidebar__backdrop" onClick={onClose} />}
      <aside className={`a-sidebar ${open ? 'a-sidebar--open' : ''}`}>
        <div className="a-sidebar__brand">
          <span className="a-sidebar__mark">रा</span>
          <div>
            <div className="a-sidebar__name">Raajwarasa</div>
            <div className="a-sidebar__role">Admin Panel</div>
          </div>
        </div>

        <nav className="a-sidebar__nav">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `a-sidebar__link ${isActive ? 'a-sidebar__link--active' : ''}`
              }
              onClick={onClose}
            >
              <span className="a-sidebar__icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="a-sidebar__foot">
          <div className="a-sidebar__user">
            <span className="a-sidebar__avatar">{username[0]?.toUpperCase()}</span>
            <div>
              <div className="a-sidebar__username">{username}</div>
              <div className="a-sidebar__usertag">Administrator</div>
            </div>
          </div>
          <a href="/" className="a-sidebar__view-site" target="_blank" rel="noreferrer">
            View website ↗
          </a>
          <button type="button" className="a-sidebar__logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

export default function AdminLayout() {
  const authed = isAdminAuthed();
  const location = useLocation();
  const { pathname } = location;

  const isForm = pathname.startsWith('/admin/artifacts/edit') || pathname.startsWith('/admin/journal/edit');
  const title = pathname.startsWith('/admin/inquiries') && !/\d$/.test(pathname) ? 'Inquiries'
    : isForm ? 'Edit'
    : '';

  useEffect(() => {
    if (authed) window.scrollTo(0, 0);
  }, [pathname, authed]);

  if (!authed) return <Navigate to="/admin/login" replace />;

  return (
    <div className="a-shell">
      <Sidebar open={false} onClose={() => {}} />
      <main className="a-main">
        <div className="a-main__bar">
          <span className="a-main__title">Raajwarasa Admin</span>
          <span className="a-main__crumb">{title || 'Overview'}</span>
        </div>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="artifacts" element={<AdminArtifacts />} />
          <Route path="artifacts/new" element={<AdminArtifactForm />} />
          <Route path="artifacts/edit/:id" element={<AdminArtifactForm />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="inquiries" element={<AdminInquiries />} />
          <Route path="inquiries/:id" element={<AdminInquiryDetail />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="journal" element={<AdminJournal />} />
          <Route path="journal/new" element={<AdminJournalForm />} />
          <Route path="journal/edit/:id" element={<AdminJournalForm />} />
          <Route path="media" element={<AdminMedia />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </main>
    </div>
  );
}