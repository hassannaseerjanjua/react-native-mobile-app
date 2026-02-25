import { useColors } from './colors';
import { useSizes } from './sizes';
import { getGlobalStyles } from './global-styles';
import { useLocaleStore } from '../store/reducer/locale';
import { getFontsForLanguage } from '../assets/fonts';

const useTheme = () => {
  const colors = useColors();
  const sizes = useSizes();
  const { langCode } = useLocaleStore();
  const isArabic = langCode === 'ar';
  const globalStyles = getGlobalStyles(colors, sizes, isArabic);
  const fonts = getFontsForLanguage(isArabic);

  return { colors, sizes, globalStyles, fonts };
};

export default useTheme;
