import { useCallback, useEffect, useState } from 'react';
import api, { getAuthHeader } from '../utils/api';
import { useFocusEffect } from '@react-navigation/native';

const useGetApi = <T>(
  url: string,
  config: {
    transformData?: (data: any) => T;
    withAuth?: boolean;
    initialData?: T;
  },
) => {
  const [data, setData] = useState<T | null>(config?.initialData || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const token = 'Token';

  const fetchData = async () => {
    setLoading(true);
    const response = await api.get<T>(
      url,
      config?.withAuth ? getAuthHeader(token) : undefined,
    );
    if (response.success && response.data) {
      setData(
        config?.transformData
          ? config?.transformData(response.data)
          : response.data,
      );
    }
    if (response.failed) {
      setError(response.error);
    }
    setLoading(false);
  };
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, []),
  );
  useEffect(() => {
    fetchData();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
};

export default useGetApi;
