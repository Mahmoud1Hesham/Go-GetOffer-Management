'use client';

import axiosRequester from "@/lib/axios/axios.js";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

/* ------------------------------------------
   FETCHER (يدعم الإشارة signal و absolute URLs)
--------------------------------------------- */
export async function fetchData(url, options = {}, { signal } = {}) {
    const isAbsolute = /^https?:\/\//i.test(url);

    const config = {
        url,
        signal,
        ...(isAbsolute ? { baseURL: "" } : {}),
        ...options,
    };

    const { data } = await axiosRequester.request(config);
    return data;
}

/* ------------------------------------------
    useQueryFetch
--------------------------------------------- */
export function useQueryFetch(queryKey, url, options = {}, queryOptions = {}) {
    const key = Array.isArray(queryKey) ? queryKey : [queryKey];

    return useQuery({
        queryKey: key,
        queryFn: ({ signal }) => fetchData(url, options, { signal }),

        staleTime: 1000 * 60 * 2, // 2 mins
        cacheTime: 1000 * 60 * 10,
        retry: 1,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,

        ...queryOptions,
    });
}

/* ------------------------------------------
    useMutationFetch
--------------------------------------------- */
export function useMutationFetch({
    url,
    options = {},
    mutationOptions = {},
    invalidateKeys = []
} = {}) {
    const qc = useQueryClient();

    const mutationFn = async (variables = {}) => {
        let requestConfig;

        // URL can be static string OR function(variables)
        if (typeof url === "function") {
            requestConfig = url(variables); // must return { url, method, data, params, ... }
        } else {
            const isAbsolute = /^https?:\/\//i.test(url);
            requestConfig = {
                url,
                ...(isAbsolute ? { baseURL: "" } : {}),
                method: options.method || "POST",
                data: variables?.data ?? variables,
                params: variables?.params,
                ...options,
                ...(variables?.config || {}),
            };
        }

        const { data } = await axiosRequester.request(requestConfig);
        return data;
    };

    return useMutation({
        mutationFn,

        // run invalidations
        onSuccess: async (data, variables, context) => {
            if (Array.isArray(invalidateKeys)) {
                invalidateKeys.forEach((k) => qc.invalidateQueries({ queryKey: k }));
            }
            if (mutationOptions.onSuccess) {
                await mutationOptions.onSuccess(data, variables, context);
            }
        },

        onError: mutationOptions.onError,
        onSettled: mutationOptions.onSettled,

        ...mutationOptions,
    });
}
