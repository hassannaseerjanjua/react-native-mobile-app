import { Platform, StyleSheet } from 'react-native';
import { Colors } from './colors';
import { Sizes } from './sizes';
import { useMemo } from 'react';
import { getFontsForLanguage } from '../assets/fonts';
import { isAndroid, scaleWithMax } from '../utils';

export const getGlobalStyles = (
  colors: Colors,
  sizes: Sizes,
  isArabic: boolean,
) => {
  const fonts = getFontsForLanguage(isArabic);
  return useMemo(
    () =>
      StyleSheet.create({
        TEXT_STYLE: {
          fontSize: sizes.FONTSIZE,
          color: colors.PRIMARY_TEXT,
          fontFamily: fonts.regular,
          ...(isArabic && { lineHeight: sizes.FONTSIZE * 1.35 }),
        },
        TEXT_STYLE_SEMIBOLD: {
          fontSize: sizes.FONTSIZE,
          color: colors.PRIMARY_TEXT,
          fontFamily: fonts.semibold,
          ...(isArabic && { lineHeight: sizes.FONTSIZE * 1.35 }),
        },
        TEXT_STYLE_MEDIUM: {
          fontSize: sizes.FONTSIZE,
          color: colors.PRIMARY_TEXT,
          fontFamily: fonts.medium,
          ...(isArabic && { lineHeight: sizes.FONTSIZE * 1.35 }),
        },
        TEXT_STYLE_BOLD: {
          fontSize: sizes.FONTSIZE,
          color: colors.PRIMARY_TEXT,
          fontFamily: fonts.bold,
          ...(isArabic && { lineHeight: sizes.FONTSIZE * 1.35 }),
        },
        SHADOW_STYLE_STORE_CARD: {
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.07,
          shadowRadius: 40,
          elevation: 4,
        },
        SHADOW_STYLE_SEARCH_BAR: {
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.05,
          shadowRadius: 17,
          elevation: 17,
        },
        SHADOW_STYLE: {
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.08,
          shadowRadius: 17,
          elevation: 4,
        },
        SHADOW_STYLE_INPUT: {
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.05,
          shadowRadius: 17,
          elevation: 3,
        },
        SHADOW_STYLE_MEDIUM: {
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.25,
          shadowRadius: 8,
          elevation: 3,
        },
        SHADOW_STYLE_LOW: {
          shadowColor: '#0000000D',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 2,
        },
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
      }),
    [colors, sizes, isArabic],
  );
};
