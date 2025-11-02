import { StyleSheet } from 'react-native';
import useTheme from '../../../styles/theme';
import { isAndroid } from '../../../utils';

const useStyles = () => {
  const theme = useTheme();
  const { sizes } = theme;
  return {
    styles: StyleSheet.create({
      container: {
        ...theme.globalStyles.CONTAINER_STYLE,
        paddingHorizontal: 0,
      },
      content: {
        // flex: 1,
        paddingHorizontal: sizes.PADDING,
        paddingTop: sizes.HEIGHT * 0.01,
        paddingBottom: sizes.HEIGHT * 0.12,
      },
      TabItem: {
        height: sizes.HEIGHT * 0.082,
        marginBottom: sizes.HEIGHT * 0.024,
      },
      buttonContainer: {
        position: 'absolute',
        bottom: sizes.HEIGHT * 0.02,
        left: sizes.PADDING,
        right: sizes.PADDING,
      },
      inputContainer: {
        marginBottom: sizes.HEIGHT * 0.02,
      },
      button: {
        marginTop: sizes.HEIGHT * 0.1,
      },
    }),
    theme,
  };
};

export default useStyles;
