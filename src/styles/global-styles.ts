import { StyleSheet } from 'react-native';
import { Colors } from './colors';
import { Sizes } from './sizes';
import { getFontsForLanguage } from '../assets/fonts';
import { isAndroid, scaleWithMax } from '../utils';

export { SHADOW_PRESETS, type ShadowPresetName } from './shadow-presets';

export const getGlobalStyles = (
  colors: Colors,
  sizes: Sizes,
  isArabic: boolean,
) => {
  const fonts = getFontsForLanguage(isArabic);
  return StyleSheet.create({
    TEXT_STYLE: {
      fontSize: sizes.FONTSIZE,
      color: colors.PRIMARY_TEXT,
      fontFamily: fonts.regular,
      // ...(isArabic && { lineHeight: sizes.FONTSIZE * 1.35 }),
    },
    TEXT_STYLE_SEMIBOLD: {
      fontSize: sizes.FONTSIZE,
      color: colors.PRIMARY_TEXT,
      fontFamily: fonts.semibold,
      // ...(isArabic && { lineHeight: sizes.FONTSIZE * 1.35 }),
    },
    TEXT_STYLE_MEDIUM: {
      fontSize: sizes.FONTSIZE,
      color: colors.PRIMARY_TEXT,
      fontFamily: fonts.medium,
      // ...(isArabic && { lineHeight: sizes.FONTSIZE * 1.35 }),
    },
    TEXT_STYLE_BOLD: {
      fontSize: sizes.FONTSIZE,
      color: colors.PRIMARY_TEXT,
      fontFamily: fonts.bold,
      // ...(isArabic && { lineHeight: sizes.FONTSIZE * 1.35 }),
    },
    /* Shadow placeholders - use ShadowView with preset instead. Kept for gradual migration. */
    SHADOW_STYLE: {} as any,
    SHADOW_STYLE_STORE_CARD: {} as any,
    SHADOW_STYLE_SEARCH_BAR: {} as any,
    SHADOW_STYLE_INPUT: {} as any,
    SHADOW_STYLE_MEDIUM: {} as any,
    SHADOW_STYLE_LOW: {} as any,
    CONTAINER_STYLE: {
      flex: 1,
      backgroundColor: colors.BACKGROUND,
      paddingHorizontal: sizes.PADDING,
      paddingTop: isAndroid ? sizes.PADDING * 0.4 : 0,
    },
    BORDER_BOTTOM_NORMAL: {
      borderBottomWidth: 0.7,
      borderBottomColor: '#EEEEEE',
    },
    BUTTON_TAB_TFIELD_HEIGHT: {
      height: scaleWithMax(48, 52),
    },
  });
};
