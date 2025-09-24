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
        flex: 1,
      },
      scrollContainer: {
        flex: 1,
        padding: sizes.PADDING,
      },
      contentContainer: {
        flexGrow: 1,
        paddingBottom: isIOS ? sizes.BOTTOM_PADDING : 10,
      },
      logoContainer: {
        alignItems: 'center',
        paddingTop: scaleWithMax(10, 15),
        marginBottom: scaleWithMax(50, 55),
      },
      logo: {
        width: scaleWithMax(100, 120),
        height: scaleWithMax(100, 120),
        resizeMode: 'contain',
      },
      mainContent: {
        flex: 1,
      },
      headerContainer: {
        marginBottom: 30,
        alignItems: 'center',
      },
      title: {
        ...theme.globalStyles.TEXT_STYLE_MEDIUM,
        fontSize: sizes.FONTSIZE_HEADING,
        color: colors.PRIMARY_TEXT,
        textAlign: 'center',
        lineHeight: 24,
      },
      otpContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 30,
        gap: 12,
      },
      otpBox: {
        width: 50,
        height: 50,
        borderWidth: 1,
        borderColor: '#EEEEEE',
        borderRadius: 8,
        backgroundColor: colors.BACKGROUND,
      },
      otpInput: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.PRIMARY_TEXT,
        fontFamily: theme.globalStyles.TEXT_STYLE_BOLD.fontFamily,
        width: 50,
        height: 50,
        textAlign: 'center',
        textAlignVertical: 'center',
        borderRadius: 8,
        padding: 0,
        margin: 0,
      },
      otpText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.PRIMARY_TEXT,
        fontFamily: theme.globalStyles.TEXT_STYLE_BOLD.fontFamily,
      },
      subtitleContainer: {
        alignItems: 'center',
        marginTop: 30,
      },
      subtitle: {
        fontSize: 16,
        color: colors.SECONDARY_TEXT,
        fontFamily: theme.globalStyles.TEXT_STYLE.fontFamily,
        marginBottom: 8,
      },
      timerText: {
        fontSize: 16,
        color: colors.PRIMARY,
        fontFamily: theme.globalStyles.TEXT_STYLE_BOLD.fontFamily,
      },
      resendText: {
        fontSize: 16,
        color: colors.PRIMARY,
        fontFamily: theme.globalStyles.TEXT_STYLE_BOLD.fontFamily,
        textDecorationLine: 'underline',
      },
      buttonContainer: {
        marginTop: sizes.HEIGHT * 0.05,
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
