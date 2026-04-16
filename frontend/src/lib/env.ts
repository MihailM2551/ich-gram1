const fallbackApiUrl = import.meta.env.DEV ? "http://localhost:5000/api" : "/api";
const apiUrl = import.meta.env.VITE_API_URL ?? fallbackApiUrl;

const isAbsoluteApiUrl = /^https?:\/\//i.test(apiUrl);
const browserOrigin = typeof window !== "undefined" ? window.location.origin : "";

export const API_URL = apiUrl;
export const API_ORIGIN = isAbsoluteApiUrl ? apiUrl.replace(/\/api\/?$/, "") : browserOrigin;
