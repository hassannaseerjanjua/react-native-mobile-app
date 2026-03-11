import { StyleSheet } from 'react-native';
import { useMemo } from 'react';
import useTheme from '../../../styles/theme';
import {
  isAndroid,
  isIOS,
  isIOSThen,
  isRTL,
} from '../../../utils';
import { useLocaleStore } from '../../../store/reducer/locale';

const useStyles = () => {
  const theme = useTheme();
  const { isRtl } = useLocaleStore();
  const styles = useMemo(() => {
    const { colors, sizes, fonts } = theme;

    return StyleSheet.create({
      container: {
        flex: 1,
        paddingHorizontal: 0,
        backgroundColor: 'transparent',
        position: 'relative',
      },
      mainContent: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
      },
      contentWrapper: {
        flex: 1,
        zIndex: 1,
        backgroundColor: 'transparent',
        overflow: 'hidden',
      },
      contentContainer: {
        flex: 1,
        // gap: scaleWithMax(10, 12),
        paddingHorizontal: sizes.PADDING,
      },
      welcomeText: {
        fontFamily: fonts.semibold,
        fontSize: sizes.FONTSIZE_HIGH,
        color: colors.BLACK,
        paddingHorizontal: sizes.PADDING,
        paddingBottom: isAndroid ? sizes.HEIGHT * 0.007 : sizes.HEIGHT * 0.01,
        // marginStart: scaleWithMax(1, 1),
      },
      userName: {
        fontFamily: fonts.bold,
      },
      heroImage: {
        borderRadius: sizes.BORDER_RADIUS_MID,
        height: sizes.HEIGHT * (isIOS ? 0.28 : 0.28),
      },
      sectionTitle: {
        fontFamily: fonts.bold,
        fontSize: sizes.FONTSIZE_HIGH,
        color: colors.PRIMARY_TEXT,
        // marginVertical: isIOSThen(scaleWithMax(8, 9), scaleWithMax(5, 7)),
        paddingHorizontal: sizes.PADDING,
        includeFontPadding: isRtl ? true : false,
        paddingVertical: isAndroid ? sizes.HEIGHT * 0.01 : sizes.HEIGHT * 0.012,
      },

      innerSectionTitle: {
        fontFamily: fonts.bold,
        fontSize: sizes.FONTSIZE_HIGH,
        includeFontPadding: isRtl ? true : false,
        color: colors.PRIMARY_TEXT,
        paddingVertical: isAndroid ? sizes.HEIGHT * 0.01 : sizes.HEIGHT * 0.012,
        // marginStart: scaleWithMax(2, 2),
      },
      optionsWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: sizes.WIDTH * 0.027,
        // marginVertical: scaleWithMax(10, 12),
      },
    });
  }, [theme]);

  return { theme, styles };
};

export default useStyles;
