import { useEffect, useRef, useState } from 'react';
import { I18nManager } from 'react-native';
import RNRestart from 'react-native-restart';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiEndpoints from '../constants/api-endpoints';
import api from '../utils/api';
import { useDispatch } from 'react-redux';
import {
  setLocale,
  setLocaleFetching,
  useLocaleStore,
} from '../store/reducer/locale';

const useFetchLocale = () => {
  const dispatch = useDispatch();
  const { strings, langId, stringsLangId } = useLocaleStore();

  const hasCachedStrings =
    stringsLangId === langId && Object.keys(strings || {}).length > 0;

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean | null>(
    hasCachedStrings ? false : null,
  );
  const [doKeysExist, setDoKeysExist] = useState(hasCachedStrings);
  const isFetching = useRef(false);

  const fetchLocale = async (targetLangId: number) => {
    if (isFetching.current) return;
    isFetching.current = true;

    setLoading(true);
    dispatch(setLocaleFetching({ isFetching: true }));

    const response = await api.get<{
      Data: {
        ResourceDictionary: Record<string, string>;
      };
    }>(apiEndpoints.LOCALE(targetLangId), { headers: { LangID: targetLangId } });

    isFetching.current = false;

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
        stringsLangId: targetLangId,
      }),
    );

    setDoKeysExist(true);
    setLoading(false);
    dispatch(setLocaleFetching({ isFetching: false }));
  };

  useEffect(() => {
    const enforceLayoutDirection = async () => {
      const shouldBeRtl = langId === 2;
      const storedLangId = await AsyncStorage.getItem('rtl_forced_lang_id');

      I18nManager.allowRTL(shouldBeRtl);
      I18nManager.forceRTL(shouldBeRtl);

      if (I18nManager.isRTL !== shouldBeRtl && storedLangId !== String(langId)) {
        await AsyncStorage.setItem('rtl_forced_lang_id', String(langId));
        RNRestart.restart();
        return;
      }

      // When strings are already cached for this language (e.g. after a
      // language-change restart where shiftLanguage pre-fetched them),
      // skip the network call entirely — the strings are already correct.
      if (hasCachedStrings) {
        dispatch(setLocaleFetching({ isFetching: false }));
        return;
      }

      fetchLocale(langId);
    };

    enforceLayoutDirection();
  }, [langId]);

  return {
    loading,
    error,
    doKeysExist,
  };
};

export default useFetchLocale;
