import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import useTheme from '../../../styles/theme';
import fonts from '../../../assets/fonts';
import { scaleWithMax } from '../../../utils';

const useStyles = () => {
  const theme = useTheme();

  const styles = useMemo(() => {
    const { colors, sizes } = theme;

    return StyleSheet.create({
      container: {
        ...theme.globalStyles.CONTAINER_STYLE,
        backgroundColor: colors.HOME_BACKGROUND,
        paddingHorizontal: 0,
      },
      scrollView: {
        flex: 1,
      },
      scrollContent: {
        paddingHorizontal: sizes.PADDING,
        paddingBottom: sizes.HEIGHT * 0.02,
      },
      formContainer: {
        marginVertical: 20,
      },
      inputContainer: {
        marginBottom: 20,
      },
      buttonContainer: {
        marginTop: sizes.PADDING,
        paddingHorizontal: scaleWithMax(4, 6),
      },
    });
  }, [theme]);

  return { styles, theme };
};

export default useStyles;
