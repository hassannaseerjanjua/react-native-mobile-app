import { StyleSheet } from 'react-native';
import { useColors } from '../../../styles/colors';
import useTheme from '../../../styles/theme';
import { useMemo } from 'react';

const useStyles = () => {
  const theme = useTheme();
  const styles = useMemo(() => {
    const { colors, sizes, globalStyles } = theme;
    return StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: colors.BACKGROUND,
      },
      contentContainer: {
        flexGrow: 1,
        padding: sizes.PADDING,
        paddingBottom: sizes.BOTTOM_PADDING,
        justifyContent: 'space-between',
      },
      button: {
        marginTop: theme.sizes.HEIGHT * 0.05,
      },
      logoContainer: {
        alignItems: 'center',
        // backgroundColor: colors.RED,
        paddingTop: 40,
        // marginBottom: 40, // ✅ adds spacing between logo and fields
      },
      logo: {
        width: 150,
        height: 150,
        resizeMode: 'contain', // ✅ keep proportions
      },
      headerContainer: {
        marginBottom: 30,
      },
      title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.PRIMARY_TEXT,
        marginBottom: 10,
      },
      subtitle: {
        fontSize: 18,
        color: colors.PRIMARY_TEXT,
        // textAlign: 'center',
      },
      tabContainer: {
        flexDirection: 'row',
        // backgroundColor: colors.RED,
        marginBottom: 25,
        padding: 4,
        gap: 5,
      },
      tab: {
        flex: 1,
        paddingVertical: 12,
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
        fontWeight: '500',
      },
      activeTabText: {
        color: colors.PRIMARY_TEXT,
        fontWeight: '500',
      },
      formContainer: {
        flex: 1,
      },
      inputContainer: {
        marginBottom: 20,
      },
      inputLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: colors.PRIMARY_TEXT,
        marginBottom: 8,
      },
      input: {
        borderWidth: 1,
        borderColor: colors.LIGHT_GRAY,
        borderRadius: 8,
        padding: 15,
        fontSize: 16,
        backgroundColor: colors.LIGHT_GRAY,
      },
      linkContainer: {
        textAlign: 'center',
        color: colors.SECONDARY_TEXT,
      },
      link: {
        color: colors.PRIMARY,
        textDecorationLine: 'underline',
        fontSize: 15,
        fontWeight: '600',
      },
    });
  }, [theme]);

  return {
    styles,
    theme,
  };
};

export default useStyles;
