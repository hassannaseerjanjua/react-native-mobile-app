import { useMemo } from 'react';
import { useColors } from './colors';
import { useSizes } from './sizes';
import { getGlobalStyles, SHADOW_PRESETS } from './global-styles';
import { useLocaleStore } from '../store/reducer/locale';
import { getFontsForLanguage } from '../assets/fonts';

const useTheme = () => {
  const colors = useColors();
  const sizes = useSizes();
  const { langCode } = useLocaleStore();
  const isArabic = langCode === 'ar';
  const globalStyles = useMemo(
    () => getGlobalStyles(colors, sizes, isArabic),
    [colors, sizes, isArabic],
  );
  const fonts = getFontsForLanguage(isArabic);

  return { colors, sizes, globalStyles, fonts, shadowPresets: SHADOW_PRESETS };
};

export default useTheme;
