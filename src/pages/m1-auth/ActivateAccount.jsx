// M1 – 3.1.1 Activation link result: "Your account is active" or "This link has expired".

import { useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext.jsx';

export default function ActivateAccount() {
  const { userId } = useParams();
  const [params] = useSearchParams();
  const { getUser, activateAccount } = useApp();
  const user = getUser(userId);
  const expired = params.get('expired') === '1';
  const done = user?.status === 'active';

  useEffect(() => {
    if (user && !expired && user.status === 'pending') activateAccount(user.id);
  }, [user, expired, activateAccount]);

  if (!user || expired) {
    return (
      <div className="auth-page">
        <div className="card auth-card" style={{ textAlign: 'center' }}>
          <div className="icon-circle error" aria-hidden="true">!</div>
          <h1 style={{ fontSize: '1.6rem' }}>This link has expired</h1>
          <p className="muted">Activation links are valid for 24 hours. Request a new one below.</p>
          {user ? (
            <Link to="/check-email" state={{ userId: user.id }} className="btn btn-primary btn-block">
              Resend email
            </Link>
          ) : (
            <Link to="/signup" className="btn btn-primary btn-block">
              Go to Sign Up
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="card auth-card" style={{ textAlign: 'center' }}>
        <div className="icon-circle success" aria-hidden="true">✓</div>
        <h1 style={{ fontSize: '1.6rem' }}>{done ? 'Your account is active' : 'Activating…'}</h1>
        {done && <p className="muted">Your account is active. You can now log in.</p>}
        <Link to="/login" className="btn btn-primary btn-block">
          Go to Log In
        </Link>
      </div>
    </div>
  );
}
