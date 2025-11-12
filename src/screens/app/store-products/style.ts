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
      },
      favoritesContainer: {
        // paddingTop: sizes.PADDING,
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
        // width: '48%',
        // marginBottom: sizes.HEIGHT * 0.015,
      },
      topImage: {
        width: sizes.WIDTH,
        height: sizes.HEIGHT * 0.2,
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
        objectFit: 'cover',
      },
      bottomImage: {
        width: scaleWithMax(55, 58),
        height: scaleWithMax(55, 58),
        borderRadius: 99,
        objectFit: 'cover',
        position: 'absolute',
        bottom: -25,
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
        paddingTop: sizes.HEIGHT * 0.02,
        // paddingBottom: sizes.HEIGHT * 0.02,
        paddingHorizontal: sizes.PADDING,
      },
    }),
    theme,
  };
};

export default useStyles;
