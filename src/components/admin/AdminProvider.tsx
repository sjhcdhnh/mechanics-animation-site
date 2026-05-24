'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';

interface AdminContextValue {
  token: string | null;
  isLoginOpen: boolean;
  isPanelOpen: boolean;
  openLogin: () => void;
  closeLogin: () => void;
  openPanel: () => void;
  closePanel: () => void;
  setToken: (t: string | null) => void;
}

const AdminContext = createContext<AdminContextValue>({
  token: null,
  isLoginOpen: false,
  isPanelOpen: false,
  openLogin: () => {},
  closeLogin: () => {},
  openPanel: () => {},
  closePanel: () => {},
  setToken: () => {},
});

export function useAdmin() {
  return useContext(AdminContext);
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('admin_token');
    if (stored) setTokenState(stored);
  }, []);

  const setToken = useCallback((t: string | null) => {
    setTokenState(t);
    if (t) {
      localStorage.setItem('admin_token', t);
    } else {
      localStorage.removeItem('admin_token');
    }
  }, []);

  const openLogin = useCallback(() => setIsLoginOpen(true), []);
  const closeLogin = useCallback(() => setIsLoginOpen(false), []);
  const openPanel = useCallback(() => setIsPanelOpen(true), []);
  const closePanel = useCallback(() => setIsPanelOpen(false), []);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <AdminContext.Provider
      value={{ token, isLoginOpen, isPanelOpen, openLogin, closeLogin, openPanel, closePanel, setToken }}
    >
      {children}
    </AdminContext.Provider>
  );
}
