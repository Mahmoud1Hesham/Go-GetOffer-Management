import axios from "axios";
// import { store } from "@/redux/store.js"; // removed to fix circular dependency
import { logout, setCredentials } from "@/redux/slices/authSlice.js";
import { mapUserRole } from "@/app/services/workers/userRoleMapper.js";

let store; // Will be injected

export const injectStore = (_store) => {
    store = _store;
};

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
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
        'ngrok-skip-browser-warning': process.env.MOOD === 'dev' ? 'true' : 'false'
    },
});

// ------------ REQUEST INTERCEPTOR -------------
// Keep request interceptor small and synchronous: read token from the
// Redux store and attach Authorization header if present. Removed
// token-waiter and Accept-Language logic to simplify behavior.
axiosRequester.interceptors.request.use((config) => {
    const state = store.getState();
    const token = state?.auth?.token || null;

    // Compute Accept-Language synchronously and safely (browser-only).
    // Default language is Arabic per request; fallback to English if detected otherwise.
    let acceptLang = 'ar-EG';
    if (typeof window !== 'undefined') {
        try {
            const urlLang = new URL(window.location.href).searchParams.get('lang');
            const storedLang = localStorage.getItem('lang') || sessionStorage.getItem('lang');
            const raw = (urlLang || storedLang || 'ar').toString().toLowerCase();
            acceptLang = raw.startsWith('ar') ? 'ar-EG' : 'en-US';
        } catch (_) {
            // ignore errors and keep default Arabic
        }
    }

    config.headers = {
        ...(config.headers || {}),
        'Accept-Language': config.headers?.['Accept-Language'] ?? acceptLang,
    };

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
}, (error) => Promise.reject(error));

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

        // If this request is the refresh call itself, do not try to refresh again
        if (originalRequest._isRefresh) {
            return Promise.reject(error);
        }

        // 401 handling + refresh flow
        if (error.response?.status === 401 && !originalRequest._retry) {
            // if the app is currently running its auth initializer (refresh in progress), don't trigger another refresh
            try {
                const state = store.getState();
                if (state?.auth?.loading) {
                    return Promise.reject(error);
                }
            } catch (_) {}
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
            let apiUser = null;
            let newToken = null;
            try {
                // Send the refresh request through the same axios instance so
                // the browser will attach cookies (withCredentials is true).
                // Mark this request so the interceptor won't try to refresh it.
                const refreshResp = await axiosRequester.post('/api/staff/auth/refresh-token', {}, { withCredentials: true, _isRefresh: true });

                // tolerate multiple response shapes from backend
                const r = refreshResp?.data || {};
                newToken = r?.data?.accessToken || r?.data?.token || r?.token || r?.accessToken || r?.data?.access_token || r?.access_token || null;
                // Use the full API user payload (r.data) when available so mapUserRole
                // can read `role`, `role.roleKey`, and other fields. Fall back to r.user.
                apiUser = r?.data || r?.user || null;

                const mappedUser = apiUser ? mapUserRole(apiUser) : null;
                if (mappedUser || newToken) {
                    store.dispatch(setCredentials({ user: mappedUser, token: newToken }));
                }

                processQueue(null, newToken);
                isRefreshing = false;

                // retry original with new token
                originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                return axiosRequester(originalRequest);
            } catch (refreshError) {
                        let mappedUser = null;
                        if (apiUser) {
                            mappedUser = mapUserRole(apiUser);
                        } else if (newToken) {
                            // preserve existing user if refresh returned only token
                            try {
                                const existingUser = store.getState()?.auth?.user || null;
                                if (!mappedUser && existingUser) mappedUser = existingUser;
                            } catch (e) {
                                // ignore store read errors
                            }
                        }
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
