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
      },
      loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: sizes.HEIGHT * 0.2,
      },
      listContainer: {
        paddingVertical: sizes.PADDING,
        paddingHorizontal: sizes.PADDING,
        gap: sizes.HEIGHT * 0.005,
      },
      cardContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: theme.colors.WHITE,
        borderRadius: sizes.BORDER_RADIUS,
        paddingVertical: sizes.PADDING * 0.5,
        paddingHorizontal: sizes.PADDING * 0.75,
        gap: sizes.WIDTH * 0.03,
        ...theme.globalStyles.SHADOW_STYLE,
      },
      row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: sizes.WIDTH * 0.013,
        // ...theme.globalStyles.SHADOW_STYLE,
      },
      cardNumber: {
        ...theme.globalStyles.TEXT_STYLE_MEDIUM,
        fontSize: theme.sizes.FONTSIZE,
        color: theme.colors.BLACK,
      },
      cardBrand: {
        ...theme.globalStyles.TEXT_STYLE_MEDIUM,
        fontSize: theme.sizes.FONTSIZE,
        color: theme.colors.BLACK,
      },
      emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: sizes.HEIGHT * 0.78,
      },
    }),
    theme,
  };
};

export default useStyles;
