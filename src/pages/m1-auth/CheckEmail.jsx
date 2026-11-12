// M1 – 3.1.1 "Check your email" after an organization signs up (Figure 5.2.3).
// There is no real email service, so a "Demo inbox" box lets you open the
// activation link (valid or expired) to test both cases.

import { Link, Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext.jsx';

export default function CheckEmail() {
  const { state } = useLocation();
  const { getUser, toast } = useApp();
  const user = state?.userId ? getUser(state.userId) : null;

  if (!user) return <Navigate to="/signup" replace />;
  if (user.status === 'active') return <Navigate to="/login" replace />;

  return (
    <div className="auth-page">
      <div className="card auth-card" style={{ textAlign: 'center' }}>
        <div className="icon-circle" aria-hidden="true">✉</div>
        <h1 style={{ fontSize: '1.6rem' }}>Check your email</h1>
        <p className="muted">
          Account created. We sent an activation link to <strong>{user.email}</strong>. Click the link to activate your account.
        </p>
        <p className="small muted">
          Didn&apos;t get it?{' '}
          <button type="button" className="link-btn" onClick={() => toast('A new activation email has been sent.', 'info')}>
            Resend email
          </button>
        </p>
        <div className="demo-box" style={{ textAlign: 'left', marginTop: 16 }}>
          <strong>Demo inbox (simulation)</strong>
          <p className="small muted">Fayidh has no real email service in this front-end, so open the link here:</p>
          <div className="row">
            <Link className="btn btn-primary btn-sm" to={`/activate/${user.id}`}>
              Open activation link
            </Link>
            <Link className="btn btn-sm" to={`/activate/${user.id}?expired=1`}>
              Open an expired link
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
