import { describe, expect, it } from 'vitest';
import {
  applyAcceptance,
  isCategoryInUse,
  isPubliclyVisible,
  requestEligibility,
  validateCategoryName,
  validateListingForm,
  validateRequestForm,
} from './rules.js';
import { checkLogin, homePathFor, validateOrganizationSignUp, validateStudentSignUp } from '../data/mockAuth.js';
import { isStrongPassword, isUniversityEmail, validateImageFile } from '../data/mockHelpers.js';
import { mockUsers } from '../data/mockUsers.js';
import { mockListings } from '../data/mockListings.js';
import { mockCategories } from '../data/mockCategories.js';

const user = (id) => mockUsers.find((u) => u.id === id);
const listing = (id) => mockListings.find((l) => l.id === id);
const business = user('u-org-1');
const school = user('u-org-2');
const verifiedStudent = user('u-stu-1');
const unverifiedStudent = user('u-stu-2');
const donationByOrg1 = listing('l-1'); 
const saleByOrg3 = listing('l-4'); 
const donationByOrg3 = listing('l-3');

describe('Sign up (3.1.1, 3.1.3)', () => {
  it('requires a strong password', () => {
    expect(isStrongPassword('short1')).toBe(false);
    expect(isStrongPassword('onlyletters')).toBe(false);
    expect(isStrongPassword('Fayidh123')).toBe(true);
  });
  it('rejects an email that is already registered', () => {
    const errors = validateOrganizationSignUp(
      { name: 'X', orgType: 'business', contactName: 'Y', city: 'Dammam', email: 'sara@alnoor.com', phone: '0551234567', password: 'Fayidh123', confirmPassword: 'Fayidh123', terms: true },
      mockUsers,
    );
    expect(errors.email).toBe('This email is already registered.');
  });
  it('accepts only university emails for students', () => {
    expect(isUniversityEmail('s2023@kfupm.edu.sa')).toBe(true);
    expect(isUniversityEmail('reem@gmail.com')).toBe(false);
    const errors = validateStudentSignUp(
      { name: 'Reem', university: 'KSU', email: 'reem@gmail.com', phone: '0551234567', password: 'Fayidh123', confirmPassword: 'Fayidh123', terms: true },
      mockUsers,
    );
    expect(errors.email).toBe('Please use your university email.');
  });
});

describe('Log in (3.1.2, 3.1.7)', () => {
  it('logs in an active organization and sends it to the dashboard', () => {
    const r = checkLogin({ users: mockUsers, attempts: {}, email: 'sara@alnoor.com', password: 'Fayidh123', mode: 'organization' });
    expect(r.ok).toBe(true);
    expect(homePathFor(r.user)).toBe('/dashboard');
  });
  it('blocks suspended accounts', () => {
    const r = checkLogin({ users: mockUsers, attempts: {}, email: 'omar@fakesupplies.com', password: 'Fayidh123' });
    expect(r.code).toBe('suspended');
  });
  it('locks the account after 5 wrong attempts', () => {
    let attempts = {};
    let r;
    for (let i = 0; i < 5; i++) {
      r = checkLogin({ users: mockUsers, attempts, email: 'sara@alnoor.com', password: 'wrong' });
      attempts = r.attempts;
    }
    expect(r.code).toBe('locked');
    const again = checkLogin({ users: mockUsers, attempts, email: 'sara@alnoor.com', password: 'Fayidh123' });
    expect(again.code).toBe('locked');
  });
  it('only admins can use the admin login, and admins cannot use the user login', () => {
    expect(checkLogin({ users: mockUsers, attempts: {}, email: 'sara@alnoor.com', password: 'Fayidh123', portal: 'admin' }).code).toBe('not-admin');
    expect(checkLogin({ users: mockUsers, attempts: {}, email: 'admin@fayidh.com', password: 'Admin1234', portal: 'admin' }).ok).toBe(true);
    expect(checkLogin({ users: mockUsers, attempts: {}, email: 'admin@fayidh.com', password: 'Admin1234', portal: 'user' }).ok).toBe(false);
  });
});

