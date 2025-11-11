import { StyleSheet } from 'react-native';
import useTheme from '../../../styles/theme';
import { scaleWithMax } from '../../../utils';

const useStyles = () => {
  const theme = useTheme();
  const { sizes } = theme;
  return {
    styles: StyleSheet.create({
      formContainer: {
        marginVertical: 5,
      },
      inputContainer: {
        marginBottom: 0,
      },
      label: {
        ...theme.globalStyles.TEXT_STYLE_SEMIBOLD,
        fontSize: sizes.FONTSIZE_BUTTON,
        paddingVertical: sizes.PADDING * 0.4,
        paddingHorizontal: sizes.PADDING * 0.3,
      },
    }),
    theme,
  };
};

export default useStyles;
