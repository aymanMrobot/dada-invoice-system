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
    try {
      const response = await fetch("/api/auth/check", {
        credentials: "include",
      });
      const data = await response.json();
      setState({
        isAuthenticated: data.authenticated,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState({
        isAuthenticated: false,
        isLoading: false,
        error: "Failed to check authentication",
      });
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      setState({
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }, []);

  return {
    ...state,
    logout,
    refresh: checkAuth,
  };
}
