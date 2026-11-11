import {
  createId,
  hasErrors,
  isStrongPassword,
  isUniversityEmail,
  isValidEmail,
  isValidPhone,
  today,
} from './mockHelpers.js';

export const MAX_USER_ATTEMPTS = 5; 
export const MAX_ADMIN_ATTEMPTS = 3; 
export const LOCK_MINUTES = 15;

function findByEmail(users, email) {
  const e = String(email).trim().toLowerCase();
  return users.find((u) => u.email.toLowerCase() === e);
}


export function validateOrganizationSignUp(form, users) {
  const errors = {
    name: form.name.trim() ? '' : 'Organization name is required.',
    orgType: form.orgType ? '' : 'Please choose an organization type.',
    contactName: form.contactName.trim() ? '' : 'Contact person is required.',
    city: form.city ? '' : 'Please choose a city.',
    email: !isValidEmail(form.email)
      ? 'Enter a valid email address.'
      : findByEmail(users, form.email)
        ? 'This email is already registered.'
        : '',
    phone: isValidPhone(form.phone) ? '' : 'Enter a valid phone number (05XXXXXXXX).',
    password: isStrongPassword(form.password) ? '' : 'At least 8 characters, with letters and numbers.',
    confirmPassword: form.confirmPassword === form.password && form.confirmPassword ? '' : 'Passwords do not match.',
    terms: form.terms ? '' : 'You must accept the terms.',
  };
  return errors;
}

export function validateStudentSignUp(form, users) {
  let email = '';
  if (!isValidEmail(form.email)) email = 'Enter a valid email address.';
  else if (!isUniversityEmail(form.email)) email = 'Please use your university email.';
  else if (findByEmail(users, form.email)) email = 'This email is already registered.';
  return {
    name: form.name.trim() ? '' : 'Full name is required.',
    university: form.university ? '' : 'Please choose your university.',
    email,
    phone: isValidPhone(form.phone) ? '' : 'Enter a valid phone number (05XXXXXXXX).',
    password: isStrongPassword(form.password) ? '' : 'At least 8 characters, with letters and numbers.',
    confirmPassword: form.confirmPassword === form.password && form.confirmPassword ? '' : 'Passwords do not match.',
    terms: form.terms ? '' : 'You must accept the terms.',
  };
}

export function buildOrganization(form) {
  return {
    id: createId('u-org'),
    role: 'organization',
    orgType: form.orgType,
    name: form.name.trim(),
    contactName: form.contactName.trim(),
    email: form.email.trim().toLowerCase(),
    password: form.password,
    phone: form.phone.trim(),
    city: form.city,
    address: '',
    description: '',
    status: 'pending', 
    createdAt: today(),
  };
}

export function buildStudent(form) {
  return {
    id: createId('u-stu'),
    role: 'student',
    name: form.name.trim(),
    university: form.university,
    email: form.email.trim().toLowerCase(),
    password: form.password,
    phone: form.phone.trim(),
    city: '',
    verified: false, 
    status: 'active',
    createdAt: today(),
  };
}

export { hasErrors };



/**
 * Checks a login attempt.
 * @param {object} args
 * @param {Array} args.users
 * @param {object} args.attempts  { [email]: { count, lockedUntil } }
 * @param {'user'|'admin'} args.portal  which login page is used
 * @param {'organization'|'student'} [args.mode]  (user portal only)
 * @param {number} [args.now]
 * @returns {{ ok: boolean, user?: object, error?: string, code?: string, attempts: object }}
 */
export function checkLogin({ users, attempts, email, password, portal = 'user', mode, now = Date.now() }) {
  const key = String(email).trim().toLowerCase();
  const max = portal === 'admin' ? MAX_ADMIN_ATTEMPTS : MAX_USER_ATTEMPTS;
  const record = attempts[key] || { count: 0, lockedUntil: 0 };

  if (!key || !password) {
    return { ok: false, code: 'required', error: 'Please enter your email and password.', attempts };
  }
  if (record.lockedUntil && record.lockedUntil > now) {
    return { ok: false, code: 'locked', error: `Too many attempts. Try again in ${LOCK_MINUTES} minutes.`, attempts };
  }

  const user = findByEmail(users, key);
  const fail = (code, error) => {
    const count = record.count + 1;
    const next = {
      ...attempts,
      [key]: { count: count >= max ? 0 : count, lockedUntil: count >= max ? now + LOCK_MINUTES * 60000 : 0 },
    };
    if (count >= max) {
      return { ok: false, code: 'locked', error: `Too many attempts. Try again in ${LOCK_MINUTES} minutes.`, attempts: next };
    }
    return { ok: false, code, error, attempts: next };
  };

  if (!user || user.password !== password) return fail('wrong', 'Incorrect email or password.');

  const cleared = { ...attempts };
  delete cleared[key];

  if (portal === 'admin' && user.role !== 'admin') {
    return { ok: false, code: 'not-admin', error: 'You do not have access to the admin dashboard.', attempts: cleared };
  }
  if (portal === 'user' && user.role === 'admin') {
    return { ok: false, code: 'use-admin', error: 'Admins must log in from the admin login page.', attempts: cleared };
  }
  if (portal === 'user' && mode === 'student' && user.role !== 'student') {
    return { ok: false, code: 'not-student', error: 'This is not a university student account. Use the organization login.', attempts: cleared };
  }
  if (portal === 'user' && mode === 'organization' && user.role === 'student') {
    return { ok: false, code: 'is-student', error: 'Students log in with "Log in with University Email".', attempts: cleared };
  }
  if (user.status === 'pending') {
    return { ok: false, code: 'not-activated', error: 'Please activate your account first.', attempts: cleared, user };
  }
  if (user.status === 'suspended') {
    return { ok: false, code: 'suspended', error: 'Your account has been suspended. Please contact support.', attempts: cleared };
  }
  return { ok: true, user, attempts: cleared };
}

export function homePathFor(user) {
  if (!user) return '/';
  if (user.role === 'admin') return '/admin';
  if (user.role === 'organization') return '/dashboard';
  return '/browse';
}
