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
        paddingBottom: 10,
        justifyContent: 'space-between',
      },
      logoContainer: {
        alignItems: 'center',
        paddingTop: scaleWithMax(10, 15),
        marginBottom: scaleWithMax(40, 45),
      },
      logo: {
        width: scaleWithMax(100, 120),
        height: scaleWithMax(100, 120),
        resizeMode: 'contain',
      },
      headerContainer: {
        marginBottom: 30,
      },
      title: {
        ...theme.globalStyles.TEXT_STYLE_BOLD,
        fontSize: sizes.FONTSIZE_HEADING,
        color: colors.PRIMARY_TEXT,
        marginBottom: 10,
      },
      subtitle: {
        fontSize: 18,
        color: colors.PRIMARY_TEXT,
        fontFamily: theme.globalStyles.TEXT_STYLE.fontFamily,
      },
      tabContainer: {
        flexDirection: 'row',
        marginBottom: 25,
        padding: 4,
        gap: 5,
      },
      tab: {
        flex: 1,
        paddingVertical: 14,
        alignItems: 'center',
        borderRadius: 12,
        backgroundColor: colors.LIGHT_GRAY,
      },
      activeTab: {
        backgroundColor: colors.SECONDARY,
        shadowColor: colors.BLACK,
      },
      tabText: {
        fontSize: 14,
        color: colors.SECONDARY_TEXT,
        fontFamily: theme.globalStyles.TEXT_STYLE.fontFamily,
      },
      activeTabText: {
        color: colors.PRIMARY_TEXT,
        fontFamily: theme.globalStyles.TEXT_STYLE.fontFamily,
      },
      formContainer: {
        flex: 1,
      },
      inputContainer: {
        marginBottom: 20,
      },
      button: {
        marginTop: sizes.HEIGHT * 0.05,
      },
      linkContainer: {
        ...theme.globalStyles.TEXT_STYLE,
        textAlign: 'center',
        color: colors.SECONDARY_TEXT,
      },
      link: {
        ...theme.globalStyles.TEXT_STYLE_BOLD,
        color: colors.PRIMARY,
        textDecorationLine: 'underline',
        fontSize: 15,
      },
    });
  }, [theme]);

  return {
    theme,
    styles,
  };
};

export default useStyles;
