import axios from "axios";
import store from "@/redux/store.js";
import { logout, setCredentials } from "@/redux/slices/authSlice.js";
import { mapUserRole } from "@/app/services/workers/userRoleMapper.js";

const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

// ------------ REQUEST INTERCEPTOR -------------
axiosInstance.interceptors.request.use(
    (config) => {
        const state = store.getState();
        const token = state.auth?.token;

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
axiosInstance.interceptors.response.use(
    (response) => response, // normal response
    async (error) => {
        const originalRequest = error.config;

        // ------------------ 401 Unauthorized ------------------
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const state = store.getState();
            const token = state.auth?.token;

            // if already refreshing → push request to queue
            if (isRefreshing) {
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                })
                    .then((newToken) => {
                        originalRequest.headers["Authorization"] = "Bearer " + newToken;
                        return axiosInstance(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            // -------- TRY REFRESH TOKEN --------
            isRefreshing = true;

            try {
                const refreshResponse = await axios.post(
                    `${API_BASE_URL}/auth/refresh`,
                    {},
                    { withCredentials: true }
                );

                const { user, token: newToken } = refreshResponse.data;
                const mappedUser = mapUserRole(user);

                // update redux
                store.dispatch(setCredentials({ user: mappedUser, token: newToken }));

                processQueue(null, newToken);
                isRefreshing = false;

                // retry original request
                originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
                return axiosInstance(originalRequest);

            } catch (refreshError) {
                processQueue(refreshError, null);
                isRefreshing = false;

                // Refresh failed → log out user
                store.dispatch(logout());
                return Promise.reject(refreshError);
            }
        }

        //------------------ Adding accept language header -------------------
        axiosRequester.interceptors.request.use((config) => {
            const state = store.getState();
            const token = state.auth.token;
            let lang = "en";
            if (typeof window !== "undefined") {
                try {
                    const urlLang = new URL(window.location.href).searchParams.get("lang");
                    const storedLang =
                        localStorage.getItem("lang") ||
                        sessionStorage.getItem("lang");
                    lang = urlLang || storedLang || lang;
                } catch (_) {
                    // ignore URL/localStorage errors
                }
            }
            // 2) Inject Accept-Language unless caller already provided one
            config.headers = {
                ...(config.headers || {}),
                "Accept-Language": config.headers?.["Accept-Language"] || lang === 'en' ? 'en-US' : 'ar-EG',
            };


            if (token) {
                config.headers["Authorization"] = `Bearer ${token}`;
            }

            return config;
        });


        // ------------------ 403 Forbidden ------------------
        if (error.response?.status === 403) {
            console.warn("Access denied (403)");
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
