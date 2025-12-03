import { StyleSheet } from 'react-native';
import { useMemo } from 'react';
import useTheme from '../../../styles/theme';
import fonts from '../../../assets/fonts';
import { isIOSThen, scaleWithMax } from '../../../utils';

const useStyles = () => {
  const theme = useTheme();

  const styles = useMemo(() => {
    const { colors, sizes } = theme;

    return StyleSheet.create({
      container: {
        ...theme.globalStyles.CONTAINER_STYLE,
        paddingHorizontal: 0,
      },
      mainContent: {
        flex: 1,

      },
      contentContainer: {
        flex: 1,
        gap: scaleWithMax(8, 10),
        paddingHorizontal: sizes.PADDING,
      },
      welcomeText: {
        fontFamily: fonts.Quicksand.semibold,
        fontSize: sizes.FONTSIZE_HIGH,
        color: colors.BLACK,
        paddingHorizontal: sizes.PADDING,
      },
      userName: {
        fontFamily: fonts.Quicksand.bold,
      },
      heroImage: {
        borderRadius: sizes.BORDER_RADIUS_MID,
        flex: 1,
      },
      sectionTitle: {
        fontFamily: fonts.Quicksand.bold,
        fontSize: sizes.FONTSIZE_HIGH,
        color: colors.PRIMARY_TEXT,
        marginVertical: isIOSThen(scaleWithMax(8, 9), scaleWithMax(5, 7)),
        paddingHorizontal: sizes.PADDING,
      },
      optionsWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: scaleWithMax(8, 10),
      },
    });
  }, [theme]);

  return { theme, styles };
};

export default useStyles;
