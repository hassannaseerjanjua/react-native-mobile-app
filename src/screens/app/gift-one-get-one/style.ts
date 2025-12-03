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
      tabsContainer: {
        marginVertical: sizes.HEIGHT * 0.02,
        height: sizes.HEIGHT * 0.044,
      },
      content: {
        flex: 1,
        paddingHorizontal: sizes.PADDING,
        paddingTop: sizes.HEIGHT * 0.005,
      },
      listContent: {
        paddingBottom: sizes.PADDING * 3,
        gap: sizes.HEIGHT * 0.015,
      },
      favoriteItemContainer: {
        paddingBottom: sizes.HEIGHT * 0.015,
      },
    }),
    theme,
  };
};

export default useStyles;
