import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import useTheme from '../../../styles/theme';
import { scaleWithMax } from '../../../utils';

const useStyles = () => {
  const theme = useTheme();

  const styles = useMemo(() => {
    const { colors, sizes } = theme;

    return StyleSheet.create({
      container: {
        ...theme.globalStyles.CONTAINER_STYLE,
        paddingHorizontal: 0,
      },
      scrollView: {
        flex: 1,
      },
      contentWrapper: {
        paddingVertical: sizes.HEIGHT * 0.01,
      },
      skeletonWrapper: {
        flex: 1,
        paddingHorizontal: sizes.PADDING,
      },
      loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: colors.BACKGROUND,
      },
      webView: {
        flex: 1,
      },
      scrollContent: {
        paddingHorizontal: sizes.PADDING,
        paddingBottom: sizes.HEIGHT * 0.02,
      },
    });
  }, [theme]);

  return { styles, theme };
};

export default useStyles;
