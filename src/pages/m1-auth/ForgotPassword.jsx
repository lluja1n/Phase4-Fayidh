// M1 – 3.1.2 "Forgot password?" → reset link sent.

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { isValidEmail } from '../../data/mockHelpers.js';
import { TextField } from '../../components/ui.jsx';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const onSubmit = (e) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setError('Enter a valid email address.');
      return;
    }
    // For privacy, the same message is shown whether or not the email is registered.
    setSent(true);
  };

  return (
    <div className="auth-page">
      <div className="card auth-card">
        {sent ? (
          <div style={{ textAlign: 'center' }}>
            <div className="icon-circle" aria-hidden="true">✉</div>
            <h1 style={{ fontSize: '1.6rem' }}>Check your email</h1>
            <p className="muted">
              If <strong>{email}</strong> is registered, we sent a password reset link to it. The link is valid for 1 hour.
            </p>
            <Link to="/login" className="btn btn-primary btn-block">
              Back to Log In
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate className="stack">
            <div>
              <h1 style={{ fontSize: '1.6rem' }}>Forgot password?</h1>
              <p className="muted" style={{ margin: 0 }}>
                Enter your email and we will send you a link to reset your password.
              </p>
            </div>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              error={error}
              placeholder="name@example.com"
            />
            <button type="submit" className="btn btn-primary btn-block">
              Send reset link
            </button>
            <Link to="/login" className="small">
              ← Back to Log In
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
