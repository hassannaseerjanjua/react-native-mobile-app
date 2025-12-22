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
        backgroundColor: theme.colors.HOME_BACKGROUND,
        paddingHorizontal: 0,
      },
      scrollView: {
        flex: 1,
      },
      scrollContent: {
        paddingHorizontal: sizes.PADDING,
        paddingBottom: sizes.HEIGHT * 0.02,
      },
      profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: sizes.HEIGHT * 0.01,
        marginBottom: sizes.HEIGHT * 0.008,
      },
      profileImageContainer: {
        position: 'relative',
      },
      profileImage: {
        width: scaleWithMax(55, 60),
        height: scaleWithMax(55, 60),
        borderRadius: scaleWithMax(30, 35),
      },
      profileImageUploading: {
        opacity: 0.6,
      },
      profileInfo: {
        flex: 1,
        marginLeft: sizes.WIDTH * 0.03,
      },
      profileName: {
        fontFamily: fonts.Quicksand.semibold,
        fontSize: sizes.FONTSIZE_BUTTON,
        color: colors.BLACK,
      },
      profileUsername: {
        fontFamily: fonts.Quicksand.regular,
        fontSize: sizes.FONTSIZE_MEDIUM,
        color: colors.BLACK,
      },
      menuContainer: {
        gap: sizes.HEIGHT * 0.016,
      },
      menuItemWrapper: {
        marginBottom: 0,
      },
      menuItem: {
        backgroundColor: colors.WHITE,
        ...theme.globalStyles.SHADOW_STYLE_LOW,
      },
      menuItemText: {
        ...theme.globalStyles.TEXT_STYLE_SEMIBOLD,
        fontSize: sizes.FONTSIZE,
      },
      modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: sizes.PADDING,
      },
      modalContent: {
        // width: '90%',
        maxWidth: 400,
        padding: sizes.PADDING * 1,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
      },
      qrContent: {
        width: '100%',
        alignItems: 'center',
      },
      modalProfileSection: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginBottom: sizes.PADDING * 1.5,
      },
      modalProfileImage: {
        width: scaleWithMax(50, 55),
        height: scaleWithMax(50, 55),
        borderRadius: 9999,
      },
      modalProfileInfo: {
        flex: 1,
        marginLeft: sizes.WIDTH * 0.03,
      },
      modalProfileName: {
        fontFamily: fonts.Quicksand.semibold,
        fontSize: sizes.FONTSIZE_BUTTON,
        color: colors.BLACK,
        marginBottom: sizes.PADDING * 0.2,
      },
      modalProfileUsername: {
        fontFamily: fonts.Quicksand.regular,
        fontSize: sizes.FONTSIZE_MEDIUM,
        color: colors.SECONDARY_TEXT,
      },
      qrTitle: {
        fontSize: sizes.FONTSIZE_HEADING,
        fontWeight: '600',
        marginBottom: sizes.PADDING * 0.5,
        color: colors.PRIMARY_TEXT,
      },
      qrSubtitle: {
        fontSize: sizes.FONTSIZE_MEDIUM,
        color: colors.SECONDARY_TEXT,
        textAlign: 'center',
        marginBottom: sizes.PADDING * 1.5,
      },
      qrCodeContainer: {
        backgroundColor: colors.WHITE,
        padding: sizes.PADDING * 1.5,
        borderRadius: 20,
        alignItems: 'center',
        ...theme.globalStyles.SHADOW_STYLE_LOW,
        shadowColor: '#00000050',
      },
      bottomSheet: {
        width: sizes.PADDED_WIDTH,
        alignSelf: 'center',
        position: 'relative',
        gap: sizes.HEIGHT * 0.01,
      },
    });
  }, [theme]);

  return { styles, theme };
};

export default useStyles;
