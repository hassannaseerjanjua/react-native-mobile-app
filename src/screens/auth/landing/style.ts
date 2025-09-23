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
        marginTop: sizes.HEIGHT * 0.1,
      },
      logo: {
        width: scaleWithMax(146, 160),
        height: scaleWithMax(56, 60),
        resizeMode: 'contain',
      },
      buttonContainer: {
        gap: sizes.PADDING,
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: isIOS ? sizes.BOTTOM_PADDING : 10,
      },
    });
  }, [theme]);

  return {
    theme,
    styles,
  };
};

export default useStyles;
