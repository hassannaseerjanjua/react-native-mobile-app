import { StyleSheet } from 'react-native';
import { useMemo } from 'react';
import useTheme from '../../../styles/theme';
import fonts from '../../../assets/fonts';

const useStyles = () => {
  const theme = useTheme();

  const styles = useMemo(() => {
    const { colors, sizes } = theme;

    return StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: colors.BACKGROUND,

        padding: sizes.PADDING,
      },
      welcomeText: {
        // color: colors.PRIMARY_TEXT,
        // marginHorizontal: sizes.PADDING,
        // marginTop: sizes.PADDING,
        // ...theme.globalStyles.TEXT_STYLE_SEMIBOLD,
        fontFamily: fonts.Quicksand.semibold,
        fontSize: sizes.FONTSIZE_HEADING,
        color: colors.BLACK,
        marginVertical: sizes.HEIGHT * 0.006,
      },
      userName: {
        fontFamily: fonts.Quicksand.bold,
      },
      heroImage: {
        width: '100%',
        height: 180,
        borderRadius: 12,
        // marginVertical: sizes.PADDING,
      },
      sectionTitle: {
        fontFamily: fonts.Quicksand.bold,
        fontSize: sizes.FONTSIZE_HEADING,
        color: '#262C3D',
        marginVertical: sizes.HEIGHT * 0.009,
      },
      optionsWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        // marginHorizontal: sizes.PADDING,
      },
      optionCard: {
        flex: 1,
        flexDirection: 'row', // icon left, text right
        alignItems: 'center',
        borderRadius: 12,
        padding: sizes.PADDING,
        marginBottom: sizes.PADDING,
        marginHorizontal: 4,
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
