import { useState, useEffect } from "react";
import authService from "../services/authService";
import { AuthContext } from "./AuthContext.js";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await authService.getMe();
      setUser(res.data.data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    setUser(res.data.user);
    return res.data;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  };

  const register = async (name, email, password) => {
    const res = await authService.register({ name, email, password });
    return res.data;
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, register, checkAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
}