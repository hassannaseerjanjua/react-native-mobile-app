import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import useTheme from '../../../styles/theme';
import fonts from '../../../assets/fonts';
import { scaleWithMax } from '../../../utils';

const useStyles = () => {
  const theme = useTheme();

  const styles = useMemo(() => {
    const { colors, sizes } = theme;

    return StyleSheet.create({
      container: {
        ...theme.globalStyles.CONTAINER_STYLE,
        paddingHorizontal: 0,
        backgroundColor: theme.colors.HOME_BACKGROUND,
      },
      rounded_white_background: {
        backgroundColor: colors.WHITE,
        borderRadius: 9999,
        width: scaleWithMax(25, 30),
        height: scaleWithMax(25, 30),
        alignItems: 'center',
        justifyContent: 'center',
      },
      ProductImage: {
        width: '100%',
        height: 300,
        position: 'relative',
      },
      spaceBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      },
      scrollView: {
        flex: 1,
      },
      scrollContent: {
        padding: sizes.PADDING,
        paddingBottom: sizes.HEIGHT * 0.02,
      },
      faqContainer: {
        gap: sizes.HEIGHT * 0.018,
      },

      faqItem: {
        paddingVertical: sizes.HEIGHT * 0.015,
        ...theme.globalStyles.SHADOW_STYLE_LOW,
      },
      faqItemText: {
        ...theme.globalStyles.TEXT_STYLE_SEMIBOLD,
        fontSize: sizes.FONTSIZE,
        maxWidth: '90%',
      },
      ProductTitle: {
        ...theme.globalStyles.TEXT_STYLE_MEDIUM,
        fontSize: sizes.FONTSIZE_HIGH,
        color: colors.BLACK,
      },
      priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
      },
      TaxIncludeText: {
        ...theme.globalStyles.TEXT_STYLE_MEDIUM,
        fontSize: sizes.FONTSIZE_MEDIUM,
        color: colors.SECONDARY_TEXT,
        // paddingHorizontal: sizes.PADDING,
      },
      price: {
        ...theme.globalStyles.TEXT_STYLE_BOLD,
        color: theme.colors.PRIMARY_TEXT,
        fontSize: sizes.FONTSIZE_HIGH,
      },
      ProductTitleContainer: {
        paddingVertical: sizes.HEIGHT * 0.015,
        borderBottomColor: colors.BORDER_COLOR,
        borderBottomWidth: 1,

        paddingBottom: sizes.HEIGHT * 0.02,
      },

      ProductDescriptionContainer: {
        paddingVertical: sizes.HEIGHT * 0.015,

        paddingBottom: sizes.HEIGHT * 0.02,
      },
      Heading: {
        ...theme.globalStyles.TEXT_STYLE_SEMIBOLD,
        fontSize: sizes.FONTSIZE_HIGH,
        color: theme.colors.BLACK,
      },
      Description: {
        ...theme.globalStyles.TEXT_STYLE,
        fontSize: sizes.FONTSIZE_BUTTON,
        color: theme.colors.BLACK,
      },
      tabsContainer: {
        marginVertical: sizes.HEIGHT * 0.02,
        height: sizes.HEIGHT * 0.044,
      },

      button: {
        // backgroundColor: colors.PRIMARY,
        // color: colors.WHITE,
        // borderRadius: 10,
        // justifyContent: 'center',
        // alignItems: 'center',
        // height: sizes.HEIGHT * 0.07,

        width: sizes.WIDTH * 0.6,
        // padding: scaleWithMax(15, 18),
      },
      QuantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: sizes.WIDTH * 0.02,
        borderColor: colors.PRIMARY,
        color: colors.PRIMARY,
        borderWidth: 1.3,
        width: sizes.WIDTH * 0.28,
        borderRadius: 10,
        height: scaleWithMax(45, 50),
        // paddingHorizontal: scaleWithMax(10, 12),
        justifyContent: 'center',
      },
      QuantityText: {
        fontSize: theme.sizes.FONT_SIZE_EXTRA_HIGH,
        color: theme.colors.PRIMARY,
      },
      LowerContainer: {
        marginHorizontal: sizes.PADDING,
      },
    });
  }, [theme]);

  return { styles, theme };
};

export default useStyles;
