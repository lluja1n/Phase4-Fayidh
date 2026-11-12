// M1 – 3.1.1 Register an Organization Account & 3.1.3 Register as a University Student
// One page with two tabs (Phase 3, Figures 5.2.1 and 5.2.6).

import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext.jsx';
import { hasErrors, validateOrganizationSignUp, validateStudentSignUp } from '../../data/mockAuth.js';
import { CITIES, UNIVERSITIES } from '../../data/mockUsers.js';
import { Alert, PasswordField, SelectField, TextField } from '../../components/ui.jsx';

const EMPTY_ORG = { name: '', orgType: '', contactName: '', city: '', email: '', phone: '', password: '', confirmPassword: '', terms: false };
const EMPTY_STUDENT = { name: '', university: '', email: '', phone: '', password: '', confirmPassword: '', terms: false };

export default function SignUp() {
  const [params, setParams] = useSearchParams();
  const tab = params.get('type') === 'student' ? 'student' : 'organization';
  const { users, registerOrganization, registerStudent, toast } = useApp();
  const navigate = useNavigate();
  const [org, setOrg] = useState(EMPTY_ORG);
  const [student, setStudent] = useState(EMPTY_STUDENT);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const form = tab === 'student' ? student : org;
  const setForm = tab === 'student' ? setStudent : setOrg;

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    const next = { ...form, [name]: type === 'checkbox' ? checked : value };
    setForm(next);
    // Errors clear as soon as the user corrects the field
    if (submitted) setErrors(tab === 'student' ? validateStudentSignUp(next, users) : validateOrganizationSignUp(next, users));
  };

  const switchTab = (t) => {
    setParams(t === 'student' ? { type: 'student' } : {});
    setErrors({});
    setSubmitted(false);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    const errs = tab === 'student' ? validateStudentSignUp(student, users) : validateOrganizationSignUp(org, users);
    setErrors(errs);
    if (hasErrors(errs)) return;
    if (tab === 'student') {
      const user = registerStudent(student);
      toast('Account created. Check your university email to verify it.');
      navigate('/verify-student', { state: { justRegistered: true, email: user.email } });
    } else {
      const user = registerOrganization(org);
      navigate('/check-email', { state: { userId: user.id, email: user.email } });
    }
  };

  const err = (k) => errors[k] || '';

  return (
    <div className="auth-page">
      <div className="card auth-card auth-card-wide">
        <h1 style={{ fontSize: '1.7rem' }}>Create an account</h1>
        <p className="card-subtitle">Choose your account type, then fill in your details.</p>

        <div className="segmented" role="tablist" aria-label="Account type">
          <button type="button" role="tab" aria-selected={tab === 'organization'} onClick={() => switchTab('organization')}>
            Organization
          </button>
          <button type="button" role="tab" aria-selected={tab === 'student'} onClick={() => switchTab('student')}>
            University Student
          </button>
        </div>

        <p className="small muted" style={{ marginTop: -8 }}>
          {tab === 'organization'
            ? 'Organizations can sell and buy. Only educational institutions can request donations.'
            : 'University students can buy and request donations, but cannot create listings.'}
        </p>

        <form onSubmit={onSubmit} noValidate className="stack" role="tabpanel">
          {submitted && hasErrors(errors) && <Alert kind="error">Please fix the highlighted fields.</Alert>}

          {tab === 'organization' ? (
            <div className="form-grid">
              <TextField label="Organization name" name="name" value={org.name} onChange={onChange} error={err('name')} placeholder="e.g. Al Noor Factory" />
              <SelectField
                label="Organization type"
                name="orgType"
                value={org.orgType}
                onChange={onChange}
                error={err('orgType')}
                placeholder="Select type"
                hint="Only educational institutions can request donations."
                options={[
                  { value: 'business', label: 'Business' },
                  { value: 'educational', label: 'Educational Institution' },
                ]}
              />
              <TextField label="Contact person" name="contactName" value={org.contactName} onChange={onChange} error={err('contactName')} placeholder="Full name" />
              <SelectField label="City" name="city" value={org.city} onChange={onChange} error={err('city')} placeholder="Select city" options={CITIES.map((c) => ({ value: c, label: c }))} />
              <TextField label="Email" name="email" type="email" autoComplete="email" value={org.email} onChange={onChange} error={err('email')} placeholder="name@example.com" />
              <TextField label="Phone" name="phone" type="tel" value={org.phone} onChange={onChange} error={err('phone')} placeholder="05XXXXXXXX" />
              <PasswordField name="password" autoComplete="new-password" value={org.password} onChange={onChange} error={err('password')} placeholder="At least 8 characters" />
              <PasswordField label="Confirm password" name="confirmPassword" autoComplete="new-password" value={org.confirmPassword} onChange={onChange} error={err('confirmPassword')} placeholder="Re-enter password" />
            </div>
          ) : (
            <div className="form-grid">
              <TextField label="Full name" name="name" value={student.name} onChange={onChange} error={err('name')} placeholder="e.g. Reem Khalid" />
              <SelectField label="University" name="university" value={student.university} onChange={onChange} error={err('university')} placeholder="Select university" options={UNIVERSITIES.map((u) => ({ value: u, label: u }))} />
              <TextField label="University email" name="email" type="email" autoComplete="email" value={student.email} onChange={onChange} error={err('email')} placeholder="id@university.edu.sa" />
              <TextField label="Phone" name="phone" type="tel" value={student.phone} onChange={onChange} error={err('phone')} placeholder="05XXXXXXXX" />
              <PasswordField name="password" autoComplete="new-password" value={student.password} onChange={onChange} error={err('password')} placeholder="At least 8 characters" />
              <PasswordField label="Confirm password" name="confirmPassword" autoComplete="new-password" value={student.confirmPassword} onChange={onChange} error={err('confirmPassword')} placeholder="Re-enter password" />
              <div className="span-2">
                <Alert kind="info">Only university emails (e.g. ending in .edu.sa) are accepted. We will send a verification link to this email.</Alert>
              </div>
            </div>
          )}

          <div className="field">
            <label className="checkbox">
              <input type="checkbox" name="terms" checked={form.terms} onChange={onChange} aria-invalid={err('terms') ? 'true' : undefined} />
              I agree to the Terms and Privacy Policy
            </label>
            {err('terms') && <span className="field-error">{err('terms')}</span>}
          </div>

          <button type="submit" className="btn btn-primary btn-block">
            {tab === 'student' ? 'Create Student Account' : 'Create Account'}
          </button>
          <p className="small muted" style={{ margin: 0 }}>
            Already have an account? <Link to="/login">Log In</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
