import React, { createContext, useContext, useState, useEffect } from "react";
import { authFetch } from "@/lib/utils";

interface User {
  email: string;
  id: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  loading: boolean;
  updateEmail: (newEmail: string, password: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (oldPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    try {
      // Try to get auth object (user+token) first
      const stored = localStorage.getItem("auth");
      if (stored) {
        const { user, token } = JSON.parse(stored);
        if (user && token) {
          setUser(user);
          setToken(token);
          localStorage.setItem("token", token);
          setLoading(false);
          return;
        }
      }
      // If not, try to get just the token
      const tokenOnly = localStorage.getItem("token");
      if (tokenOnly) {
        setToken(tokenOnly);
        // Try to fetch user info with token
        fetch("http://localhost:5050/api/auth/me", {
          headers: { Authorization: `Bearer ${tokenOnly}` },
        })
          .then(async (res) => {
            if (res.ok) {
              const data = await res.json();
              setUser(data.user || data); // depends on your API response
              localStorage.setItem("auth", JSON.stringify({ user: data.user || data, token: tokenOnly }));
            } else {
              setUser(null);
              setToken(null);
              localStorage.removeItem("auth");
              localStorage.removeItem("token");
            }
          })
          .catch(() => {
            setUser(null);
            setToken(null);
            localStorage.removeItem("auth");
            localStorage.removeItem("token");
          })
          .finally(() => setLoading(false));
        return;
      }
    } catch (e) {
      localStorage.removeItem("auth");
      localStorage.removeItem("token");
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5050/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem("auth", JSON.stringify({ user: data.user, token: data.token }));
        localStorage.setItem("token", data.token);
        setLoading(false);
        return { success: true };
      } else {
        setLoading(false);
        // Handle validation errors
        if (data.details && Array.isArray(data.details)) {
          const errorMessages = data.details.map((detail: any) => detail.message).join(', ');
          return { success: false, error: errorMessages };
        }
        return { success: false, error: data.error || "Login failed" };
      }
    } catch (err) {
      setLoading(false);
      return { success: false, error: "Network error" };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("auth");
    localStorage.removeItem("token");
  };



  const updateEmail = async (newEmail: string, password: string) => {
    setLoading(true);
    try {
      const res = await authFetch("http://localhost:5050/api/auth/update-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newEmail, password })
      });
      const data = await res.json();
      if (res.ok) {
        // Update user in state and localStorage
        const updatedUser = { ...user!, email: newEmail };
        setUser(updatedUser);
        localStorage.setItem("auth", JSON.stringify({ user: updatedUser, token }));
        setLoading(false);
        return { success: true };
      } else {
        setLoading(false);
        if (data.details && Array.isArray(data.details)) {
          const errorMessages = data.details.map((detail: any) => detail.message).join(', ');
          return { success: false, error: errorMessages };
        }
        return { success: false, error: data.error || "Failed to update email" };
      }
    } catch (err) {
      setLoading(false);
      return { success: false, error: "Network error" };
    }
  };

  const updatePassword = async (oldPassword: string, newPassword: string) => {
    setLoading(true);
    try {
      const res = await authFetch("http://localhost:5050/api/auth/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setLoading(false);
        return { success: true };
      } else {
        setLoading(false);
        if (data.details && Array.isArray(data.details)) {
          const errorMessages = data.details.map((detail: any) => detail.message).join(', ');
          return { success: false, error: errorMessages };
        }
        return { success: false, error: data.error || "Failed to update password" };
      }
    } catch (err) {
      setLoading(false);
      return { success: false, error: "Network error" };
    }
  };

  const forgotPassword = async (email: string) => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5050/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok) {
        setLoading(false);
        return { success: true };
      } else {
        setLoading(false);
        if (data.details && Array.isArray(data.details)) {
          const errorMessages = data.details.map((detail: any) => detail.message).join(', ');
          return { success: false, error: errorMessages };
        }
        return { success: false, error: data.error || "Failed to send reset code" };
      }
    } catch (err) {
      setLoading(false);
      return { success: false, error: "Network error" };
    }
  };

  const resetPassword = async (email: string, code: string, newPassword: string) => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5050/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setLoading(false);
        return { success: true };
      } else {
        setLoading(false);
        if (data.details && Array.isArray(data.details)) {
          const errorMessages = data.details.map((detail: any) => detail.message).join(', ');
          return { success: false, error: errorMessages };
        }
        return { success: false, error: data.error || "Failed to reset password" };
      }
    } catch (err) {
      setLoading(false);
      return { success: false, error: "Network error" };
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      login, 
      logout, 
      loading, 
      updateEmail, 
      updatePassword, 
      forgotPassword, 
      resetPassword 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}; 
