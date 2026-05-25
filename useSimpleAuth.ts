import { useState, useEffect, useCallback } from "react";

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useSimpleAuth() {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  const checkAuth = useCallback(async () => {
    const isAuthenticated = localStorage.getItem("dada_auth") === "true";
    setState({ isAuthenticated, isLoading: false, error: null });
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const logout = useCallback(async () => {
    localStorage.removeItem("dada_auth");
    setState({ isAuthenticated: false, isLoading: false, error: null });
    window.location.href = "/";
  }, []);

  return {
    ...state,
    logout,
    refresh: checkAuth,
  };
}
