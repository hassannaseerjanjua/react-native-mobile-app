import { useEffect, useRef, useState } from 'react';
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const token = 'Token';
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchData = async () => {
    if (url === '') return;

    const noCache = config?.noCache ?? false;
    const cacheKey = url;
    let cachedJson: string | null = null;

    // Step 1: show stale data immediately if available
    if (!noCache) {
      const cached = await getCached<T>(cacheKey);
      if (cached !== null && isMounted.current) {
        setData(cached);
        cachedJson = JSON.stringify(cached);
        // Don't show full-screen loader — data is already visible
        setLoading(false);
      } else {
        setLoading(true);
      }
    } else {
      setLoading(true);
    }

    // Step 2: fetch fresh data in the background
    const response = await api.get<T>(
      url,
      config?.withAuth ? getAuthHeader(token) : undefined,
    );

    if (!isMounted.current) return;

    if (response.success && response.data) {
      const transformed = config?.transformData
        ? config.transformData(response.data)
        : (response.data as T);

      // Only update state if the data actually changed — avoids a flash
      // when the fresh response is identical to what the cache already showed.
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
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
};

export default useGetApi;
