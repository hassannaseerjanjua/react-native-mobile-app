import { StyleSheet } from 'react-native';
import useTheme from '../../../styles/theme';
import { scaleWithMax } from '../../../utils';

const useStyles = () => {
  const theme = useTheme();
  const { sizes } = theme;
  return {
    styles: StyleSheet.create({
      container: {
        ...theme.globalStyles.CONTAINER_STYLE,
        paddingHorizontal: 0,
        flex: 1,
      },
      content: {
        paddingHorizontal: sizes.PADDING,
        paddingTop: sizes.HEIGHT * 0.005,
        paddingBottom: sizes.HEIGHT * 0.0255,
      },
      favoritesContainer: {
        paddingHorizontal: sizes.PADDING,
        paddingTop: sizes.HEIGHT * 0.005,
      },
      favoriteItemContainer: {
        paddingBottom: sizes.HEIGHT * 0.015,
      },
      tabsContainer: {
        marginVertical: sizes.HEIGHT * 0.02,
        height: sizes.HEIGHT * 0.044,
      },
      gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: sizes.PADDING,
      },
      gridItem: {
      },
      topImage: {
        width: sizes.WIDTH,
        height: sizes.HEIGHT * 0.2,
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
        objectFit: 'cover',
      },
      bottomImage: {
        width: scaleWithMax(68, 68),
        height: scaleWithMax(68, 68),
        borderRadius: 99,
        objectFit: 'cover',
        position: 'absolute',
        bottom: sizes.HEIGHT * -0.028,
        left: 20,
        zIndex: 2,
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
      textLarge: {
        ...theme.globalStyles.TEXT_STYLE_BOLD,
        fontSize: sizes.FONTSIZE_MED_HIGH,
        color: '#1A1A1A',
      },
      textMedium: {
        fontSize: sizes.FONTSIZE,
        color: '#808080',
      },
      headingContainer: {
        paddingTop: sizes.HEIGHT * 0.028,
        paddingHorizontal: sizes.PADDING,
      },
      footerContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: theme.colors.WHITE,
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        ...theme.globalStyles.SHADOW_STYLE,
        paddingHorizontal: sizes.PADDING,
        paddingTop: sizes.HEIGHT * 0.015,
        paddingBottom: sizes.HEIGHT * 0.024,
      },
      footerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: theme.colors.PRIMARY,
        borderRadius: 10,
        paddingHorizontal: sizes.PADDING,
        height: scaleWithMax(45, 50),
        width: '100%',
        position: 'relative',
      },
      footerQuantityBadge: {
        width: scaleWithMax(28, 32),
        height: scaleWithMax(28, 32),
        borderRadius: scaleWithMax(14, 16),
        backgroundColor: theme.colors.WHITE,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
      },
      footerQuantityText: {
        ...theme.globalStyles.TEXT_STYLE_BOLD,
        fontSize: sizes.FONTSIZE_MEDIUM,
        color: theme.colors.PRIMARY,
      },
      footerButtonText: {
        ...theme.globalStyles.TEXT_STYLE,
        fontSize: sizes.FONTSIZE_BUTTON,
        color: theme.colors.WHITE,
        position: 'absolute',
        left: 0,
        right: 0,
        textAlign: 'center',
        zIndex: 0,
      },
      footerPriceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scaleWithMax(4, 4),
        zIndex: 1,
      },
      footerPriceText: {
        ...theme.globalStyles.TEXT_STYLE,
        fontSize: sizes.FONTSIZE_BUTTON,
        color: theme.colors.WHITE,
      },
    }),
    theme,
  };
};

export default useStyles;
