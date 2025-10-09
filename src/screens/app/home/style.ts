import { StyleSheet } from 'react-native';
import { useMemo } from 'react';
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
      },
      mainContent: {
        flex: 1,
      },
      contentContainer: {
        gap: sizes.PADDING * 0.7,
        paddingBottom: sizes.HEIGHT * 0.13,
      },
      welcomeText: {
        fontFamily: fonts.Quicksand.semibold,
        fontSize: sizes.FONTSIZE_HEADING,
        color: colors.BLACK,
      },
      userName: {
        fontFamily: fonts.Quicksand.bold,
      },
      heroImage: {
        width: '100%',
        borderRadius: sizes.BORDER_RADIUS_MID,
        // marginBottom: scaleWithMax(8, 10),
      },
      sectionTitle: {
        fontFamily: fonts.Quicksand.bold,
        fontSize: sizes.FONTSIZE_HEADING,
        color: '#262C3D',
        paddingVertical: sizes.PADDING * 0.3,
      },
      optionsWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
      },
      optionCard: {
        flex: 1,
        flexDirection: 'row', // icon left, text right
        alignItems: 'center',
        borderRadius: 12,
        padding: sizes.PADDING,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
        backgroundColor: '#DBEDFD',
      },
      optionContent: {
        flex: 1,
        marginLeft: 10, // spacing between icon and text
      },
      optionTitle: {
        fontSize: sizes.FONTSIZE_MEDIUM,
        fontFamily: fonts.Quicksand.bold,
        color: colors.PRIMARY_TEXT,
        marginBottom: 4,
      },
      optionTitlePrimary: {
        color: colors.PRIMARY,
      },
      optionDesc: {
        fontSize: 9,
        color: colors.BLACK,
      },
    });
  }, [theme]);

  return { theme, styles };
};

export default useStyles;
