// Shared state for the whole app (agreed by all members).
// Every page reads data and calls actions from here, so a change made on one page
// (for example, accepting a request) is seen immediately on every other page.
// The state is saved in localStorage so the demo survives a page refresh.

import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useState } from 'react';
import { mockUsers } from '../data/mockUsers.js';
import { mockListings } from '../data/mockListings.js';
import { mockRequests } from '../data/mockRequests.js';
import { mockCategories } from '../data/mockCategories.js';
import { createId } from '../data/mockHelpers.js';

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
    if (saved) return { ...initialState(), ...JSON.parse(saved) };
  } catch {
    // storage unavailable or corrupted – start from the mock data
  }
  return initialState();
}

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, setState] = useState(loadState);
  const [toasts, setToasts] = useState([]);

  // Layout effect: the data is saved before the screen updates, so nothing is lost on a quick refresh.
  useLayoutEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // storage full (e.g. many large images) – keep working in memory
    }
  }, [state]);

  /* ---------- toasts ---------- */
  const toast = useCallback((message, kind = 'success') => {
    const id = createId('t');
    setToasts((t) => [...t, { id, message, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);
  const dismissToast = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  /* ---------- categories (M5) ---------- */
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
      addCategory,
      updateCategory,
      deleteCategory,
      resetDemo,
    };
  }, [state, toasts, toast, dismissToast, addCategory, updateCategory, deleteCategory, resetDemo]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}
