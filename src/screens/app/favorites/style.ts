import { StyleSheet } from 'react-native';
import useTheme from '../../../styles/theme';

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
        flex: 1,
      },
      list: {
        flex: 1,
      },
      favoritesContainer: {
        paddingHorizontal: sizes.PADDING,
        paddingBottom: sizes.PADDING * 2,
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
      emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        minHeight: '100%',
        paddingVertical: sizes.HEIGHT * 0.1,
      },
    }),
    theme,
  };
};

export default useStyles;
