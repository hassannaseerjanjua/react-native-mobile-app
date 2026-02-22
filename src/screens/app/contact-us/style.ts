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
        paddingHorizontal: 0,
      },
      scrollView: {
        flex: 1,
      },
      scrollContent: {
        flex: 1,
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
        // marginTop: sizes.PADDING,
      },
      whatsappContainer: {
        position: 'absolute',
        bottom: sizes.HEIGHT * 0.05,
        right: sizes.PADDING,
      },
    });
  }, [theme]);

  return { styles, theme };
};

export default useStyles;
