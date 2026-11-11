import { useEffect, useState } from 'react';
import { Link, NavLink, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';

const NAV = {
  guest: [
    ['/', 'Home'],
    ['/browse', 'Browse'],
  ],
  organization: [
    ['/dashboard', 'Dashboard'],
    ['/browse', 'Browse'],
    ['/seller/listings', 'My Listings'],
    ['/seller/requests', 'Requests'],
    ['/my-requests', 'My Requests'],
    ['/profile', 'Profile'],
  ],
  student: [
    ['/browse', 'Browse'],
    ['/my-requests', 'My Requests'],
    ['/profile', 'Profile'],
  ],
  admin: [], 
};

export function Navbar() {
  const { currentUser, logout, toast } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const role = currentUser?.role || 'guest';

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    const wasAdmin = currentUser?.role === 'admin';
    logout();
    toast('You have been logged out.', 'info');
    navigate(wasAdmin ? '/admin/login' : '/');
  };

  return (
    <header className={`navbar ${open ? 'open' : ''}`}>
      <div className="container navbar-inner">
        <Link to={role === 'admin' ? '/admin' : '/'} className="brand" aria-label="Fayidh home">
          <span className="brand-mark" aria-hidden="true">F</span>
          Fayidh
          {role === 'admin' && <span className="brand-tag">ADMIN</span>}
        </Link>
        <button type="button" className="menu-toggle" aria-expanded={open} aria-controls="main-nav" onClick={() => setOpen((o) => !o)}>
          {open ? 'Close' : 'Menu'}
        </button>
        <nav id="main-nav" className="nav-links" aria-label="Main">
          {NAV[role].map(([to, label]) => (
            <NavLink key={to} to={to} end={to === '/' || to === '/admin'}>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="nav-actions">
          {currentUser ? (
            <>
              <span className="nav-user" title={currentUser.email}>
                {currentUser.name}
              </span>
              <button type="button" className="btn btn-sm" onClick={handleLogout}>
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" state={{ from: location.pathname }} className="btn btn-sm">
                Log In
              </Link>
              <Link to="/signup" className="btn btn-sm btn-primary">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  const { resetDemo } = useApp();
  return (
    <footer className="footer">
      <div className="container row-between">
        <span>© 2026 Fayidh · SWE 363 – Team 5</span>
        <button type="button" className="link-btn small" onClick={resetDemo}>
          Reset demo data
        </button>
      </div>
    </footer>
  );
}

export function Toasts() {
  const { toasts, dismissToast } = useApp();
  return (
    <div className="toast-stack" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.kind}`} role="status">
          <span>{t.message}</span>
          <button type="button" onClick={() => dismissToast(t.id)} aria-label="Dismiss">
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

export function AppLayout({ children }) {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  return (
    <div className="app-shell">
      <a href="#main" className="sr-only">
        Skip to content
      </a>
      <Navbar />
      <main id="main" className="app-main">
        {children}
      </main>
      <Footer />
      <Toasts />
    </div>
  );
}


export function RequireRole({ roles, children }) {
  const { currentUser } = useApp();
  const location = useLocation();
  if (!currentUser) {
    const adminArea = roles.includes('admin') && roles.length === 1;
    return <Navigate to={adminArea ? '/admin/login' : '/login'} replace state={{ from: location.pathname, loginRequired: true }} />;
  }
  if (!roles.includes(currentUser.role)) {
    return <Navigate to="/forbidden" replace />;
  }
  return children;
}

export function SideLayout({ links, children }) {
  return (
    <div className="container page">
      <div className="side-layout">
        <nav className="side-nav" aria-label="Section">
          {links.map(([to, label]) => (
            <NavLink key={to} to={to} end>
              {label}
            </NavLink>
          ))}
        </nav>
        <div>{children}</div>
      </div>
    </div>
  );
}

export const ADMIN_LINKS = [
  ['/admin', 'Dashboard'],
  ['/admin/users', 'Users'],
  ['/admin/listings', 'Listings'],
  ['/admin/categories', 'Categories'],
];
