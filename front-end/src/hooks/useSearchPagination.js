"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Fuse from "fuse.js";
import { useQueryFetch } from "@/hooks/useQueryFetch";

/*
  useSearchPagination
  - Supports online (server-side) and offline (client-side) search + pagination
  - URL is the single source of truth for `search`, `page` and `limit`

  Options:
    - queryKey: unique key for react-query
    - url: endpoint to fetch (string)
    - isOnline: boolean
    - initialLimit: number
    - fuseOptions: options passed to Fuse (offline mode)
    - transformServerResponse: fn(res) => { items, total }

  Returns { data, total, page, limit, setSearch, setPage, setLimit, isLoading, isOnline }
*/

export function useSearchPagination({
  queryKey = "search",
  url,
  isOnline = true,
  initialLimit = 10,
  fuseOptions = { keys: ["name", "title", "description"], threshold: 0.35 },
  transformServerResponse,
  data: externalData, // optional array used in offline mode
} = {}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const urlSearch = searchParams?.get("search") ?? "";
  const urlPage = parseInt(searchParams?.get("page") ?? "1", 10) || 1;
  const urlLimit = parseInt(searchParams?.get("pageSize") ?? String(initialLimit), 10) || initialLimit;

  const [localSearch, setLocalSearch] = useState(urlSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(urlSearch);

  // Keep localSearch in sync when URL changes externally
  useEffect(() => {
    setLocalSearch(urlSearch);
    if (!isOnline) setDebouncedSearch(urlSearch);
  }, [urlSearch, isOnline]);

  // Debounce only in online mode
  useEffect(() => {
    if (!isOnline) return undefined;
    const id = setTimeout(() => setDebouncedSearch(localSearch), 250);
    return () => clearTimeout(id);
  }, [localSearch, isOnline]);

  // helpers to update URL (single source of truth)
  const updateUrl = useCallback((patch = {}) => {
    try {
      const params = new URLSearchParams(Array.from(searchParams || []));
      if (patch.search !== undefined) {
        if (patch.search) params.set("search", patch.search);
        else params.delete("search");
      }
      if (patch.page !== undefined) {
        if (patch.page && +patch.page > 1) params.set("page", String(patch.page));
        else params.delete("page");
      }
      if (patch.limit !== undefined) {
        if (patch.limit) params.set("pageSize", String(patch.limit));
        else params.delete("pageSize");
      }

      const qs = params.toString();
      const path = pathname + (qs ? `?${qs}` : "");
      
      console.log('useSearchPagination: updateUrl called', { patch, pathCandidate: path });

      // Use push instead of replace to be safer with history
      router.push(path, { scroll: false }); 
    } catch (e) {
      // fallback: do nothing
      console.error("Failed to update URL", e);
    }
  }, [router, searchParams, pathname]);

  const setSearch = useCallback((value) => {
    setLocalSearch(value ?? "");
    // reset page to 1 when user changes search
    updateUrl({ search: value ?? "", page: 1 });
  }, [updateUrl]);

  const setPage = useCallback((p) => {
    updateUrl({ page: p });
  }, [updateUrl]);

  const setLimit = useCallback((l) => {
    updateUrl({ limit: l });
  }, [updateUrl]);

  const setPagination = useCallback((changes) => {
    updateUrl(changes);
  }, [updateUrl]);

  // Online mode: query the server with debounced search, page and limit
  const onlineQueryKey = useMemo(() => [queryKey, "online", debouncedSearch, urlPage, urlLimit], [queryKey, debouncedSearch, urlPage, urlLimit]);
  const onlineUrl = useMemo(() => {
    if (!url) return null;
    const p = new URLSearchParams();
    if (debouncedSearch) p.set("search", debouncedSearch);
    if (urlPage) p.set("page", String(urlPage));
    if (urlLimit) p.set("pageSize", String(urlLimit));
    return `${url}${p.toString() ? `?${p.toString()}` : ""}`;
  }, [url, debouncedSearch, urlPage, urlLimit]);

  const onlineQuery = useQueryFetch(onlineQueryKey, onlineUrl, {}, { enabled: isOnline && !!url });

  // Offline mode: fetch all data once (no params), then client-side search + pagination
  const offlineQueryKey = useMemo(() => [queryKey, "offline", "all"], [queryKey]);
  const offlineQuery = useQueryFetch(offlineQueryKey, url, {}, { enabled: !isOnline && !!url });

  // parse server response helper
  const defaultTransform = useCallback((res) => {
    if (!res) return { items: [], total: 0 };
    if (Array.isArray(res)) return { items: res, total: res.length };
    if (res.data && Array.isArray(res.data)) return { items: res.data, total: res.total ?? res.count ?? res.data.length };
    return { items: res.items || res.results || [], total: res.total ?? res.count ?? (res.items ? res.items.length : 0) };
  }, []);

  const parseServer = transformServerResponse || defaultTransform;

  // Offline: use provided externalData if present, otherwise fallback to fetched data
  const offlineList = useMemo(() => {
    if (Array.isArray(externalData)) return externalData;
    return offlineQuery?.data ? (offlineQuery.data.data ?? offlineQuery.data) : [];
  }, [externalData, offlineQuery?.data]);

  // Offline: build fuse on offlineList
  const fuse = useMemo(() => {
    const list = offlineList || [];
    if (!list || !list.length) return null;
    return new Fuse(list, fuseOptions);
  }, [offlineList, fuseOptions]);

  const offlineFiltered = useMemo(() => {
    const list = offlineList || [];
    if (!list || !list.length) return [];
    if (!localSearch) return list;
    if (fuse) {
      return fuse.search(localSearch).map(r => r.item);
    }
    // basic fallback: simple substring match across JSON string
    const q = String(localSearch).toLowerCase();
    return list.filter(item => JSON.stringify(item).toLowerCase().includes(q));
  }, [offlineList, localSearch, fuse]);

  const offlineTotal = offlineFiltered.length;
  const offlinePage = urlPage;
  const offlineLimit = urlLimit;
  const offlineData = useMemo(() => {
    const start = (offlinePage - 1) * offlineLimit;
    return offlineFiltered.slice(start, start + offlineLimit);
  }, [offlineFiltered, offlinePage, offlineLimit]);

  // Online parsed data
  const onlineParsed = useMemo(() => parseServer(onlineQuery?.data), [onlineQuery?.data, parseServer]);

  const data = isOnline ? (onlineParsed.items || []) : offlineData;
  const total = isOnline ? (onlineParsed.total || 0) : offlineTotal;
  const page = urlPage;
  const limit = urlLimit;
  const isLoading = isOnline ? onlineQuery.isLoading : offlineQuery.isLoading;

  return {
    data,
    searchedData: isOnline ? (onlineParsed.items || []) : offlineFiltered,
    total,
    page,
    limit,
    setSearch,
    setPage,
    setLimit,
    setPagination,
    searchQuery: debouncedSearch,
    isLoading,
    isOnline,
  };
}

export default useSearchPagination;
