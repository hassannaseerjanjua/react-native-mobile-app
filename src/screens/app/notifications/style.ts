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
        paddingHorizontal: sizes.PADDING,
        paddingTop: sizes.HEIGHT * 0.01,
      },
      NotificationItem: {
        height: sizes.HEIGHT * 0.08,
        marginBottom: sizes.HEIGHT * 0.016,
        borderRadius: sizes.BORDER_RADIUS,
        ...theme.globalStyles.SHADOW_STYLE,
      },
    }),
    theme,
  };
};

export default useStyles;
