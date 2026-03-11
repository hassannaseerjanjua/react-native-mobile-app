import { useCallback, useEffect, useRef, useState } from 'react';
import api, { getAuthHeader } from '../utils/api';
import { getCached, setCached } from '../utils/api-cache';

const useGetApi = <T>(
  url: string,
  config: {
    transformData?: (data: any) => T;
    withAuth?: boolean;
    initialData?: T;
    /** Skip caching for this call (e.g. user-specific or always-fresh endpoints) */
    noCache?: boolean;
  },
) => {
  const [data, setData] = useState<T | null>(config?.initialData || null);
  const [loading, setLoading] = useState(!config?.initialData);
  const [error, setError] = useState<any>(null);
  const token = 'Token';
  const isMounted = useRef(true);
  const urlRef = useRef(url);
  urlRef.current = url;
  const configRef = useRef(config);
  configRef.current = config;

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchData = useCallback(async () => {
    const currentUrl = urlRef.current;
    if (currentUrl === '') {
      setLoading(false);
      return;
    }

    setLoading(true);

    const cfg = configRef.current;
    const noCache = cfg?.noCache ?? false;
    const cacheKey = currentUrl;
    let cachedJson: string | null = null;

    // Step 1: show stale data immediately if available
    if (!noCache) {
      const cached = await getCached<T>(cacheKey);
      if (cached !== null && isMounted.current) {
        setData(cached);
        cachedJson = JSON.stringify(cached);
        setLoading(false);
      }
    }

    // Step 2: fetch fresh data in the background
    const response = await api.get<T>(
      currentUrl,
      cfg?.withAuth ? getAuthHeader(token) : undefined,
    );

    if (!isMounted.current) return;

    if (response.success && response.data) {
      const transformed = cfg?.transformData
        ? cfg.transformData(response.data)
        : (response.data as T);

      const freshJson = JSON.stringify(transformed);
      if (freshJson !== cachedJson) {
        setData(transformed);
      }

      if (!noCache) {
        setCached(cacheKey, transformed);
      }
    }

    if (response.failed) {
      setError(response.error);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [url, fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
};

export default useGetApi;
