// M1 – 3.1.2 Log In
// Opens as a pop-up over the home page (Phase 3, Figure 5.2.4).
// Organizations log in with email + password; students use "Log in with University Email".

import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext.jsx';
import { homePathFor } from '../../data/mockAuth.js';
import { Alert, Modal, PasswordField, TextField } from '../../components/ui.jsx';
import Home from '../m2-browse/Home.jsx';

export default function Login() {
  const { login, toast } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;
  const [mode, setMode] = useState('organization');
  const [form, setForm] = useState({ email: '', password: '', remember: true });
  const [error, setError] = useState(null);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const onSubmit = (e) => {
    e.preventDefault();
    const result = login(form.email, form.password, 'user', mode);
    if (!result.ok) {
      setError(result);
      return;
    }
    toast(`Welcome back, ${result.user.name}.`);
    const safeFrom = from && !['/login', '/signup'].includes(from) ? from : null;
    navigate(safeFrom || homePathFor(result.user), { replace: true });
  };

  const switchMode = (m) => {
    setMode(m);
    setError(null);
  };

  return (
    <>
      <div aria-hidden="true" inert>
        <Home />
      </div>
      <Modal title={mode === 'student' ? 'Student log in' : 'Log in to Fayidh'} onClose={() => navigate('/')}>
        <p className="muted">{mode === 'student' ? 'Use the university email you registered with.' : 'Welcome back. Log in to continue.'}</p>
        <form className="stack" onSubmit={onSubmit} noValidate>
          {location.state?.loginRequired && !error && <Alert kind="info">Please log in to continue.</Alert>}
          {error && (
            <Alert kind="error">
              <p>{error.error}</p>
              {error.code === 'not-activated' && (
                <Link to="/check-email" state={{ userId: error.user.id, email: error.user.email }}>
                  Resend activation email
                </Link>
              )}
            </Alert>
          )}
          <TextField
            label={mode === 'student' ? 'University email' : 'Email'}
            name="email"
            type="email"
            autoComplete="email"
            placeholder={mode === 'student' ? 'id@university.edu.sa' : 'name@example.com'}
            value={form.email}
            onChange={onChange}
            required
          />
          <PasswordField name="password" autoComplete="current-password" placeholder="Enter your password" value={form.password} onChange={onChange} required />
          <div className="row-between">
            <label className="checkbox">
              <input type="checkbox" name="remember" checked={form.remember} onChange={onChange} />
              Remember me
            </label>
            <Link to="/forgot-password" className="small">
              Forgot password?
            </Link>
          </div>
          <button type="submit" className="btn btn-primary btn-block">
            Log In
          </button>
          <div className="divider">{mode === 'student' ? 'Are you an organization?' : 'Are you a student?'}</div>
          {mode === 'organization' ? (
            <button type="button" className="btn btn-block" onClick={() => switchMode('student')}>
              Log in with University Email
            </button>
          ) : (
            <button type="button" className="btn btn-block" onClick={() => switchMode('organization')}>
              Log in as an Organization
            </button>
          )}
          <p className="small muted" style={{ margin: 0 }}>
            Don&apos;t have an account? <Link to="/signup">Sign Up</Link>
          </p>
        </form>
      </Modal>
    </>
  );
}
