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
        // paddingVertical: 4,
        marginTop: 16,
        gap: 6,
      },
      tab: {
        flex: 1,
        ...theme.globalStyles.BUTTON_TAB_TFIELD_HEIGHT,
        alignItems: 'center',
        borderRadius: 12,
        backgroundColor: colors.LIGHT_GRAY,
        justifyContent: 'center',
      },
      activeTab: {
        backgroundColor: colors.SECONDARY,
        shadowColor: colors.BLACK,
      },
      tabText: {
        fontSize: 15,
        color: colors.SECONDARY_TEXT,
        fontFamily: theme.globalStyles.TEXT_STYLE.fontFamily,
      },
      activeTabText: {
        ...theme.globalStyles.TEXT_STYLE_SEMIBOLD,
        color: colors.PRIMARY,
      },
      formContainer: {
        flex: 1,
      },
      inputContainer: {
        marginBottom: 20,
      },
      button: {
        marginTop: sizes.HEIGHT * 0.026,
      },
      buttonContainer: {
        alignItems: 'center',
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
      bottomSheetContainer: {
        width: sizes.PADDED_WIDTH,
        alignSelf: 'center',
      },
      bottomSheetTitle: {
        ...theme.globalStyles.TEXT_STYLE,
        fontSize: sizes.FONTSIZE_HIGH,
        color: colors.PRIMARY_TEXT,
        textAlign: 'center',
        marginBottom: sizes.PADDING,
        paddingHorizontal: sizes.WIDTH * 0.2,
        alignSelf: 'center',
      },
      bottomSheetIconContainer: {
        alignItems: 'center',
        marginBottom: sizes.PADDING,
      },
      bottomSheetNumber: {
        ...theme.globalStyles.TEXT_STYLE_SEMIBOLD,
        fontSize: sizes.FONTSIZE_HIGH,
        color: colors.PRIMARY,
        marginBottom: sizes.PADDING * 1.3,
        direction: 'ltr',
        textAlign: 'center',
      },
    });
  }, [theme]);

  return {
    theme,
    styles,
  };
};

export default useStyles;
