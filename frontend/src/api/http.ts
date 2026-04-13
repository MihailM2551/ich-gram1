import axios from "axios";
import { API_URL } from "../lib/env";
import { storage } from "../lib/storage";

export const http = axios.create({
  baseURL: API_URL,
});

http.interceptors.request.use((config) => {
  const token = storage.getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      storage.clearAuth();
    }

    return Promise.reject(error);
  },
);
