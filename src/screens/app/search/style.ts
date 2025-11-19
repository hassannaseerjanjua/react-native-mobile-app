import { StyleSheet } from 'react-native';
import { useMemo } from 'react';
import useTheme from '../../../styles/theme';
import fonts from '../../../assets/fonts';

const useStyles = () => {
  const theme = useTheme();

  const styles = useMemo(() => {
    const { colors, sizes } = theme;

    return StyleSheet.create({
      container: {
        ...theme.globalStyles.CONTAINER_STYLE,
        paddingHorizontal: 0,
      },
      content: {
        flex: 1,
      },
      contentContainer: {
        paddingHorizontal: sizes.PADDING,
        paddingVertical: sizes.PADDING,
        paddingBottom: sizes.HEIGHT * 0.02,
      },
      listCard: {
        backgroundColor: colors.WHITE,
        borderRadius: 16,
        ...theme.globalStyles.SHADOW_STYLE,
      },
      listContainer: {
        paddingVertical: 2,
      },
      loadingContainer: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
      },
      loadingText: {
        fontSize: 16,
        color: '#666',
        fontFamily: fonts.Quicksand.medium,
      },
    });
  }, [theme]);

  return { theme, styles };
};

export default useStyles;
