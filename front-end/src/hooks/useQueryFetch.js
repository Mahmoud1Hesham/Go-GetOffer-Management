// src/hooks/queryFetch.js
import axios from "@/lib/axios/axios.js";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

/** helper fetcher that accepts signal from react-query */
export async function fetchData(url, options = {}, { signal } = {}) {
    const isAbsolute = /^https?:\/\//i.test(url);

    // pass signal to axios (axios v1+ supports signal)
    const axiosConfig = {
        url,
        ...(isAbsolute ? { baseURL: "" } : {}),
        ...options,
        signal,
    };

    const { data } = await axios.request(axiosConfig);
    return data;
}

/**
 * useQueryFetch
 * - queryKey: string | array
 * - url: endpoint
 * - options: axios options (params, headers, etc)
 * - queryOptions: react-query options (enabled, staleTime, etc)
 */
export function useQueryFetch(queryKey, url, options = {}, queryOptions = {}) {
    const key = Array.isArray(queryKey) ? queryKey : [queryKey];

    return useQuery({
        queryKey: key,
        queryFn: ({ signal }) => fetchData(url, options, { signal }),
        // sane defaults (override via queryOptions)
        staleTime: 1000 * 60 * 2,
        cacheTime: 1000 * 60 * 10,
        retry: 1,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        ...queryOptions,
    });
}

/**
 * useMutationFetch
 * - url: string | function (variables) => { url, method, data, params, config }
 * - options: default axios options for mutation (method default to POST)
 * - mutationOptions: react-query mutationOptions (onSuccess, onError, etc)
 * - invalidateKeys: optional array of query keys to invalidate on success
 */
export function useMutationFetch({ url, options = {}, mutationOptions = {}, invalidateKeys = [] } = {}) {
    const qc = useQueryClient();

    const mutationFn = async (variables) => {
        if (typeof url === "function") {
            const req = url(variables);
            const res = await axios.request(req);
            return res.data;
        }

        const isAbsolute = /^https?:\/\//i.test(url);
        const method = (options.method || "POST").toUpperCase();

        const req = {
            url,
            method,
            ...(isAbsolute ? { baseURL: "" } : {}),
            data: variables?.data ?? variables,
            params: variables?.params,
            ...options,
            ...(variables?.config || {}),
        };

        const { data } = await axios.request(req);
        return data;
    };

    return useMutation(mutationFn, {
        async onSuccess(data, variables, context) {
            // default invalidation behavior
            if (Array.isArray(invalidateKeys) && invalidateKeys.length > 0) {
                invalidateKeys.forEach(k => qc.invalidateQueries(k));
            }
            if (mutationOptions.onSuccess) await mutationOptions.onSuccess(data, variables, context);
        },
        ...mutationOptions,
    });
}
