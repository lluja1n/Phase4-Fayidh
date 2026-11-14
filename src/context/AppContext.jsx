
import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useState } from 'react';
import { mockUsers } from '../data/mockUsers.js';
import { mockListings } from '../data/mockListings.js';
import { mockRequests } from '../data/mockRequests.js';
import { mockCategories } from '../data/mockCategories.js';
import { buildOrganization, buildStudent, checkLogin } from '../data/mockAuth.js';
import { createId, today } from '../data/mockHelpers.js';
import { applyAcceptance } from '../utils/rules.js';

const STORAGE_KEY = 'fayidh-demo-state-v1';

const initialState = () => ({
  users: mockUsers,
  listings: mockListings,
  requests: mockRequests,
  categories: mockCategories,
  attempts: {},
  currentUserId: null,
});

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      const savedState = JSON.parse(saved);

      // Update images for existing mock listings
      const updatedListings = (savedState.listings ?? mockListings).map(
        (listing) => {
          const updatedMock = mockListings.find(
            (item) => item.id === listing.id
          );

          return updatedMock
            ? { ...listing, images: updatedMock.images }
            : listing;
        }
      );

      return {
        ...initialState(),
        ...savedState,
        listings: updatedListings,
      };
    }
  } catch {
    // Use initial data if saved data cannot be loaded
  }

  return initialState();
}

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, setState] = useState(loadState);
  const [toasts, setToasts] = useState([]);

  useLayoutEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
    }
  }, [state]);

  const toast = useCallback((message, kind = 'success') => {
    const id = createId('t');
    setToasts((t) => [...t, { id, message, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);
  const dismissToast = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const login = useCallback(
    (email, password, portal = 'user', mode) => {
      const result = checkLogin({ users: state.users, attempts: state.attempts, email, password, portal, mode });
      setState((s) => ({ ...s, attempts: result.attempts, currentUserId: result.ok ? result.user.id : s.currentUserId }));
      return result;
    },
    [state.users, state.attempts],
  );

  const logout = useCallback(() => setState((s) => ({ ...s, currentUserId: null })), []);

  const registerOrganization = useCallback((form) => {
    const user = buildOrganization(form);
    setState((s) => ({ ...s, users: [...s.users, user] }));
    return user;
  }, []);

  const registerStudent = useCallback((form) => {
    const user = buildStudent(form);
    setState((s) => ({ ...s, users: [...s.users, user], currentUserId: user.id }));
    return user;
  }, []);

  const updateUser = useCallback((id, changes) => {
    setState((s) => ({ ...s, users: s.users.map((u) => (u.id === id ? { ...u, ...changes } : u)) }));
  }, []);

  const activateAccount = useCallback((id) => updateUser(id, { status: 'active' }), [updateUser]);
  const verifyStudent = useCallback((id) => updateUser(id, { verified: true }), [updateUser]);

  const createListing = useCallback((data) => {
    const listing = { ...data, id: createId('l'), status: 'available', createdAt: today() };
    setState((s) => ({ ...s, listings: [listing, ...s.listings] }));
    return listing;
  }, []);

  const updateListing = useCallback((id, changes) => {
    setState((s) => ({ ...s, listings: s.listings.map((l) => (l.id === id ? { ...l, ...changes } : l)) }));
  }, []);

  const removeListing = useCallback((id) => updateListing(id, { status: 'removed' }), [updateListing]);

  const createRequest = useCallback((data) => {
    const request = { ...data, id: createId('r'), status: 'pending', reason: '', createdAt: today() };
    setState((s) => ({ ...s, requests: [request, ...s.requests] }));
    return request;
  }, []);

  const setRequest = (s, id, changes) => s.requests.map((r) => (r.id === id ? { ...r, ...changes } : r));

  const cancelRequest = useCallback(
    (id) => {
      const req = state.requests.find((r) => r.id === id);
      if (!req || req.status !== 'pending') return { error: 'This request can no longer be cancelled.' };
      setState((s) => ({ ...s, requests: setRequest(s, id, { status: 'cancelled' }) }));
      return { ok: true };
    },
    [state.requests],
  );

  const acceptRequest = useCallback(
    (id) => {
      const req = state.requests.find((r) => r.id === id);
      const listing = req && state.listings.find((l) => l.id === req.listingId);
      if (!req || !listing) return { error: 'Request not found.' };
      const result = applyAcceptance(listing, req);
      if (result.error) return result;
      setState((s) => ({
        ...s,
        requests: setRequest(s, id, { status: 'accepted', decidedAt: today() }),
        listings: s.listings.map((l) => (l.id === listing.id ? result.listing : l)),
      }));
      return { ok: true };
    },
    [state.requests, state.listings],
  );

  const rejectRequest = useCallback(
    (id, reason) => {
      const req = state.requests.find((r) => r.id === id);
      if (!req || req.status !== 'pending') return { error: 'This request is no longer pending.' };
      setState((s) => ({ ...s, requests: setRequest(s, id, { status: 'rejected', reason: reason.trim(), decidedAt: today() }) }));
      return { ok: true };
    },
    [state.requests],
  );

  const addCategory = useCallback((name, description = '') => {
    const cat = { id: createId('cat'), name: name.trim(), description: description.trim() };
    setState((s) => ({ ...s, categories: [...s.categories, cat] }));
  }, []);
  const updateCategory = useCallback((id, changes) => {
    setState((s) => ({ ...s, categories: s.categories.map((c) => (c.id === id ? { ...c, ...changes } : c)) }));
  }, []);
  const deleteCategory = useCallback((id) => {
    setState((s) => ({ ...s, categories: s.categories.filter((c) => c.id !== id) }));
  }, []);

  const resetDemo = useCallback(() => {
    setState(initialState());
    toast('Demo data has been reset.', 'info');
  }, [toast]);

  const value = useMemo(() => {
    const currentUser = state.users.find((u) => u.id === state.currentUserId) || null;
    return {
      ...state,
      currentUser,
      toasts,
      toast,
      dismissToast,
      getUser: (id) => state.users.find((u) => u.id === id),
      getListing: (id) => state.listings.find((l) => l.id === id),
      getCategory: (id) => state.categories.find((c) => c.id === id),
      login,
      logout,
      registerOrganization,
      registerStudent,
      updateUser,
      activateAccount,
      verifyStudent,
      createListing,
      updateListing,
      removeListing,
      createRequest,
      cancelRequest,
      acceptRequest,
      rejectRequest,
      setUserStatus: (id, status) => updateUser(id, { status }),
      addCategory,
      updateCategory,
      deleteCategory,
      resetDemo,
    };
  }, [state, toasts, toast, dismissToast, login, logout, registerOrganization, registerStudent, updateUser, activateAccount, verifyStudent, createListing, updateListing, removeListing, createRequest, cancelRequest, acceptRequest, rejectRequest, addCategory, updateCategory, deleteCategory, resetDemo]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}
