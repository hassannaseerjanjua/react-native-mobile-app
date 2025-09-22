import { Platform, StyleSheet } from 'react-native';
import { Colors } from './colors';
import { Sizes } from './sizes';
import { useMemo } from 'react';
import fonts from '../assets/fonts';

export const getGlobalStyles = (colors: Colors, sizes: Sizes) => {
  return useMemo(
    () =>
      StyleSheet.create({
        TEXT_STYLE: {
          fontSize: sizes.FONTSIZE,
          color: colors.PRIMARY_TEXT,
          fontFamily: fonts.Quicksand.regular,
        },
        TEXT_STYLE_BOLD: {
          fontSize: sizes.FONTSIZE,
          color: colors.PRIMARY_TEXT,
          fontFamily: fonts.Quicksand.bold,
        },
        SHADOW_STYLE: {
          shadowColor: colors.PRIMARY_TEXT,
          shadowOffset: {
            width: 0,
            height: 1,
          },
          shadowOpacity: 0.22,
          shadowRadius: 2.22,
          elevation: 3,
          borderColor: colors.LIGHT_GRAY,
          borderWidth: Platform.OS == 'android' && colors.isDark ? 0.5 : 0,
        },
      }),
    [colors, sizes],
  );
};
