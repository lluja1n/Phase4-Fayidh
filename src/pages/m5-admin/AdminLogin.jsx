
 //M5 - Admin Login (FR 3.1.7)
 //Only existing admin accounts can log in here.

import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext.jsx';
import { Alert, PasswordField, TextField } from '../../components/ui.jsx';

export default function AdminLogin() {
  const { login, currentUser, toast } = useApp();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const onSubmit = (e) => {
    e.preventDefault();

    const result = login(form.email, form.password, 'admin');

    if (!result.ok) {
      setError(result.error);
      return;
    }

    toast('Welcome, Admin.');
    navigate('/admin', { replace: true });
  };

  if (currentUser?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="auth-page">
      <form className="card auth-card stack" onSubmit={onSubmit} noValidate>
        <div>
          <span className="brand-tag">ADMIN</span>
          <h1 style={{ fontSize: '1.6rem', marginTop: 10 }}>
            Admin Log In
          </h1>
          <p className="muted" style={{ margin: 0 }}>
            Admin access only. Admin accounts are created by the Fayidh team;
            sign up is not available.
          </p>
        </div>

        {error && <Alert kind="error">{error}</Alert>}

        <TextField
          label="Email"
          name="email"
          type="email"
          autoComplete="username"
          value={form.email}
          onChange={onChange}
          placeholder="admin@fayidh.com"
        />

        <PasswordField
          name="password"
          autoComplete="current-password"
          value={form.password}
          onChange={onChange}
          placeholder="Enter your password"
        />

        <button type="submit" className="btn btn-primary btn-block">
          Log In
        </button>
      </form>
    </div>
  );
}
