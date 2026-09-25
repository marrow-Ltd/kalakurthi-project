import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";

// Admin-only auth (username + password stored in MongoDB). Customers never sign in.
const AuthContext = createContext(null);
const TOKEN_KEY = "kalakruti_token";

export const AuthProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // On load, validate any stored token (only matters if someone has visited /admin before)
  const loadSession = useCallback(async () => {
    if (!localStorage.getItem(TOKEN_KEY)) {
      setLoading(false);
      return;
    }
    try {
      await api.get("/admin/verify");
      setIsAdmin(true);
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const login = async (username, password) => {
    try {
      const { data } = await api.post("/admin/login", { username, password });
      localStorage.setItem(TOKEN_KEY, data.token);
      setIsAdmin(true);
      toast.success("Welcome back! 🧵");
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed. Please try again.");
      return false;
    }
  };

  // Changing the password invalidates old tokens; the server returns a fresh one
  const changePassword = async (currentPassword, newPassword) => {
    try {
      const { data } = await api.put("/admin/password", { currentPassword, newPassword });
      localStorage.setItem(TOKEN_KEY, data.token);
      toast.success("Password updated.");
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update password.");
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setIsAdmin(false);
    toast.success("You've been signed out.");
  };

  return (
    <AuthContext.Provider value={{ isAdmin, loading, login, logout, changePassword }}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
