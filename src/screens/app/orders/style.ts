import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import useTheme from '../../../styles/theme';
import { scaleWithMax } from '../../../utils';

const useStyles = () => {
  const theme = useTheme();

  const styles = useMemo(() => {
    const { colors, sizes, fonts } = theme;

    return StyleSheet.create({
      container: {
        ...theme.globalStyles.CONTAINER_STYLE,
        paddingHorizontal: 0,
        backgroundColor: theme.colors.HOME_BACKGROUND,
      },
      scrollView: {
        flex: 1,
      },
      scrollContent: {},
      contentContainer: {
        paddingHorizontal: sizes.PADDING,
        paddingVertical: sizes.HEIGHT * 0.02,
      },
      orderCard: {
        backgroundColor: colors.WHITE,
        borderRadius: sizes.BORDER_RADIUS * 1.2,
        padding: sizes.PADDING * 0.8,
        ...theme.globalStyles.SHADOW_STYLE,
      },
      rowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: sizes.PADDING * 0.3,
      },
      leftSection: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        flex: 1,
      },
      imageContainer: {
        marginRight: sizes.PADDING * 0.5,
      },
      orderCardImage: {
        width: scaleWithMax(72, 78),
        height: scaleWithMax(72, 78),
        borderRadius: sizes.BORDER_RADIUS,
        resizeMode: 'cover',
      },
      productInfo: {
        flex: 1,
        justifyContent: 'flex-start',
      },
      orderCardTitle: {
        fontFamily: fonts.semibold,
        fontSize: sizes.FONTSIZE,
        color: colors.BLACK,
      },
      orderCardSubtitle: {
        fontFamily: fonts.medium,
        fontSize: sizes.FONTSIZE_MEDIUM,
        color: colors.BLACK,
        marginTop: sizes.PADDING * 0.1,
      },
      rightSection: {
        alignItems: 'flex-end',
      },
      statusBadge: {
        marginBottom: sizes.PADDING * 0.4,
      },
      orderCardStatus: {
        fontFamily: fonts.bold,
        fontSize: sizes.FONTSIZE_MEDIUM,
        color: colors.PRIMARY,
        backgroundColor: colors.SECONDARY,
        borderRadius: sizes.BORDER_RADIUS * 0.6,
        paddingHorizontal: sizes.PADDING * 0.8,
        paddingVertical: sizes.PADDING * 0.25,
      },
      orderNumberBadge: {
        backgroundColor: colors.PRIMARY,
        borderRadius: sizes.BORDER_RADIUS * 0.6,
        paddingHorizontal: sizes.PADDING * 0.8,
        paddingVertical: sizes.PADDING * 0.25,
      },
      orderCardNumber: {
        fontFamily: fonts.medium,
        fontSize: sizes.FONTSIZE_MEDIUM,
        color: colors.WHITE,
      },
      orderDetailsContainer: {
        marginTop: sizes.PADDING * 0.5,
      },
      detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: sizes.PADDING * 0.2,
      },
      itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: sizes.PADDING * 0.9,
        marginVertical: sizes.PADDING * 0.4,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#EDEDED',
      },
      detailLabel: {
        fontFamily: fonts.regular,
        fontSize: sizes.FONTSIZE,
        color: colors.BLACK,
        flexShrink: 1,
        maxWidth: '48%',
      },
      detailValue: {
        fontFamily: fonts.medium,
        fontSize: sizes.FONTSIZE,
        color: colors.BLACK,
        textAlign: 'right',
        flex: 0.6,
      },
      itemDetails: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: sizes.PADDING * 0.5,
        justifyContent: 'space-between',
        flex: 0.75,
      },
      itemSize: {
        fontFamily: fonts.medium,
        fontSize: sizes.FONTSIZE,
        color: colors.BLACK,
        textAlign: 'center',
        flex: 1,
        minWidth: 0,
      },
      itemPrice: {
        fontFamily: fonts.semibold,
        fontSize: sizes.FONTSIZE,
        color: colors.PRIMARY_TEXT,
        marginStart: sizes.PADDING * 0.2,
      },
      priceContainer: {
        alignItems: 'center',
        flexShrink: 0,
        marginStart: sizes.PADDING * 0.5,
      },
      totalLabel: {
        fontFamily: fonts.semibold,
        fontSize: sizes.FONTSIZE,
        color: colors.PRIMARY_TEXT,
      },
      totalValue: {
        fontFamily: fonts.bold,
        fontSize: sizes.FONTSIZE_BUTTON,
        color: colors.PRIMARY_TEXT,
        marginStart: sizes.PADDING * 0.2,
      },
      totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      },
    });
  }, [theme]);

  return { styles, theme };
};

export default useStyles;
