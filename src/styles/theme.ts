import { useMemo } from 'react';
import { useColors } from './colors';
import { useSizes } from './sizes';
import { getGlobalStyles, SHADOW_PRESETS } from './global-styles';
import { getFonts } from '../assets/fonts';

const useTheme = () => {
  const colors = useColors();
  const sizes = useSizes();
  const globalStyles = useMemo(
    () => getGlobalStyles(colors, sizes),
    [colors, sizes],
  );
  const fonts = getFonts();

  return { colors, sizes, globalStyles, fonts, shadowPresets: SHADOW_PRESETS };
};

export default useTheme;
