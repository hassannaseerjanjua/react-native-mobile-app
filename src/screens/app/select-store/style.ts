import { StyleSheet } from 'react-native';
import useTheme from '../../../styles/theme';

const useStyles = () => {
  const theme = useTheme();
  const { sizes } = theme;
  return {
    styles: StyleSheet.create({
      container: {
        ...theme.globalStyles.CONTAINER_STYLE,
        // Let ParentView + ShadowLayout show through (opaque layer was covering the gradient).
        backgroundColor: 'transparent',
        paddingHorizontal: 0,
        flex: 1,
      },
      content: {
        flex: 1,
      },
      tabsWrapper: {
        zIndex: 1,
        elevation: 4,
        // backgroundColor: theme.colors.BACKGROUND,
        // paddingBottom: sizes.HEIGHT * 0.014,
        ...theme.globalStyles.SCROLL_SPACER,
      },
      storeList: {
        flex: 1,
      },
      favoritesContainer: {},
      favoriteItemContainer: {
        paddingBottom: sizes.HEIGHT * 0.018,
        // backgroundColor: 'red',
        // paddingTop: sizes.HEIGHT * 0.018,
      },
      tabsContainer: {
        // marginVertical: sizes.HEIGHT * 0.016,
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
