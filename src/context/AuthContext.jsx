import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const api = axios.create({
  baseURL: "",
  withCredentials: true,
});

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          localStorage.removeItem("token");
          setUser(null);
        } else {
          setUser({
            userId: payload.userId,
            email: payload.email,
            username: payload.username,
            isAdmin: payload.isAdmin,
            token,
          });
        }
      } catch {
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/signin", { email, password });
      if (response.data.success) {
        const token = response.data.token;
        localStorage.setItem("token", token);
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUser({
          userId: payload.userId,
          email: payload.email,
          username: payload.username,
          isAdmin: payload.isAdmin,
          token,
        });
        return { success: true };
      }
      return { success: false, message: response.data.message };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Something went wrong",
      };
    }
  };

  const adminLogin = async (email, password) => {
    try {
      const response = await api.post("/admin/signin", { email, password });
      if (response.data.success) {
        const token = response.data.token;
        localStorage.setItem("token", token);
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUser({
          userId: payload.userId,
          email: payload.email,
          username: payload.username,
          isAdmin: payload.isAdmin,
          token,
        });
        return { success: true };
      }
      return { success: false, message: response.data.message };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Something went wrong",
      };
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/signout");
    } catch (err) {
      console.log("Signout error:", err);
    }
    localStorage.removeItem("token");
    setUser(null);
  };

  const sendForgotPasswordCode = async (email) => {
    try {
      const response = await api.patch("/auth/send-forgot-password-code", {
        email,
      });
      return { success: true, message: response.data.message };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Failed to send code",
      };
    }
  };

  const changePassword = async (oldPassword, newPassword) => {
    try {
      const response = await api.patch("/auth/change-password", {
        oldPassword,
        newPassword,
      });
      return { success: true, message: response.data.message };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Failed to change password",
      };
    }
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        adminLogin,
        logout,
        loading,
        getAuthHeaders,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
