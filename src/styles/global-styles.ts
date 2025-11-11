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
        SHADOW_STYLE: {
          shadowColor: colors.PRIMARY_TEXT,
          shadowOffset: {
            width: 0,
            height: 1,
          },
          shadowOpacity: 0.22,
          shadowRadius: 2.22,
          elevation: 5,
          borderColor: colors.LIGHT_GRAY,
          borderWidth: Platform.OS == 'android' && colors.isDark ? 0.5 : 0,
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
