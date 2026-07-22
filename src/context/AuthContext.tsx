"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";

export interface User {
  id: number;
  name: string;
  email: string;
  role: "user" | "super_admin";
  createdAt?: string;
  updatedAt?: string;
}

export interface SessionInfo {
  id: number;
  userAgent: string;
  ipAddress: string;
  expiresAt: string;
  createdAt: string;
  isCurrentDevice: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, role?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  getSessions: () => Promise<SessionInfo[]>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const userRef = useRef<User | null>(null);

  // Keep userRef synced without triggering useEffect dependencies
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // Helper for API calls with automatic refresh retry on 401
  const fetchWithAuth = useCallback(async (url: string, options: RequestInit = {}) => {
    let res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    // If 401, try to refresh token once
    if (res.status === 401) {
      const refreshRes = await fetch("/api/v1/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (refreshRes.ok) {
        // Retry original request
        res = await fetch(url, {
          ...options,
          headers: {
            "Content-Type": "application/json",
            ...options.headers,
          },
        });
      }
    }

    return res;
  }, []);

  const checkAuth = useCallback(async (isInitial = false) => {
    if (isInitial) {
      setIsLoading(true);
    }
    try {
      const res = await fetchWithAuth("/api/v1/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser((prev) => {
          if (
            prev &&
            prev.id === data.user.id &&
            prev.name === data.user.name &&
            prev.email === data.user.email &&
            prev.role === data.user.role
          ) {
            return prev; // Preserve object reference to prevent re-render loops
          }
          return data.user;
        });
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      if (isInitial) {
        setIsLoading(false);
      }
    }
  }, [fetchWithAuth]);

  useEffect(() => {
    // Initial load check with loading spinner
    checkAuth(true);

    // Auto-check session validity whenever tab/window gains focus
    const handleFocus = () => {
      checkAuth(false);
    };

    // Background poll every 15 seconds ONLY if user is logged in
    const interval = setInterval(() => {
      if (userRef.current) {
        checkAuth(false);
      }
    }, 15000);

    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
      clearInterval(interval);
    };
  }, [checkAuth]);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || "Login failed" };
      }

      setUser(data.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Network error" };
    }
  };

  const register = async (name: string, email: string, password: string, role?: string) => {
    try {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || "Registration failed" };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Network error" };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/v1/auth/logout", { method: "POST" });
    } finally {
      setUser(null);
    }
  };

  const logoutAll = async () => {
    try {
      await fetchWithAuth("/api/v1/auth/logout-all", { method: "POST" });
    } finally {
      setUser(null);
    }
  };

  const getSessions = async (): Promise<SessionInfo[]> => {
    try {
      const res = await fetchWithAuth("/api/v1/auth/sessions");
      if (res.ok) {
        const data = await res.json();
        return data.sessions || [];
      }
    } catch (err) {
      console.error("Failed to fetch sessions", err);
    }
    return [];
  };

  const handleManualCheckAuth = async () => {
    await checkAuth(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        logoutAll,
        getSessions,
        checkAuth: handleManualCheckAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
