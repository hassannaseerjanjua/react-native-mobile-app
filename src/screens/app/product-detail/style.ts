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
        shadowColor: '#00000020',
        shadowOpacity: 0.2,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 4,
      },
      backContainer: {
        ...theme.globalStyles.SHADOW_STYLE,
        backgroundColor: theme.colors.WHITE,
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
      scrollViewContent: {
        paddingBottom: sizes.HEIGHT * 0.14,
      },
      sliderWrapper: {
        paddingHorizontal: 0,
        backgroundColor: theme.colors.BACKGROUND,
      },
      sliderContent: {
        justifyContent: 'center',
        alignItems: 'center',
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
        fontSize: sizes.FONTSIZE_MED_HIGH,
        color: colors.BLACK,
        lineHeight: sizes.FONTSIZE_MED_HIGH * 1.3,
        flex: 1,
      },
      SubTitle: {
        ...theme.globalStyles.TEXT_STYLE_MEDIUM,
        fontSize: sizes.FONTSIZE_MEDIUM,
        color: colors.SECONDARY_TEXT,
      },
      titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: sizes.WIDTH * 0.03,
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
        textAlign: 'right',
      },
      price: {
        ...theme.globalStyles.TEXT_STYLE_BOLD,
        color: theme.colors.PRIMARY_TEXT,
        fontSize: scaleWithMax(20, 22),
      },
      ProductTitleContainer: {
        paddingVertical: sizes.HEIGHT * 0.015,
        borderBottomColor: colors.SECONDARY_GRAY,
        borderBottomWidth: 1,
        paddingBottom: sizes.HEIGHT * 0.016,
      },

      ProductDescriptionContainer: {
        paddingBottom: sizes.HEIGHT * 0.006,
        gap: sizes.HEIGHT * 0.01,
      },
      Heading: {
        ...theme.globalStyles.TEXT_STYLE_SEMIBOLD,
        fontSize: sizes.FONTSIZE_MED_HIGH,
        color: theme.colors.BLACK,
      },
      Description: {
        ...theme.globalStyles.TEXT_STYLE,
        fontSize: sizes.FONTSIZE,
        color: theme.colors.BLACK,
      },
      tabsContainer: {
        marginVertical: sizes.HEIGHT * 0.02,
        height: sizes.HEIGHT * 0.04,
      },
      button: {
        width: sizes.WIDTH * 0.6,
      },
      QuantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: sizes.WIDTH * 0.02,
        borderColor: colors.PRIMARY,
        borderWidth: 1.3,
        width: sizes.WIDTH * 0.28,
        borderRadius: 10,
        height: scaleWithMax(45, 50),
        justifyContent: 'center',
      },
      QuantityText: {
        fontSize: sizes.FONTSIZE_MED_HIGH,
        color: theme.colors.PRIMARY,
      },
      LowerContainer: {
        marginHorizontal: sizes.PADDING,
        gap: sizes.HEIGHT * 0.02,
      },
    });
  }, [theme]);

  return { styles, theme };
};

export default useStyles;
