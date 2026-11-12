export function createId(prefix) {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export function today() {
  return new Date().toISOString().slice(0, 10);
}

export function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatPrice(price) {
  return `SAR ${Number(price).toLocaleString('en-US')}`;
}

/* ---------------- Field validation ---------------- */

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const PHONE_RE = /^05\d{8}$/;
export const UNIVERSITY_EMAIL_RE = /^[^\s@]+@[^\s@]+\.edu(\.[a-z]{2})?$/i;

export function isValidEmail(value) {
  return EMAIL_RE.test(String(value).trim());
}

export function isValidPhone(value) {
  return PHONE_RE.test(String(value).trim());
}

export function isUniversityEmail(value) {
  return UNIVERSITY_EMAIL_RE.test(String(value).trim());
}

/** At least 8 characters with letters and numbers (3.1.1). */
export function isStrongPassword(value) {
  const v = String(value);
  return v.length >= 8 && /[A-Za-z]/.test(v) && /\d/.test(v);
}

/** A positive whole number, e.g. a quantity. */
export function isPositiveInteger(value) {
  if (value === '' || value === null || value === undefined) return false;
  const n = Number(value);
  return Number.isInteger(n) && n > 0;
}

/** A positive number, e.g. a price. */
export function isPositiveNumber(value) {
  if (value === '' || value === null || value === undefined) return false;
  const n = Number(value);
  return Number.isFinite(n) && n > 0;
}

export function hasErrors(errors) {
  return Object.values(errors).some(Boolean);
}

/* ---------------- Images (3.2.4) ---------------- */

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2 MB
export const MAX_IMAGES = 5;

export function validateImageFile(file) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return 'Unsupported image format. Please upload a valid image file.';
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return 'Image exceeds the maximum allowed file size.';
  }
  return '';
}

export function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/** Simulates a network call so pages can show loading and error states. */
export function simulateRequest(result, { delay = 350, fail = false } = {}) {
  return new Promise((resolve, reject) => {
    setTimeout(() => (fail ? reject(new Error('Unable to load. Please try again.')) : resolve(result)), delay);
  });
}
