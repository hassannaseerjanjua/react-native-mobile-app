import { useCallback, useEffect, useState, useRef } from 'react';
import useDebouncedSearch from './useDebouncedSearch';
import { getQueryFromObject } from '../utils';
import api, { getAuthHeader } from '../utils/api';
import notify from '../utils/notify';
import { useFocusEffect } from '@react-navigation/native';

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
  },
) => {
  const [pageIndex, setPageIndex] = useState(config?.pageIndex || 1);
  const [pageSize, setPageSize] = useState(config?.pageSize || 15);
  const [isInitialLoad, setIsInitialLoad] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [data, setData] = useState<T[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
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

  const fetchData = (
    searchParam: string = '',
    showLoading: boolean = true,
    pageOverride?: number,
  ) => {
    if (url === '') return;
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    const currentPage = pageOverride ?? pageIndexRef.current;

    if (showLoading && currentPage === 1) setLoading(true);
    if (currentPage > 1) {
      setLoadingMore(true);
      isLoadingMoreRef.current = true;
    }

    let apiUrl = `${url}?pageIndex=${currentPage}&pageSize=${pageSize}`;

    const searchValue = searchParam || search;
    if (searchValue) {
      apiUrl += `&searchTerm=${encodeURIComponent(searchValue)}`;
    }

    if (sortColumn && sortDirection) {
      apiUrl += `&sortColumn=${sortColumn}&sortDirection=${sortDirection}`;
    }

    if (extraParams) {
      apiUrl += '&' + getQueryFromObject(extraParams);
    }

    api
      .get<any>(apiUrl, getAuthHeader(token))
      .then(res => {
        if (res.failed) {
          notify.error(res.error);
          return;
        }

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
          setData(newData);
          setHasMore(newData.length < newTotalCount && newData.length > 0);
        }
      })
      .finally(() => {
        setLoading(false);
        setLoadingMore(false);
        setIsInitialLoad(true);
        isFetchingRef.current = false;
        isLoadingMoreRef.current = false;
      });
  };
  useFocusEffect(
    useCallback(() => {
      if (!isInitialLoad && !isFetchingRef.current) {
        fetchData('', true, 1);
      }
    }, []),
  );

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
    if (!isInitialLoad || isFetchingRef.current) return;
    const prevParams = JSON.stringify(extraParamsRef.current);
    const currentParams = JSON.stringify(extraParams);
    if (prevParams !== currentParams) {
      extraParamsRef.current = extraParams;
      pageIndexRef.current = 1;
      setPageIndex(1);
      setData([]);
      setHasMore(true);
      fetchData('', true, 1);
    }
  }, [extraParams]);

  useEffect(() => {
    if (!isInitialLoad || isFetchingRef.current) return;
    pageIndexRef.current = 1;
    setPageIndex(1);
    setData([]);
    setHasMore(true);
    fetchData('', true, 1);
  }, [pageSize, sortColumn, sortDirection]);

  const recall = (showLoading: boolean = true) => {
    if (loading || isFetchingRef.current) return;
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
