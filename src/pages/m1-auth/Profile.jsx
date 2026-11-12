// M1 – 3.1.5 Manage Organization Profile & 3.1.6 Manage Student Profile (Figures 5.2.9 – 5.2.10)

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext.jsx';
import { CITIES, UNIVERSITIES } from '../../data/mockUsers.js';
import {
  hasErrors,
  isStrongPassword,
  isUniversityEmail,
  isValidEmail,
  isValidPhone,
  readFileAsDataUrl,
} from '../../data/mockHelpers.js';
import { Alert, Badge, PasswordField, SelectField, TextAreaField, TextField, initials } from '../../components/ui.jsx';

const LOGO_TYPES = ['image/jpeg', 'image/png'];
const LOGO_MAX = 2 * 1024 * 1024;

function OrganizationForm({ user }) {
  const { updateUser, toast } = useApp();
  const [form, setForm] = useState({
    name: user.name,
    contactName: user.contactName,
    phone: user.phone,
    city: user.city,
    address: user.address || '',
    description: user.description || '',
    logo: user.logo || '',
  });
  const [errors, setErrors] = useState({});

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onLogo = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!LOGO_TYPES.includes(file.type) || file.size > LOGO_MAX) {
      setErrors({ ...errors, logo: 'Please upload a JPG or PNG image under 2 MB.' });
      return;
    }
    const logo = await readFileAsDataUrl(file);
    setForm((f) => ({ ...f, logo }));
    setErrors({ ...errors, logo: '' });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const errs = {
      name: form.name.trim() ? '' : 'This field is required.',
      contactName: form.contactName.trim() ? '' : 'This field is required.',
      phone: isValidPhone(form.phone) ? '' : 'Enter a valid phone number (05XXXXXXXX).',
      city: form.city ? '' : 'This field is required.',
    };
    setErrors(errs);
    if (hasErrors(errs)) return;
    updateUser(user.id, { ...form, name: form.name.trim(), contactName: form.contactName.trim() });
    toast('Profile updated successfully.');
  };

  const reset = () => {
    setForm({ name: user.name, contactName: user.contactName, phone: user.phone, city: user.city, address: user.address || '', description: user.description || '', logo: user.logo || '' });
    setErrors({});
  };

  return (
    <form onSubmit={onSubmit} noValidate className="stack">
      {hasErrors(errors) && <Alert kind="error">Please fix the highlighted fields.</Alert>}
      <div className="profile-head">
        <div className="avatar square">{form.logo ? <img src={form.logo} alt={`${user.name} logo`} /> : initials(user.name)}</div>
        <div className="stack" style={{ gap: 6 }}>
          <label className="btn btn-sm" style={{ width: 'fit-content' }}>
            Upload new logo
            <input type="file" accept="image/png,image/jpeg" onChange={onLogo} className="sr-only" />
          </label>
          <span className="small muted">JPG or PNG, max 2 MB</span>
          {errors.logo && <span className="field-error">{errors.logo}</span>}
        </div>
      </div>
      <div className="form-grid">
        <TextField label="Organization name" name="name" value={form.name} onChange={onChange} error={errors.name} />
        <TextField
          label="Organization type (cannot be changed)"
          value={user.orgType === 'educational' ? 'Educational Institution' : 'Business'}
          readOnly
          hint="It decides whether the organization can request donations."
        />
        <TextField label="Contact person" name="contactName" value={form.contactName} onChange={onChange} error={errors.contactName} />
        <TextField label="Email (cannot be changed)" value={user.email} readOnly />
        <TextField label="Phone" name="phone" value={form.phone} onChange={onChange} error={errors.phone} />
        <SelectField label="City" name="city" value={form.city} onChange={onChange} error={errors.city} options={CITIES.map((c) => ({ value: c, label: c }))} />
        <TextField label="Address" name="address" value={form.address} onChange={onChange} className="span-2" />
        <TextAreaField label="Description" name="description" value={form.description} onChange={onChange} className="span-2" hint="Shown to buyers on your listings." />
      </div>
      <div className="form-actions">
        <button type="button" className="btn" onClick={reset}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          Save Changes
        </button>
      </div>
    </form>
  );
}

