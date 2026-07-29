import axios from "axios";

const api = axios.create({
  baseURL: (import.meta.env.PROD ? "" : "http://localhost:8000"),
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
