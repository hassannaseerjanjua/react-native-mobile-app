import { StyleSheet } from 'react-native';
import useTheme from '../../../styles/theme';

const useStyles = () => {
  const theme = useTheme();

  return {
    styles: StyleSheet.create({
      container: {
        ...theme.globalStyles.CONTAINER_STYLE,
      },
      content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
      },
      title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.PRIMARY_TEXT,
        textAlign: 'center',
      },
    }),
    theme,
  };
};

export default useStyles;