function StudentForm({ user }) {
  const { users, updateUser, toast } = useApp();
  const [form, setForm] = useState({ name: user.name, university: user.university, email: user.email, phone: user.phone, city: user.city || '' });
  const [errors, setErrors] = useState({});

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = (e) => {
    e.preventDefault();
    const email = form.email.trim().toLowerCase();
    let emailError = '';
    if (!isValidEmail(email)) emailError = 'Enter a valid email address.';
    else if (!isUniversityEmail(email)) emailError = 'Please use your university email.';
    else if (users.some((u) => u.id !== user.id && u.email.toLowerCase() === email)) emailError = 'This email is already registered.';
    const errs = {
      name: form.name.trim() ? '' : 'This field is required.',
      university: form.university ? '' : 'This field is required.',
      email: emailError,
      phone: isValidPhone(form.phone) ? '' : 'Enter a valid phone number (05XXXXXXXX).',
    };
    setErrors(errs);
    if (hasErrors(errs)) return;
    const emailChanged = email !== user.email;
    updateUser(user.id, { ...form, name: form.name.trim(), email, ...(emailChanged ? { verified: false } : {}) });
    toast(emailChanged ? 'Please verify your new university email. Requests are paused until it is verified.' : 'Profile updated successfully.', emailChanged ? 'info' : 'success');
  };

  return (
    <form onSubmit={onSubmit} noValidate className="stack">
      {hasErrors(errors) && <Alert kind="error">Please fix the highlighted fields.</Alert>}
      {!user.verified && (
        <Alert kind="warning">
          <p>
            Please verify your university email. Requests are paused until it is verified. <Link to="/verify-student">Verify now</Link>
          </p>
        </Alert>
      )}
      <div className="form-grid">
        <TextField label="Full name" name="name" value={form.name} onChange={onChange} error={errors.name} />
        <TextField label="Account type (cannot be changed)" value="University Student" readOnly />
        <SelectField label="University" name="university" value={form.university} onChange={onChange} error={errors.university} options={UNIVERSITIES.map((u) => ({ value: u, label: u }))} />
        <TextField label="University email" name="email" type="email" value={form.email} onChange={onChange} error={errors.email} hint="Changing it requires verifying the new email." />
        <TextField label="Phone" name="phone" value={form.phone} onChange={onChange} error={errors.phone} />
        <SelectField label="City" name="city" value={form.city} onChange={onChange} placeholder="Select city" options={CITIES.map((c) => ({ value: c, label: c }))} />
      </div>
      <div className="form-actions">
        <button type="button" className="btn" onClick={() => setForm({ name: user.name, university: user.university, email: user.email, phone: user.phone, city: user.city || '' })}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          Save Changes
        </button>
      </div>
    </form>
  );
}

function ChangePassword({ user }) {
  const { updateUser, toast } = useApp();
  const empty = { current: '', next: '', confirm: '' };
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = (e) => {
    e.preventDefault();
    const errs = {
      current: form.current === user.password ? '' : 'Current password is incorrect.',
      next: isStrongPassword(form.next) ? '' : 'At least 8 characters, with letters and numbers.',
      confirm: form.confirm && form.confirm === form.next ? '' : 'Passwords do not match.',
    };
    setErrors(errs);
    if (hasErrors(errs)) return;
    updateUser(user.id, { password: form.next });
    setForm(empty);
    toast('Password updated successfully.');
  };

  return (
    <form onSubmit={onSubmit} noValidate className="card stack">
      <h2 style={{ fontSize: '1.15rem', margin: 0 }}>Change password</h2>
      <div className="grid grid-3">
        <PasswordField label="Current password" name="current" value={form.current} onChange={onChange} error={errors.current} autoComplete="current-password" />
        <PasswordField label="New password" name="next" value={form.next} onChange={onChange} error={errors.next} autoComplete="new-password" />
        <PasswordField label="Confirm new password" name="confirm" value={form.confirm} onChange={onChange} error={errors.confirm} autoComplete="new-password" />
      </div>
      <div>
        <button type="submit" className="btn">
          Update Password
        </button>
      </div>
    </form>
  );
}

export default function Profile() {
  const { currentUser: user } = useApp();
  const isOrg = user.role === 'organization';
  return (
    <div className="container page">
      <div className="profile-head">
        <div className={`avatar ${isOrg ? 'square' : ''}`}>{user.logo ? <img src={user.logo} alt="" /> : initials(user.name)}</div>
        <div>
          <h1 style={{ marginBottom: 4 }}>{user.name}</h1>
          <div className="row">
            {isOrg ? (
              <Badge status="neutral">{user.orgType === 'educational' ? 'Educational Institution' : 'Business'}</Badge>
            ) : (
              <Badge status={user.verified ? 'verified' : 'unverified'} />
            )}
            <span className="muted small">{isOrg ? user.city : user.university}</span>
          </div>
        </div>
      </div>
      <div className="stack" style={{ gap: 24 }}>
        <div className="card">
          <h2 style={{ fontSize: '1.15rem' }}>{isOrg ? 'Edit organization profile' : 'Edit profile'}</h2>
          {isOrg ? <OrganizationForm key={user.id} user={user} /> : <StudentForm key={user.id + user.email} user={user} />}
        </div>
        <ChangePassword user={user} />
      </div>
    </div>
  );
}
