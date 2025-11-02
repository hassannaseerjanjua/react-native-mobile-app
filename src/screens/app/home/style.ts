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
        backgroundColor: 'red',
      },
      mainContent: {
        flex: 1,
        paddingHorizontal: sizes.PADDING,
        // paddingBottom: sizes.HEIGHT * 0.02,
      },
      contentContainer: {
        flex: 1,
        gap: scaleWithMax(8, 10),
      },
      welcomeText: {
        fontFamily: fonts.Quicksand.semibold,
        fontSize: sizes.FONTSIZE_HIGH,
        color: colors.BLACK,
        // backgroundColor: 'red',
      },
      userName: {
        fontFamily: fonts.Quicksand.bold,
      },
      heroImage: {
        width: '100%',
        borderRadius: sizes.BORDER_RADIUS_MID,
      },
      sectionTitle: {
        fontFamily: fonts.Quicksand.bold,
        fontSize: sizes.FONTSIZE_HIGH,
        color: colors.PRIMARY_TEXT,
        marginVertical: isIOSThen(scaleWithMax(9, 11), scaleWithMax(5, 7)),
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