describe('Request eligibility (3.3.3 – 3.3.5)', () => {
  it('asks guests to log in', () => {
    expect(requestEligibility(null, saleByOrg3, mockUsers).reason).toBe('guest');
  });
  it('lets educational institutions and verified students request donations', () => {
    expect(requestEligibility(school, donationByOrg1, mockUsers).allowed).toBe(true);
    expect(requestEligibility(verifiedStudent, donationByOrg1, mockUsers).allowed).toBe(true);
  });
  it('blocks businesses and unverified students from donations', () => {
    expect(requestEligibility(business, donationByOrg3, mockUsers).reason).toBe('not-educational');
    expect(requestEligibility(unverifiedStudent, donationByOrg1, mockUsers).reason).toBe('unverified');
  });
  it('lets a business buy, but not request its own listing', () => {
    expect(requestEligibility(business, saleByOrg3, mockUsers).allowed).toBe(true);
    expect(requestEligibility(business, listing('l-2'), mockUsers).reason).toBe('own');
  });
  it('hides removed listings and listings of suspended organizations', () => {
    expect(isPubliclyVisible(listing('l-7'), mockUsers)).toBe(false);
    expect(requestEligibility(school, listing('l-7'), mockUsers).reason).toBe('unavailable');
  });
});

describe('Request form validation', () => {
  it('rejects quantities that are not positive whole numbers or exceed stock', () => {
    expect(validateRequestForm({ type: 'purchase', quantity: '0' }, saleByOrg3).quantity).toBe('Please enter a valid quantity.');
    expect(validateRequestForm({ type: 'purchase', quantity: '1.5' }, saleByOrg3).quantity).toBe('Please enter a valid quantity.');
    expect(validateRequestForm({ type: 'purchase', quantity: '99' }, saleByOrg3).quantity).toBe('Requested quantity exceeds available stock.');
    expect(validateRequestForm({ type: 'purchase', quantity: '2' }, saleByOrg3).quantity).toBe('');
  });
  it('requires a purpose for donations', () => {
    expect(validateRequestForm({ type: 'donation', quantity: '1', purpose: '  ' }, donationByOrg1).purpose).toBe('Please explain the purpose of your donation request.');
  });
});

describe('Accepting a request updates stock (3.2.8)', () => {
  it('reduces quantity and marks the listing out of stock at 0', () => {
    const l = { ...saleByOrg3, quantity: 3 };
    expect(applyAcceptance(l, { status: 'pending', quantity: 1 }).listing.quantity).toBe(2);
    const last = applyAcceptance(l, { status: 'pending', quantity: 3 }).listing;
    expect(last.quantity).toBe(0);
    expect(last.status).toBe('unavailable');
  });
  it('refuses requests that are not pending or exceed stock', () => {
    expect(applyAcceptance(saleByOrg3, { status: 'accepted', quantity: 1 }).error).toBeTruthy();
    expect(applyAcceptance(saleByOrg3, { status: 'pending', quantity: 50 }).error).toBe('Requested quantity exceeds available stock.');
  });
});

describe('Listings (3.2.1 – 3.2.4)', () => {
  const valid = { name: 'Chairs', categoryId: 'cat-2', quantity: '3', condition: 'New', location: 'Dammam', type: 'sale', price: '20' };
  it('requires a price only for sale listings', () => {
    expect(validateListingForm({ ...valid, price: '' }, mockCategories).price).toBe('Please enter a valid price.');
    expect(validateListingForm({ ...valid, type: 'donation', price: '' }, mockCategories).price).toBe('');
  });
  it('checks image type and size', () => {
    expect(validateImageFile({ type: 'image/gif', size: 100 })).toMatch(/Unsupported image format/);
    expect(validateImageFile({ type: 'image/png', size: 3 * 1024 * 1024 })).toMatch(/maximum allowed file size/);
    expect(validateImageFile({ type: 'image/png', size: 1000 })).toBe('');
  });
});

describe('Categories (3.4.8 – 3.4.9)', () => {
  it('prevents empty and duplicate names regardless of letter case', () => {
    expect(validateCategoryName('  ', mockCategories)).toBe('Category name is required.');
    expect(validateCategoryName('electronics', mockCategories)).toBe('This category already exists.');
    expect(validateCategoryName('Electronics', mockCategories, 'cat-1')).toBe('');
  });
  it('detects categories that are in use', () => {
    expect(isCategoryInUse('cat-1', mockListings)).toBe(true);
    expect(isCategoryInUse('cat-5', mockListings)).toBe(false);
  });
});
