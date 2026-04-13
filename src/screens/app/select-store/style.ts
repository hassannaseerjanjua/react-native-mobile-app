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

        // paddingBottom: sizes.HEIGHT * 0.05,
      },
      favoritesContainer: {},
      favoriteItemContainer: {
        paddingBottom: sizes.HEIGHT * 0.015,
        // backgroundColor: 'red',
        paddingTop: sizes.HEIGHT * 0.018,
      },
      tabsContainer: {
        marginVertical: sizes.HEIGHT * 0.016,

        // height: sizes.HEIGHT * 0.044,
      },
      gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: sizes.PADDING,
      },
      gridItem: {},
    }),
    theme,
  };
};

export default useStyles;
