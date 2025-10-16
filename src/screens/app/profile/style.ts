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
        paddingVertical: sizes.PADDING * 1.5,
        marginBottom: sizes.HEIGHT * 0.008,
      },
      profileImage: {
        width: scaleWithMax(55, 60),
        height: scaleWithMax(55, 60),
        borderRadius: scaleWithMax(30, 35),
      },
      profileInfo: {
        flex: 1,
        marginLeft: sizes.WIDTH * 0.03,
      },
      profileName: {
        fontFamily: fonts.Quicksand.semibold,
        fontSize: sizes.FONTSIZE_BUTTON,
        color: colors.BLACK,
        // marginBottom: scaleWithMax(1, 2),
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
        shadowColor: 'lightgray',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 1,
      },
      menuItemText: {
        ...theme.globalStyles.TEXT_STYLE_SEMIBOLD,
        fontSize: sizes.FONTSIZE,
      },
    });
  }, [theme]);

  return { styles, theme };
};

export default useStyles;
