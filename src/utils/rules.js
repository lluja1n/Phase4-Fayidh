import { isPositiveInteger, isPositiveNumber } from '../data/mockHelpers.js';

export function isPubliclyVisible(listing, users) {
  if (listing.status !== 'available') return false;
  const owner = users.find((u) => u.id === listing.ownerId);
  return Boolean(owner && owner.status === 'active');
}

export function canRequest(user) {
  return Boolean(user && user.status === 'active' && (user.role === 'organization' || user.role === 'student'));
}


export function requestEligibility(user, listing, users = []) {
  if (!listing || listing.status === 'removed') return { allowed: false, reason: 'unavailable' };
  if (listing.status !== 'available' || listing.quantity <= 0) return { allowed: false, reason: 'unavailable' };
  if (users.length && !isPubliclyVisible(listing, users)) return { allowed: false, reason: 'unavailable' };
  if (!user) return { allowed: false, reason: 'guest' };
  if (user.role === 'admin') return { allowed: false, reason: 'admin' };
  if (!canRequest(user)) return { allowed: false, reason: 'suspended' };
  if (listing.ownerId === user.id) return { allowed: false, reason: 'own' };
  if (user.role === 'student' && !user.verified) return { allowed: false, reason: 'unverified' };
  if (listing.type === 'donation' && user.role === 'organization' && user.orgType !== 'educational') {
    return { allowed: false, reason: 'not-educational' };
  }
  return { allowed: true, reason: '' };
}

export const ELIGIBILITY_MESSAGES = {
  guest: 'Log in to submit a request.',
  unavailable: 'This item is no longer available.',
  own: 'This is your own listing.',
  admin: 'Admins cannot submit requests.',
  suspended: 'Your account cannot submit requests.',
  unverified: 'Verify your university email to request donations.',
  'not-educational': 'Donation requests are available only to educational institutions and verified university students.',
};

export function eligibilityMessage(reason, listingType) {
  if (reason === 'unverified' && listingType === 'sale') return 'Verify your university email to submit requests.';
  return ELIGIBILITY_MESSAGES[reason] || '';
}

export function validateRequestForm({ type, quantity, purpose }, listing) {
  const errors = { quantity: '', purpose: '' };
  if (!isPositiveInteger(quantity)) errors.quantity = 'Please enter a valid quantity.';
  else if (Number(quantity) > listing.quantity) errors.quantity = 'Requested quantity exceeds available stock.';
  if (type === 'donation' && !String(purpose || '').trim()) {
    errors.purpose = 'Please explain the purpose of your donation request.';
  }
  return errors;
}


export function validateListingForm(form, categories) {
  return {
    name: form.name.trim() ? '' : 'Item / material name is required.',
    categoryId: categories.some((c) => c.id === form.categoryId) ? '' : 'Please select a category.',
    quantity: isPositiveInteger(form.quantity) ? '' : 'Quantity must be a positive number.',
    condition: form.condition ? '' : 'Please select a condition.',
    location: form.location.trim() ? '' : 'Location is required.',
    type: form.type === 'sale' || form.type === 'donation' ? '' : 'Please select a listing type.',
    price: form.type === 'sale' && !isPositiveNumber(form.price) ? 'Please enter a valid price.' : '',
  };
}

export function applyAcceptance(listing, request) {
  if (request.status !== 'pending') return { error: 'This request is no longer pending.' };
  if (listing.status !== 'available') return { error: 'This item is no longer available.' };
  if (request.quantity > listing.quantity) return { error: 'Requested quantity exceeds available stock.' };
  const quantity = listing.quantity - request.quantity;
  return { listing: { ...listing, quantity, status: quantity === 0 ? 'unavailable' : 'available' } };
}

export function validateCategoryName(name, categories, ignoreId = null) {
  const clean = String(name).trim();
  if (!clean) return ignoreId ? 'Please enter a valid category name.' : 'Category name is required.';
  const dup = categories.some((c) => c.id !== ignoreId && c.name.trim().toLowerCase() === clean.toLowerCase());
  return dup ? 'This category already exists.' : '';
}

export function isCategoryInUse(categoryId, listings) {
  return listings.some((l) => l.categoryId === categoryId);
}

export function canSeeContact(request) {
  return request.status === 'accepted';
}
