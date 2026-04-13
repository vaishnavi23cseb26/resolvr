import React, { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { apiLogin, apiLogout, apiMe, apiRegister, type User } from "../api/auth";
import { setAccessToken } from "../api/http";

type AuthState = {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
};

export const AuthContext = createContext<AuthState | null>(null);

function extractErrorMessage(err: any) {
  return err?.response?.data?.message || err?.message || "Something went wrong";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshMe = useCallback(async () => {
    try {
      setError(null);
      const res = await apiMe();
      setUser(res?.data?.user || null);
    } catch (err) {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        await refreshMe();
      } finally {
        setLoading(false);
      }
    })();
  }, [refreshMe]);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      setError(null);
      const res = await apiLogin({ email, password });
      setUser(res?.data?.user || null);
    } catch (err) {
      setError(extractErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      setError(null);
      const res = await apiRegister({ name, email, password });
      setUser(res?.data?.user || null);
    } catch (err) {
      setError(extractErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      setError(null);
      await apiLogout();
    } finally {
      setAccessToken(null);
      setUser(null);
      setLoading(false);
    }
  }, []);

  const value = useMemo<AuthState>(
    () => ({ user, loading, error, login, register, logout, refreshMe }),
    [user, loading, error, login, register, logout, refreshMe]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

