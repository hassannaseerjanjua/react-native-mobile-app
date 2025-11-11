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
        paddingHorizontal: sizes.PADDING,
        paddingBottom: sizes.PADDING * 2,
      },
      tabsContainer: {
        marginVertical: sizes.HEIGHT * 0.02,
        // paddingHorizontal: sizes.PADDING,
        height: sizes.HEIGHT * 0.044,
      },
      listWrapper: {
        flex: 1,
      },
      listContent: {
        paddingHorizontal: sizes.PADDING,
        paddingTop: sizes.HEIGHT * 0.005,
        paddingBottom: sizes.PADDING * 2,
      },
      listContainer: {
        flexGrow: 1,
        gap: sizes.PADDING,
      },
      columnWrapper: {
        gap: sizes.PADDING,
      },
    }),
    theme,
  };
};

export default useStyles;
