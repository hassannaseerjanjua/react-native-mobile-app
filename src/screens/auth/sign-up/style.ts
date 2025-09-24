import { StyleSheet } from 'react-native';
import useTheme from '../../../styles/theme';
import { useMemo } from 'react';
import { isIOS, scaleWithMax } from '../../../utils';

const useStyles = () => {
  const theme = useTheme();

  const styles = useMemo(() => {
    const { colors, sizes } = theme;

    return StyleSheet.create({
      container: {
        backgroundColor: colors.BACKGROUND,
        padding: sizes.PADDING,
        flex: 1,
      },
      scrollContainer: {
        flex: 1,
      },
      contentContainer: {
        flexGrow: 1,
        paddingBottom: isIOS ? sizes.BOTTOM_PADDING : 10,
      },
      logoContainer: {
        alignItems: 'center',
        marginBottom: scaleWithMax(50, 55),
      },
      logo: {
        width: scaleWithMax(100, 120),
        height: scaleWithMax(100, 120),
        resizeMode: 'contain',
      },
      mainContent: {
        flex: 1,
        // backgroundColor: 'blue',
      },
      contentSection: {
        // minHeight:20,
      },
      headerContainer: {
        marginBottom: 10,
      },
      title: {
        ...theme.globalStyles.TEXT_STYLE_BOLD,
        fontSize: sizes.FONTSIZE_HEADING,
        color: colors.PRIMARY_TEXT,
      },
      subtitle: {
        fontSize: 18,
        color: colors.PRIMARY_TEXT,
        fontFamily: theme.globalStyles.TEXT_STYLE.fontFamily,
      },

      formContainer: {
        marginVertical: 20,
      },
      inputContainer: {
        marginBottom: 20,
      },
      inputLabel: {
        fontSize: 16,
        color: colors.PRIMARY_TEXT,
        fontFamily: theme.globalStyles.TEXT_STYLE.fontFamily,
        marginBottom: 8,
      },
      input: {
        borderRadius: 8,
        padding: 15,
        fontSize: 16,
        backgroundColor: colors.LIGHT_GRAY,
        color: colors.RED,
      },
      linkContainer: {
        textAlign: 'center',
        color: colors.SECONDARY_TEXT,
      },
      link: {
        color: colors.PRIMARY,
        textDecorationLine: 'underline',
        fontSize: 15,
        fontFamily: theme.globalStyles.TEXT_STYLE_BOLD.fontFamily,
      },
      progressContainer: {
        marginTop: scaleWithMax(10, 15),
        marginBottom: scaleWithMax(10, 15),
      },
      progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
      },
      progressSubtitle: {
        fontSize: 14,
        color: colors.BLACK,
        fontFamily: theme.globalStyles.TEXT_STYLE.fontFamily,
      },
      progressBar: {
        width: '100%',
        height: 10,
        backgroundColor: colors.SECONDARY_GRAY,
        borderRadius: 9,
        overflow: 'hidden',
      },
      progressFill: {
        height: '100%',
        backgroundColor: colors.PRIMARY,
        borderRadius: 10,
      },
      progressText: {
        fontSize: 14,
        color: colors.SECONDARY_TEXT,
        fontFamily: theme.globalStyles.TEXT_STYLE.fontFamily,
      },
      buttonContainer: {
        // marginTop: 20,
        alignItems: 'center',
      },
    });
  }, [theme]);

  return {
    theme,
    styles,
  };
};

export default useStyles;
