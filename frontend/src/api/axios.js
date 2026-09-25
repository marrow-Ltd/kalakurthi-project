import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
});

// Attach the admin JWT (if any) to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("kalakruti_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Expired/invalid admin token -> clear it so the admin login screen shows again
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && localStorage.getItem("kalakruti_token")) {
      localStorage.removeItem("kalakruti_token");
    }
    return Promise.reject(err);
  }
);

export default api;
