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
        paddingTop: sizes.HEIGHT * 0.012,
        paddingBottom: sizes.HEIGHT * 0.1,
      },
      TabItem: {
        height: sizes.HEIGHT * 0.075,
        marginBottom: sizes.HEIGHT * 0.016,
        borderRadius: sizes.BORDER_RADIUS_MID,
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
        marginTop: sizes.HEIGHT * 0.02,
      },
    }),
    theme,
  };
};

export default useStyles;
