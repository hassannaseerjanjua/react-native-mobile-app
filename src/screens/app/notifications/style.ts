import { StyleSheet } from 'react-native';
import useTheme from '../../../styles/theme';
import { isAndroid, scaleWithMax } from '../../../utils';

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
        height: scaleWithMax(75, 78),
        marginBottom: sizes.HEIGHT * 0.014,
        borderRadius: 12,
      },
    }),
    theme,
  };
};

export default useStyles;
