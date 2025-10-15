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
        backgroundColor: colors.HOME_BACKGROUND,
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
        width: scaleWithMax(60, 70),
        height: scaleWithMax(60, 70),
        borderRadius: scaleWithMax(30, 35),
      },
      profileInfo: {
        flex: 1,
        marginLeft: sizes.PADDING,
      },
      profileName: {
        fontFamily: fonts.Quicksand.bold,
        fontSize: sizes.FONTSIZE_HIGH,
        color: colors.PRIMARY_TEXT,
        marginBottom: scaleWithMax(2, 4),
      },
      profileUsername: {
        fontFamily: fonts.Quicksand.regular,
        fontSize: sizes.FONTSIZE_MEDIUM,
        color: colors.SECONDARY_TEXT,
      },
      menuContainer: {
        gap: sizes.PADDING * 1.2,
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
