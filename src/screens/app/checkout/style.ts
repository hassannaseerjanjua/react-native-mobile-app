import { StyleSheet } from 'react-native';
import useTheme from '../../../styles/theme';
import { scaleWithMax } from '../../../utils';

const useStyles = () => {
  const theme = useTheme();
  const { sizes } = theme;
  return {
    styles: StyleSheet.create({
      container: {
        flex: 1,
        marginBottom: sizes.HEIGHT * 0.015,
      },
      scrollContent: {
        paddingHorizontal: 0,
        paddingBottom: sizes.HEIGHT * 0.03,
        paddingTop: sizes.HEIGHT * 0.01,
        gap: sizes.HEIGHT * 0.02,
      },
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
        paddingVertical: sizes.PADDING * 0.55,
        paddingHorizontal: sizes.PADDING * 0.75,
        gap: sizes.WIDTH * 0.03,
      },
      GiftContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: theme.colors.WHITE,
        borderRadius: sizes.BORDER_RADIUS,
        paddingHorizontal: sizes.PADDING * 0.75,
        gap: sizes.WIDTH * 0.03,
        ...theme.globalStyles.BUTTON_TAB_TFIELD_HEIGHT,
      },

      CartProductImage: {
        width: scaleWithMax(80, 85),
        height: scaleWithMax(80, 85),
        borderRadius: sizes.BORDER_RADIUS,
      },
      GiftContainerImage: {
        width: scaleWithMax(30, 35),
        height: scaleWithMax(30, 35),
        borderRadius: 999,
      },
      LinkImage: {
        width: scaleWithMax(15, 18),
        marginVertical: scaleWithMax(8, 10),
        height: scaleWithMax(15, 18),
      },
      TextSmall: {
        ...theme.globalStyles.TEXT_STYLE_MEDIUM,
        fontSize: sizes.FONTSIZE_SMALL,
        color: theme.colors.SECONDARY_TEXT,
      },
      TextMedium: {
        ...theme.globalStyles.TEXT_STYLE_MEDIUM,
        fontSize: theme.sizes.FONTSIZE,
        color: theme.colors.BLACK,
      },
      TextLarge: {
        ...theme.globalStyles.TEXT_STYLE_MEDIUM,
        fontSize: theme.sizes.FONT_SIZE_EXTRA_HIGH,
        color: theme.colors.BLACK,
        // marginTop: sizes.HEIGHT * 0.02,
      },
      row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: sizes.WIDTH * 0.013,
      },
      Prices: {
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row',
        borderBottomColor: theme.colors.SECONDARY_GRAY,
        borderBottomWidth: 0.6,
        paddingVertical: sizes.PADDING * 0.36,
      },
      checkoutCompletedContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      },
      cartTitle: {
        ...theme.globalStyles.TEXT_STYLE_SEMIBOLD,
        fontSize: sizes.FONTSIZE_SMALL_HEADING,
        color: theme.colors.BLACK,
      },
      cartItemCountBadge: {
        ...theme.globalStyles.TEXT_STYLE_SEMIBOLD,
        fontSize: sizes.FONTSIZE_MEDIUM,
        color: theme.colors.PRIMARY_TEXT,
        flexShrink: 0,
      },
      quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: sizes.WIDTH * 0.01,
      },
      quantityValue: {
        ...theme.globalStyles.TEXT_STYLE_SEMIBOLD,
        fontSize: sizes.FONTSIZE_MEDIUM,
        color: theme.colors.BLACK,
        minWidth: scaleWithMax(20, 22),
        textAlign: 'center',
        textAlignVertical: 'center',
      },
      vatNote: {
        ...theme.globalStyles.TEXT_STYLE_MEDIUM,
        textAlign: 'center',
        paddingVertical: sizes.PADDING * 0.6,
        fontSize: sizes.FONTSIZE_MEDIUM,
        color: theme.colors.BLACK,
      },
      footerContainer: {
        position: 'absolute',
        bottom: scaleWithMax(25, 30),
        left: 0,
        right: 0,
        paddingHorizontal: sizes.PADDING,
      },
      footerPriceWrapper: {
        position: 'absolute',
        top: sizes.HEIGHT * 0.018,
        right: sizes.WIDTH * 0.03,
      },
      sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      },
      addCardAction: {
        ...theme.globalStyles.TEXT_STYLE_MEDIUM,
        color: theme.colors.PRIMARY,
        fontSize: sizes.FONTSIZE_MEDIUM,
      },
      section: {
        marginHorizontal: sizes.PADDING,
        gap: sizes.HEIGHT * 0.009,
      },
      tabContainer: {
        // marginBottom: sizes.HEIGHT * 0.018,
        // height: sizes.HEIGHT * 0.05,
      },
      discountedPrice: {
        ...theme.globalStyles.TEXT_STYLE_BOLD,
        color: theme.colors.PRIMARY,
        fontSize: sizes.FONTSIZE_SMALL_HEADING,
        // marginEnd: scaleWithMax(1, 2),
      },
      price: {
        ...theme.globalStyles.TEXT_STYLE_BOLD,
        color: theme.colors.PRIMARY_TEXT,
        fontSize: sizes.FONTSIZE_BUTTON,
      },
      cutPrice: {
        ...theme.globalStyles.TEXT_STYLE_MEDIUM,
        color: '#C6C6C6',
        fontSize: sizes.FONTSIZE_MEDIUM,
        textDecorationLine: 'line-through',
      },
    }),

    theme,
  };
};

export default useStyles;
