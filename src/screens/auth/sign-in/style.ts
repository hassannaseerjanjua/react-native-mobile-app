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
        padding: sizes.PADDING,
      },
      contentContainer: {
        flexGrow: 1,
        paddingBottom: isIOS ? sizes.BOTTOM_PADDING : 10,
        justifyContent: 'space-between',
      },
      logoContainer: {
        alignItems: 'center',
        paddingTop: 40,
      },
      logo: {
        width: scaleWithMax(150, 160),
        height: scaleWithMax(150, 160),
        resizeMode: 'contain',
      },
      headerContainer: {
        marginBottom: 30,
      },
      title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.PRIMARY_TEXT,
        fontFamily: theme.globalStyles.TEXT_STYLE_BOLD.fontFamily,
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
        paddingVertical: 16,
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
        textAlign: 'center',
        color: colors.SECONDARY_TEXT,
      },
      link: {
        color: colors.PRIMARY,
        textDecorationLine: 'underline',
        fontSize: 15,
        fontFamily: theme.globalStyles.TEXT_STYLE_BOLD.fontFamily,
      },
    });
  }, [theme]);

  return {
    theme,
    styles,
  };
};

export default useStyles;
