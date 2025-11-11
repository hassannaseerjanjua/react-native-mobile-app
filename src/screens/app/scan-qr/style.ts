import { StyleSheet } from 'react-native';
import { useMemo } from 'react';
import useTheme from '../../../styles/theme';
import fonts from '../../../assets/fonts';
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
        ...theme.globalStyles.SHADOW_STYLE,
        backgroundColor: colors.WHITE,
        padding: sizes.HEIGHT * 0.035,
        borderRadius: 8,
        marginVertical: sizes.PADDING,
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

        marginVertical: sizes.PADDING * 0.6,
        // justifyContent: 'space-between',
        flexDirection: 'row',
        gap: sizes.PADDING,
        alignItems: 'center',
      },
      ProductImage: {
        borderRadius: 10,
        height: scaleWithMax(50, 55),
        width: scaleWithMax(50, 55),
      },
      numCircle: {
        padding: scaleWithMax(12, 15),
        overflow: 'hidden',
        borderRadius: 99,
        backgroundColor: theme.colors.PRIMARY,
        position: 'relative',
        marginLeft: 'auto',

        // marginRight: sizes.MARGIN,
      },
      numText: {
        color: theme.colors.WHITE,
        // fontWeight: 'bold',

        position: 'absolute',
        top: 4,
        right: 0,
        bottom: 0,
        left: 10,
        alignItems: 'center',
        justifyContent: 'center',
      },
    });
  }, [theme]);

  return { theme, styles };
};

export default useStyles;
