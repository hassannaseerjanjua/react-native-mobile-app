import { Platform, StyleSheet } from 'react-native';
import { Colors } from './colors';
import { Sizes } from './sizes';
import { useMemo } from 'react';
import fonts from '../assets/fonts';
import { isAndroid } from '../utils';

export const getGlobalStyles = (colors: Colors, sizes: Sizes) => {
  return useMemo(
    () =>
      StyleSheet.create({
        TEXT_STYLE: {
          fontSize: sizes.FONTSIZE,
          color: colors.PRIMARY_TEXT,
          fontFamily: fonts.Quicksand.regular,
        },
        TEXT_STYLE_SEMIBOLD: {
          fontSize: sizes.FONTSIZE,
          color: colors.PRIMARY_TEXT,
          fontFamily: fonts.Quicksand.semibold,
        },
        TEXT_STYLE_MEDIUM: {
          fontSize: sizes.FONTSIZE,
          color: colors.PRIMARY_TEXT,
          fontFamily: fonts.Quicksand.medium,
        },
        TEXT_STYLE_BOLD: {
          fontSize: sizes.FONTSIZE,
          color: colors.PRIMARY_TEXT,
          fontFamily: fonts.Quicksand.bold,
        },
        SHADOW_STYLE_STORE_CARD: {
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.07,
          shadowRadius: 40,
          elevation: 40,
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
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.05,
          shadowRadius: 17,
          elevation: 17,
        },
        SHADOW_STYLE_MEDIUM: {
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.25,
          shadowRadius: 8,
          elevation: 10,
        },
        SHADOW_STYLE_LOW: {
          shadowColor: '#0000000D',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 10,
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
      }),
    [colors, sizes],
  );
};
