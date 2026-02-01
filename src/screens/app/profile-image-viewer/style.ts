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
      imageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        // paddingHorizontal: sizes.PADDING,
        backgroundColor: theme.colors.HOME_BACKGROUND,
      },
      imageTouchable: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
      },
      image: {
        width: '100%',
        height: sizes.HEIGHT * 1,
        maxHeight: sizes.HEIGHT *1,
      },
      rightIconsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scaleWithMax(20, 20),
        backgroundColor: 'transparent',
      },
      iconButton: {
        backgroundColor: 'transparent',
      },
      iconWrapper: {
        backgroundColor: 'transparent',
      },
      imageLoading: {
        opacity: 0.5,
      },
      loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
      },
      loaderContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.LIGHT_GRAY,
        zIndex: 1,
      },
    });
  }, [theme]);

  return { styles, theme };
};

export default useStyles;
