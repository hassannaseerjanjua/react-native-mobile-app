import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import useTheme from '../../../styles/theme';

const useStyles = () => {
  const theme = useTheme();

  const styles = useMemo(() => {
    const { colors, sizes } = theme;

    return StyleSheet.create({
      container: {
        ...theme.globalStyles.CONTAINER_STYLE,
        backgroundColor: colors.HOME_BACKGROUND,
      },
      header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      },
      headerTitle: {
        fontFamily: 'Quicksand-Bold',
        fontSize: sizes.FONTSIZE_HIGH + 2,
        color: colors.PRIMARY_TEXT,
      },
      scrollView: {
        flex: 1,
      },
      scrollContent: {
        paddingBottom: sizes.PADDING * 2,
      },
      profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
        // paddingHorizontal: sizes.PADDING,
        paddingVertical: sizes.PADDING * 1.5,
        marginBottom: sizes.PADDING,
      },
      profileImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
      },
      profileInfo: {
        flex: 1,
        marginLeft: sizes.PADDING,
      },
      profileName: {
        fontFamily: 'Quicksand-Bold',
        fontSize: sizes.FONTSIZE_HIGH,
        // backgroundColor: 'red',
        color: colors.PRIMARY_TEXT,
        // marginBottom: 4,
      },
      profileUsername: {
        fontFamily: 'Quicksand-Regular',
        fontSize: sizes.FONTSIZE_MEDIUM,
        color: colors.SECONDARY_TEXT,
        // backgroundColor: 'blue',
      },
      qrButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
      },
      qrIcon: {
        width: 24,
        height: 24,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 4,
      },
      qrDot: {
        width: 8,
        height: 8,
        backgroundColor: colors.PRIMARY_TEXT,
        borderRadius: 2,
      },
      menuContainer: {
        gap: sizes.PADDING * 1.2,
      },
      menuItemWrapper: {
        marginBottom: 0,
      },
      logoutButton: {
        backgroundColor: colors.WHITE,
        flexDirection: 'row',
        alignItems: 'center',
        // justifyContent: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
        borderRadius: 12,
        // marginTop: sizes.PADDING * 2,
      },
      logoutContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
      },
      logoutText: {
        fontFamily: 'Quicksand-SemiBold',
        fontSize: sizes.FONTSIZE_HIGH,
        color: colors.PRIMARY_TEXT,
      },
    });
  }, [theme]);

  return { styles, theme };
};

export default useStyles;
