import { StyleSheet } from 'react-native';
import { useMemo } from 'react';
import useTheme from '../../../styles/theme';
import { isIOSThen, scaleWithMax } from '../../../utils';

const useStyles = () => {
  const theme = useTheme();

  const styles = useMemo(() => {
    const { colors, sizes } = theme;

    return StyleSheet.create({
      TextLarge: {
        ...theme.globalStyles.TEXT_STYLE_BOLD,
        fontSize: sizes.FONT_SIZE_EXTRA_HIGH,
      },
      TextMedium: {
        ...theme.globalStyles.TEXT_STYLE_MEDIUM,
        fontSize: sizes.FONTSIZE_MED_HIGH,
      },
      QrContainer: {
        backgroundColor: colors.WHITE,
        padding: sizes.HEIGHT * 0.035,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
      },
      QrCodeNums: {
        ...theme.globalStyles.TEXT_STYLE_SEMIBOLD,
        fontSize: sizes.FONTSIZE_HEADING,
        color: colors.PRIMARY,
        letterSpacing: sizes.WIDTH * 0.035,
      },
      ProductContainer: {
        backgroundColor: colors.WHITE,
        padding: sizes.PADDING,
        borderRadius: 12,

        // marginVertical: sizes.PADDING * 0.6,
        flexDirection: 'row',
        gap: sizes.PADDING * 0.8,
        alignItems: 'center',
      },
      ProductImage: {
        borderRadius: 10,
        height: scaleWithMax(50, 55),
        width: scaleWithMax(50, 55),
      },
      numCircle: {
        width: scaleWithMax(24, 25),
        height: scaleWithMax(24, 25),
        borderRadius: scaleWithMax(14, 16),
        backgroundColor: theme.colors.PRIMARY,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 'auto',
        zIndex: 1,
      },
      numText: {
        ...theme.globalStyles.TEXT_STYLE,
        fontSize: sizes.FONTSIZE,
        color: theme.colors.WHITE,
        position: 'absolute',
        left: 0,
        right: 0,
        textAlign: 'center',
        zIndex: 0,
      },
    });
  }, [theme]);

  return { theme, styles };
};

export default useStyles;
