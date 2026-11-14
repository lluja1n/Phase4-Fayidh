// M1 – 3.1.4 Verify University Email (Figures 5.2.7 – 5.2.8).
// The "Demo inbox" simulates clicking the link in the email (valid or expired).

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext.jsx';
import { Alert, Badge } from '../../components/ui.jsx';

const RESEND_SECONDS = 60;

export default function VerifyStudent() {
  const { currentUser, verifyStudent, toast } = useApp();
  const [seconds, setSeconds] = useState(RESEND_SECONDS);
  const [linkState, setLinkState] = useState(null); // null | 'expired'

  useEffect(() => {
    if (seconds <= 0) return undefined;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  if (currentUser.verified) {
    return (
      <div className="auth-page">
        <div className="card auth-card" style={{ textAlign: 'center' }}>
          <div className="icon-circle success" aria-hidden="true">✓</div>
          <h1 style={{ fontSize: '1.6rem' }}>You&apos;re verified!</h1>
          <p>
            <Badge status="verified" />
          </p>
          <p className="muted">Your student account is verified. You can now request donations.</p>
          <Link to="/browse" className="btn btn-primary btn-block">
            Start browsing
          </Link>
        </div>
      </div>
    );
  }

  const resend = () => {
    setSeconds(RESEND_SECONDS);
    setLinkState(null);
    toast('A new verification link has been sent.', 'info');
  };

  const openValidLink = () => {
    verifyStudent(currentUser.id);
    toast('Your student account is verified. You can now request donations.');
  };

  return (
    <div className="auth-page">
      <div className="card auth-card" style={{ textAlign: 'center' }}>
        <div className={`icon-circle ${linkState === 'expired' ? 'error' : ''}`} aria-hidden="true">
          {linkState === 'expired' ? '!' : '✉'}
        </div>
        <h1 style={{ fontSize: '1.6rem' }}>{linkState === 'expired' ? 'Link not valid' : 'Verify your university email'}</h1>
        {linkState === 'expired' ? (
          <Alert kind="error">This link is invalid or has expired.</Alert>
        ) : (
          <p className="muted">
            We sent a verification link to <strong>{currentUser.email}</strong>. The link is valid for 24 hours.
          </p>
        )}
        <p className="small muted" style={{ marginTop: 12 }}>
          Didn&apos;t get it?{' '}
          {seconds > 0 ? (
            <span>Resend link (available in {seconds}s)</span>
          ) : (
            <button type="button" className="link-btn" onClick={resend}>
              Resend link
            </button>
          )}
        </p>
        <Link to="/browse" className="btn btn-block">
          Browse listings meanwhile
        </Link>
        <div className="demo-box" style={{ textAlign: 'left', marginTop: 16 }}>
          <strong>Demo inbox (simulation)</strong>
          <p className="small muted">There is no real email service, so open the link here:</p>
          <div className="row">
            <button type="button" className="btn btn-primary btn-sm" onClick={openValidLink}>
              Open verification link
            </button>
            <button type="button" className="btn btn-sm" onClick={() => setLinkState('expired')}>
              Open an expired link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
