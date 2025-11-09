import { StyleSheet } from 'react-native';
import useTheme from '../../../styles/theme';
import { scaleWithMax } from '../../../utils';

const useStyles = () => {
  const theme = useTheme();
  const { sizes } = theme;
  return {
    styles: StyleSheet.create({
      heading: {
        ...theme.globalStyles.TEXT_STYLE_SEMIBOLD,
        fontSize: sizes.FONTSIZE_LESS_HIGH,
        color: theme.colors.BLACK,
      },
      CartContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.WHITE,
        borderRadius: sizes.BORDER_RADIUS,
        marginVertical: sizes.PADDING * 0.6,
        padding: sizes.PADDING,
        gap: sizes.WIDTH * 0.03,
      },
      GiftContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: theme.colors.WHITE,
        // backgroundColor: theme.colors.RED,
        borderRadius: sizes.BORDER_RADIUS,
        marginVertical: sizes.PADDING,
        padding: sizes.PADDING,
        gap: sizes.WIDTH * 0.03,
      },

      CartProductImage: {
        width: scaleWithMax(80, 85),
        height: scaleWithMax(80, 85),
        borderRadius: sizes.BORDER_RADIUS,
        // marginRight: sizes.MARGIN,
      },
      GiftContainerImage: {
        width: scaleWithMax(30, 35),
        height: scaleWithMax(30, 35),
        borderRadius: 999,
        // marginRight: sizes.MARGIN,
      },
      TextSmall: {
        ...theme.globalStyles.TEXT_STYLE_MEDIUM,

        fontSize: sizes.FONTSIZE,
        color: theme.colors.BLACK,
      },
      TextMedium: {
        ...theme.globalStyles.TEXT_STYLE_MEDIUM,
        fontSize: theme.sizes.FONTSIZE_MEDIUM,
        color: theme.colors.BLACK,
      },
      TextLarge: {
        ...theme.globalStyles.TEXT_STYLE_MEDIUM,
        fontSize: theme.sizes.FONT_SIZE_EXTRA_HIGH,
        color: theme.colors.BLACK,
      },
      row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: sizes.WIDTH * 0.013,
      },
      selectionCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: theme.colors.SECONDARY_GRAY,
        backgroundColor: 'transparent',
        position: 'relative',
      },
      selectedCircle: {
        backgroundColor: theme.colors.PRIMARY,
        borderColor: theme.colors.PRIMARY,
      },
      iconWrapper: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        alignItems: 'center',
        justifyContent: 'center',
      },
      Prices: {
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row',
        borderBottomColor: theme.colors.BORDER_COLOR,
        borderBottomWidth: 1,
        paddingVertical: sizes.PADDING * 0.6,
      },
      CartPrice: {},
      checkoutCompletedContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      },
    }),
    theme,
  };
};

export default useStyles;
