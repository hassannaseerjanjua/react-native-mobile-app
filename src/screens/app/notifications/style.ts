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
      },
      NotificationItem: {
        height: sizes.HEIGHT * 0.092,
        marginBottom: sizes.HEIGHT * 0.024,
      },
    }),
    theme,
  };
};

export default useStyles;
