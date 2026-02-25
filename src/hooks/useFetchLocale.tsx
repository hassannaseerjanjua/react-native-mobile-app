import { useEffect, useState } from 'react';
import apiEndpoints from '../constants/api-endpoints';
import api from '../utils/api';
import { useDispatch } from 'react-redux';
import { setLocale, setLocaleFetching, useLocaleStore } from '../store/reducer/locale';

const useFetchLocale = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean | null>(null);
  const [doKeysExist, setDoKeysExist] = useState(false);
  const dispatch = useDispatch();
  const { strings, langId } = useLocaleStore();

  const fetchLocale = async (langId: number) => {
    if (loading === true) return;
    setLoading(true);
    dispatch(setLocaleFetching({ isFetching: true }));
    const response = await api.get<{
      Data: {
        ResourceDictionary: Record<string, string>;
      };
    }>(apiEndpoints.LOCALE(langId));

    if (response.error || !response.data) {
      if (Object.keys(strings || {}).length > 0) {
        setDoKeysExist(true);
      }
      setLoading(false);
      dispatch(setLocaleFetching({ isFetching: false }));
      setError(response.error);
      return;
    }

    dispatch(
      setLocale({
        strings: response?.data?.Data?.ResourceDictionary || {},
        stringsLangId: langId,
      }),
    );

    setDoKeysExist(true);
    setLoading(false);
    dispatch(setLocaleFetching({ isFetching: false }));
  };

  useEffect(() => {
    fetchLocale(langId);
  }, [langId]);

  return {
    loading,
    error,
    doKeysExist,
  };
};

export default useFetchLocale;
