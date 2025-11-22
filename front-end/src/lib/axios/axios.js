import axios from "axios";
import store from "@/redux/store.js";
import { logout, setCredentials } from "@/redux/slices/authSlice.js";
import { mapUserRole } from "@/app/services/workers/userRoleMapper.js";

const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL?.trim() || "";

if (!API_BASE_URL) {
    console.warn("NEXT_PUBLIC_BASE_URL is empty. Check your .env");
}

// Axios instance used by application (has interceptors)
const axiosRequester = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

// Simple axios instance WITHOUT our interceptors — used for refresh to avoid recursion
const plainAxios = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
});

// ------------ REQUEST INTERCEPTOR -------------
axiosRequester.interceptors.request.use(
    (config) => {
        const state = store.getState();
        const token = state.auth?.token;

        // Accept-Language: compute once here
        let lang = "en";
        if (typeof window !== "undefined") {
            try {
                const urlLang = new URL(window.location.href).searchParams.get("lang");
                const storedLang = localStorage.getItem("lang") || sessionStorage.getItem("lang");
                lang = urlLang || storedLang || lang;
            } catch (_) { /* ignore */ }
        }
        // ensure correct grouping of ternary
        config.headers = {
            ...(config.headers || {}),
            "Accept-Language": config.headers["Accept-Language"] ?? (lang === "en" ? "en-US" : "ar-EG"),
        };

        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ------------ FLAG TO PREVENT MULTIPLE REFRESH CALLS -------------
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) prom.reject(error);
        else prom.resolve(token);
    });
    failedQueue = [];
};

// ------------ RESPONSE INTERCEPTOR -------------
axiosRequester.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If no response or config, just reject
        if (!originalRequest) return Promise.reject(error);

        // 401 handling + refresh flow
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            // If already refreshing, queue this request
            if (isRefreshing) {
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                })
                    .then((newToken) => {
                        originalRequest.headers["Authorization"] = "Bearer " + newToken;
                        return axiosRequester(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            // start refresh
            isRefreshing = true;
            try {
                // Use plainAxios (no interceptors) to avoid infinite loop
                // Adjust path if your backend uses a different refresh route
                const refreshResp = await plainAxios.post("/auth/refresh", {}, { withCredentials: true });
                const { user, token: newToken } = refreshResp.data;

                const mappedUser = mapUserRole(user);
                store.dispatch(setCredentials({ user: mappedUser, token: newToken }));

                processQueue(null, newToken);
                isRefreshing = false;

                // retry original with new token
                originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
                return axiosRequester(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                isRefreshing = false;
                store.dispatch(logout());
                return Promise.reject(refreshError);
            }
        }

        // 403 handling (optional)
        if (error.response?.status === 403) {
            console.warn("Access denied (403)");
        }

        return Promise.reject(error);
    }
);

export default axiosRequester;
export { plainAxios };
