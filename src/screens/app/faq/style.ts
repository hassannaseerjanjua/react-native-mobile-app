import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import useTheme from '../../../styles/theme';
import { scaleWithMax } from '../../../utils';

const useStyles = () => {
  const theme = useTheme();

  const styles = useMemo(() => {
    const { colors, sizes } = theme;

    return StyleSheet.create({
      container: {
        ...theme.globalStyles.CONTAINER_STYLE,
        paddingHorizontal: 0,
        backgroundColor: theme.colors.HOME_BACKGROUND,
      },
      scrollView: {
        flex: 1,
      },
      scrollContent: {
        padding: sizes.PADDING,
        paddingBottom: sizes.HEIGHT * 0.02,
      },
      faqContainer: {
        gap: sizes.HEIGHT * 0.018,
      },

      faqItem: {
        paddingVertical: sizes.HEIGHT * 0.015,
      },
      faqItemText: {
        ...theme.globalStyles.TEXT_STYLE_SEMIBOLD,
        fontSize: sizes.FONTSIZE,
        maxWidth: '90%',
      },
    });
  }, [theme]);

  return { styles, theme };
};

export default useStyles;
