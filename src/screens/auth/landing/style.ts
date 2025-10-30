import { StyleSheet } from 'react-native';
import useTheme from '../../../styles/theme';
import { useMemo } from 'react';
import { isIOS, scaleWithMax } from '../../../utils';

const useStyles = () => {
  const theme = useTheme();

  const styles = useMemo(() => {
    const { colors, sizes } = theme;
    return StyleSheet.create({
      container: {
        backgroundColor: colors.BACKGROUND,
        flex: 1,
        padding: sizes.PADDING,
      },
      logoContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: sizes.HEIGHT * 0.088,
      },
      logo: {
        width: scaleWithMax(146, 160),
        height: scaleWithMax(56, 60),
        resizeMode: 'contain',
      },
      buttonContainer: {
        gap: 16,
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 10,
      },
      languageContainer: {
        // position: 'absolute',
        // top: sizes.PADDING * 0.5,
        // end: 0,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        zIndex: 1,
      },
    });
  }, [theme]);

  return {
    theme,
    styles,
  };
};

export default useStyles;
