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
        flex: 1,
        backgroundColor: colors.BACKGROUND,
        paddingHorizontal: sizes.PADDING,
      },
      content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: sizes.PADDING,
      },
      title: {
        fontFamily: fonts.Quicksand.bold,
        fontSize: sizes.FONTSIZE_HEADING,
        color: colors.PRIMARY_TEXT,
        marginBottom: sizes.HEIGHT * 0.02,
        textAlign: 'center',
      },
      subtitle: {
        fontFamily: fonts.Quicksand.semibold,
        fontSize: sizes.FONTSIZE_MEDIUM,
        color: colors.SECONDARY_TEXT,
        marginBottom: sizes.HEIGHT * 0.01,
        textAlign: 'center',
      },
      description: {
        fontFamily: fonts.Quicksand.regular,
        fontSize: sizes.FONTSIZE_SMALL,
        color: colors.SECONDARY_TEXT,
        textAlign: 'center',
        lineHeight: 20,
      },
    });
  }, [theme]);

  return { theme, styles };
};

export default useStyles;
