import { StyleSheet } from 'react-native';
import useTheme from '../../../styles/theme';
import { useMemo } from 'react';

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
      },
      buttonContainer: {
        gap: sizes.PADDING,
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: sizes.BOTTOM_PADDING,
      },
    });
  }, [theme]);

  return {
    theme,
    styles,
  };
};

export default useStyles;
