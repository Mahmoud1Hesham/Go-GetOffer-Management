// src/hooks/useFetch.js
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import axios from '@/lib/axios/axios.js'; // استخدم axios instance بتاعك

// -------- simple in-memory cache for suspense resources (keyed by url+params) ----
const suspenseCache = new Map();

function defaultKey(url, params) {
    try {
        return `${url}|${JSON.stringify(params || {})}`;
    } catch {
        return url;
    }
}

// Suspense wrapper
function wrapPromise(promise) {
    let status = 'pending';
    let result;
    const suspender = promise.then(
        (r) => {
            status = 'success';
            result = r;
            return r;
        },
        (e) => {
            status = 'error';
            result = e;
            throw e;
        }
    );
    return {
        read() {
            if (status === 'pending') throw suspender;
            if (status === 'error') throw result;
            return result;
        },
    };
}

/**
 * useFetch unified hook
 * - if options.suspense===true and method==='GET' => returns Suspense resource (with read())
 * - otherwise returns { data, error, loading, refetch, run }
 *
 * options:
 *  - method (default 'GET')
 *  - params, data
 *  - config: axios config
 *  - manual: boolean (default false) -> if true won't auto fetch
 *  - suspense: boolean (default false) -> enable Suspense mode (GET only)
 *  - cacheKey: string|function -> override default cache key for suspense
 *  - deps: array -> used for auto re-fetch when not manual & not suspense
 */
export function useFetch(url, options = {}) {
    if (!url) throw new Error('useFetch: url is required');

    const {
        method = 'GET',
        params = null,
        data = null,
        config = {},
        manual = false,
        suspense = false,
        cacheKey = null,
        deps = [],
    } = options;

    const upperMethod = method.toUpperCase();
    if (suspense && upperMethod !== 'GET') {
        throw new Error('useFetch: suspense mode only supports GET requests');
    }

    // refs
    const controllerRef = useRef(null);
    const mountedRef = useRef(true);

    // state (non-suspense)
    const [loading, setLoading] = useState(!manual && !suspense);
    const [error, setError] = useState(null);
    const [response, setResponse] = useState(null);

    const makeRequest = useCallback(
        async (overrides = {}) => {
            // cancel previous
            if (controllerRef.current) {
                try { controllerRef.current.abort(); } catch (e) { }
            }
            const controller = new AbortController();
            controllerRef.current = controller;

            const req = {
                url,
                method: (overrides.method || upperMethod),
                params: overrides.params ?? params,
                data: overrides.data ?? data,
                signal: controller.signal,
                ...config,
                ...(overrides.config || {}),
            };

            try {
                if (!suspense) {
                    setLoading(true);
                    setError(null);
                }
                const res = await axios.request(req);
                if (!suspense && mountedRef.current) {
                    setResponse(res.data);
                    setLoading(false);
                }
                return { ok: true, data: res.data };
            } catch (err) {
                // handle cancelation gracefully
                const isCanceled =
                    err?.name === 'CanceledError' ||
                    err?.code === 'ERR_CANCELED' ||
                    err?.message === 'canceled';
                if (isCanceled) {
                    if (!suspense && mountedRef.current) setLoading(false);
                    return { ok: false, canceled: true };
                }
                if (!suspense && mountedRef.current) {
                    setError(err);
                    setLoading(false);
                }
                return { ok: false, error: err };
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [url, upperMethod, JSON.stringify(params), JSON.stringify(data), JSON.stringify(config)]
    );

    // Auto-run for non-suspense
    useEffect(() => {
        mountedRef.current = true;
        if (!manual && !suspense) doFetch();
        return () => {
            mountedRef.current = false;
            if (controllerRef.current) {
                try { controllerRef.current.abort(); } catch (e) { }
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [url, ...deps]);

    // wrapper to call makeRequest
    const doFetch = useCallback(
        (overrides = {}) => makeRequest(overrides),
        [makeRequest]
    );

    // refetch/run
    const refetch = useCallback(() => doFetch(), [doFetch]);
    const run = useCallback((overrides) => doFetch(overrides), [doFetch]);

    // Suspense mode: create or reuse resource in cache
    if (suspense && upperMethod === 'GET') {
        const key =
            typeof cacheKey === 'function' ? cacheKey({ url, params }) : cacheKey || defaultKey(url, params);

        if (!suspenseCache.has(key)) {
            const p = axios
                .request({ url, method: 'GET', params, ...config })
                .then((r) => r.data);
            suspenseCache.set(key, wrapPromise(p));
        }
        return suspenseCache.get(key); // resource with read()
    }

    return {
        data: response,
        error,
        loading,
        refetch,
        run,
    };
}

export default useFetch;
