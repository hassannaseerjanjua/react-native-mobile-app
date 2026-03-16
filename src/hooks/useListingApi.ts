import { useCallback, useEffect, useState, useRef } from 'react';
import useDebouncedSearch from './useDebouncedSearch';
import { getQueryFromObject } from '../utils';
import api, { getAuthHeader } from '../utils/api';
import notify from '../utils/notify';
import { getCached, setCached } from '../utils/api-cache';

export const useListingApi = <T>(
  url: string,
  token: any,
  config?: {
    pageIndex?: number;
    pageSize?: number;
    search?: string;
    sortColumn?: string;
    sortDirection?: 'asc' | 'desc';
    extraParams?: Record<string, any>;
    transformData?: (data: any) => {
      data: T[];
      totalCount: number;
    };
    idExtractor?: (data: T) => any;
    /** Skip caching for this listing (e.g. always-changing feeds) */
    noCache?: boolean;
    /** When false, skip initial fetch. Fetch when enabled becomes true. */
    enabled?: boolean;
  },
) => {
  const enabled = config?.enabled !== false;
  const [pageIndex, setPageIndex] = useState(config?.pageIndex || 1);
  const [pageSize, setPageSize] = useState(config?.pageSize || 15);
  const [isInitialLoad, setIsInitialLoad] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [data, setData] = useState<T[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(url !== '' && enabled);
  const [recallCount, setRecallCount] = useState(0);
  const [extraParams, setExtraParams] = useState(config?.extraParams || {});
  const [sortColumn, setSortColumn] = useState(config?.sortColumn || '');
  const [sortDirection, setSortDirection] = useState(
    config?.sortDirection || 'asc',
  );
  const isFetchingRef = useRef(false);
  const isLoadingMoreRef = useRef(false);
  const extraParamsRef = useRef(config?.extraParams || {});
  const pageIndexRef = useRef(pageIndex);
  const fetchIdRef = useRef(0);
  const pendingExtraParamsChangeRef = useRef(false);

  // Stable cache key for page-1, non-search fetches.
  // Captures everything that defines a unique dataset (excluding page/search).
  const buildCacheKey = (currentExtraParams: Record<string, any>) =>
    `listing:${url}:${pageSize}:${config?.sortColumn ?? ''}:${
      config?.sortDirection ?? ''
    }:${JSON.stringify(currentExtraParams)}`;

  const fetchData = async (
    searchParam: string = '',
    showLoading: boolean = true,
    pageOverride?: number,
  ) => {
    if (url === '') return;
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    const currentFetchId = ++fetchIdRef.current;
    const currentPage = pageOverride ?? pageIndexRef.current;
    const searchValue = searchParam || search;
    const isFirstPage = currentPage === 1;
    const noCache = config?.noCache ?? false;

    // Step 1: for page-1 non-search requests, show stale data immediately.
    // IMPORTANT: we do NOT clear data before this await. Clearing data
    // synchronously before the cache check causes a render with data=[] and
    // loading=false, which shows "no products found" for a frame. Instead we
    // let the cache result decide: cache hit → replace directly (no empty
    // state), no cache → clear then show skeleton.
    let cachedJson: string | null = null;
    if (isFirstPage && !searchValue && !noCache) {
      const cacheKey = buildCacheKey(extraParamsRef.current);
      const cached = await getCached<{ data: T[]; totalCount: number }>(
        cacheKey,
      );
      if (cached !== null) {
        setData(cached.data);
        setTotalCount(cached.totalCount);
        setHasMore(cached.data.length < cached.totalCount);
        cachedJson = JSON.stringify(cached.data);
        // Mark initial load done so loadMore is unblocked while the
        // background refresh is still in flight. isFetchingRef.current
        // being true will still prevent the actual page-2 fetch from
        // starting until the page-1 network request completes.
        setIsInitialLoad(true);
        // Already have data visible — suppress the full-screen loader
        setLoading(false);
      } else {
        // No cache: clear old data now and show skeleton
        setData([]);
        if (showLoading) setLoading(true);
      }
    } else {
      // Search queries and noCache paths: clear and show loader immediately
      if (isFirstPage) setData([]);
      if (showLoading && isFirstPage) setLoading(true);
    }

    if (currentPage > 1) {
      setLoadingMore(true);
      isLoadingMoreRef.current = true;
    }

    let apiUrl = `${url}?pageIndex=${currentPage}&pageSize=${pageSize}`;

    if (searchValue) {
      apiUrl += `&searchTerm=${encodeURIComponent(searchValue)}`;
    }

    if (sortColumn && sortDirection) {
      apiUrl += `&sortColumn=${sortColumn}&sortDirection=${sortDirection}`;
    }

    const paramsToUse = extraParamsRef.current;
    if (paramsToUse && Object.keys(paramsToUse).length > 0) {
      apiUrl += '&' + getQueryFromObject(paramsToUse);
    }

    // Step 2: fetch fresh data
    api
      .get<any>(apiUrl, getAuthHeader(token))
      .then(res => {
        if (res.failed) {
          notify.error(res.error);
          return;
        }

        // Ignore stale response (e.g. tab switched before this request completed)
        if (currentFetchId !== fetchIdRef.current) return;

        let newData: T[] = [];
        let newTotalCount = 0;

        if (config?.transformData) {
          const transformed = config.transformData(res?.data);
          newData = transformed.data;
          newTotalCount = transformed.totalCount;
        } else {
          newData = res.data?.items || [];
          newTotalCount = res.data?.totalCount || 0;
        }

        setTotalCount(newTotalCount);

        if (currentPage > 1) {
          setData(prev => {
            if (config?.idExtractor) {
              const existingIds = new Set(
                prev.map(item => config.idExtractor!(item)),
              );
              const filteredNew = newData.filter(
                item => !existingIds.has(config.idExtractor!(item)),
              );
              const updatedData = [...prev, ...filteredNew];
              setHasMore(
                updatedData.length < newTotalCount && newData.length > 0,
              );
              return updatedData;
            }
            const updatedData = [...prev, ...newData];
            setHasMore(
              updatedData.length < newTotalCount && newData.length > 0,
            );
            return updatedData;
          });
        } else {
          // Only update state if data actually changed — avoids a flash
          // when the fresh response is identical to what the cache showed.
          const freshJson = JSON.stringify(newData);
          if (freshJson !== cachedJson) {
            setData(newData);
          }
          setHasMore(newData.length < newTotalCount && newData.length > 0);

          // Cache page-1 non-search results
          if (!searchValue && !noCache) {
            const cacheKey = buildCacheKey(paramsToUse);
            setCached(cacheKey, { data: newData, totalCount: newTotalCount });
          }
        }
      })
      .finally(() => {
        setLoading(false);
        setLoadingMore(false);
        setIsInitialLoad(true);
        isFetchingRef.current = false;
        isLoadingMoreRef.current = false;

        // If extraParams changed while request was in flight, fetch with new params.
        // setLoading(true) is intentionally set here so it wins in the same React
        // batch as the setLoading(false) above — preventing an empty-state flash
        // between the stale fetch completing and the new fetch starting.
        if (pendingExtraParamsChangeRef.current) {
          pendingExtraParamsChangeRef.current = false;
          pageIndexRef.current = 1;
          setPageIndex(1);
          setData([]);
          setHasMore(true);
          setLoading(true);
          fetchData('', true, 1);
        }
      });
  };

  // Fetch when enabled and url is set. Skip initial fetch when disabled.
  useEffect(() => {
    if (!enabled || url === '' || isFetchingRef.current) return;
    if (!isInitialLoad) {
      fetchData('', true, 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  const { search, setSearch } = useDebouncedSearch(searchValue => {
    if (!isInitialLoad) return;
    pageIndexRef.current = 1;
    setPageIndex(1);
    setData([]);
    setHasMore(true);
    fetchData(searchValue, true, 1);
  });

  useEffect(() => {
    pageIndexRef.current = pageIndex;
    if (!isInitialLoad || isFetchingRef.current) return;
    if (pageIndex > 1) {
      fetchData('', false, pageIndex);
    }
  }, [pageIndex]);

  useEffect(() => {
    if (!isInitialLoad) return;
    const prevParams = JSON.stringify(extraParamsRef.current);
    const currentParams = JSON.stringify(extraParams);
    if (prevParams !== currentParams) {
      extraParamsRef.current = extraParams;
      if (isFetchingRef.current) {
        pendingExtraParamsChangeRef.current = true;
        fetchIdRef.current++; // Invalidate in-flight request so its response is ignored
        setData([]); // Clear stale data immediately
        return;
      }
      pageIndexRef.current = 1;
      setPageIndex(1);
      setHasMore(true);
      setLoading(true);
      fetchData('', true, 1);
    }
  }, [extraParams]);

  useEffect(() => {
    if (!isInitialLoad || isFetchingRef.current) return;
    pageIndexRef.current = 1;
    setPageIndex(1);
    setHasMore(true);
    fetchData('', true, 1);
  }, [pageSize, sortColumn, sortDirection]);

  const recall = (
    showLoading: boolean = true,
    overrideParams?: Record<string, any>,
  ) => {
    if (loading || isFetchingRef.current) return;
    if (overrideParams && Object.keys(overrideParams).length > 0) {
      extraParamsRef.current = { ...extraParamsRef.current, ...overrideParams };
    }
    pageIndexRef.current = 1;
    setPageIndex(1);
    setHasMore(true);
    fetchData('', showLoading, 1);
  };

  const loadMore = () => {
    if (
      loading ||
      loadingMore ||
      isFetchingRef.current ||
      isLoadingMoreRef.current ||
      !hasMore ||
      !isInitialLoad
    )
      return;
    isLoadingMoreRef.current = true;
    const nextPage = pageIndexRef.current + 1;
    pageIndexRef.current = nextPage;
    setPageIndex(nextPage);
  };

  const add = (data: T) => {
    setData(prev => [data, ...prev]);
    setTotalCount(p => p + 1);
  };

  const update = (id: any, updateCallback: (data: T) => T) => {
    if (!config?.idExtractor) return;
    setData(prev =>
      prev.map(p => (config.idExtractor!(p) === id ? updateCallback(p) : p)),
    );
  };

  const remove = (id: any) => {
    if (!config?.idExtractor) return;
    setData(prev => prev.filter(p => config.idExtractor!(p) !== id));
    setTotalCount(p => p - 1);
  };

  return {
    data,
    pageIndex,
    loading,
    loadingMore,
    hasMore,
    search,
    pageSize,
    totalCount,
    extraParams,
    sortColumn,
    sortDirection,
    isInitialLoad,

    setPageIndex,
    setSearch,
    setPageSize,
    setExtraParams,
    setSortColumn,
    setSortDirection,
    setData,
    recall,
    loadMore,
    add,
    update,
    remove,
  };
};
