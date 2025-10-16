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
        backgroundColor: theme.colors.HOME_BACKGROUND,
      },
      scrollView: {
        flex: 1,
      },
      scrollContent: {
        paddingHorizontal: sizes.PADDING,
        paddingBottom: sizes.HEIGHT * 0.02,
      },
      faqContainer: {
        gap: sizes.PADDING * 1.2,
        paddingVertical: sizes.PADDING,
      },
      faqItemWrapper: {
        marginBottom: 0,
      },
      faqItem: {
        // backgroundColor: colors.WHITE,
        // borderRadius: sizes.BORDER_RADIUS,
        // paddingHorizontal: sizes.PADDING,
        paddingVertical: sizes.PADDING * 0.9,

        backgroundColor: colors.WHITE,
        shadowColor: 'lightgray',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 1,
        // shadowColor: '#0000000D',
        // shadowOffset: { width: 0, height: 1 },
        // shadowOpacity: 0.25,
        // shadowRadius: 3.84,
        // elevation: 1,
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
