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
        paddingHorizontal: 0,
      },
      scrollView: {
        flex: 1,
      },
      scrollContent: {
        // backgroundColor: 'red',
        paddingHorizontal: sizes.PADDING,
        paddingBottom: sizes.HEIGHT * 0.02,
      },
      formContainer: {
        marginVertical: 5,
      },
      inputContainer: {
        marginBottom: 16,
      },
      buttonContainer: {
        marginTop: sizes.PADDING * 0.2,
      },
      title: {
        fontFamily: fonts.Quicksand.semibold,
        fontSize: sizes.FONTSIZE_LESS_HIGH,
        color: colors.PRIMARY_TEXT,
        marginBottom: 6,
      },
      languageContainer: {
        // marginBottom: sizes.PADDING * 1.5,
        paddingVertical: sizes.PADDING * 0.2,
      },
      languageOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: sizes.PADDING * 0.5,
        // paddingHorizontal: sizes.PADDING * 0.5,
      },
      radioButton: {
        width: scaleWithMax(20, 22),
        height: scaleWithMax(20, 22),
        borderRadius: scaleWithMax(10, 11),
        borderWidth: 1,
        borderColor: colors.PRIMARY,
        marginRight: sizes.PADDING * 0.6,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 0,
        paddingBottom: 0,
      },
      radioButtonSelected: {
        width: scaleWithMax(9, 10),
        height: scaleWithMax(9, 10),
        borderRadius: scaleWithMax(5, 6),
        backgroundColor: colors.PRIMARY,
      },
      languageText: {
        fontFamily: fonts.Quicksand.medium,
        fontSize: sizes.FONTSIZE,
        color: colors.BLACK,
      },
      genderContainer: {
        backgroundColor: colors.LIGHT_GRAY,
        borderRadius: sizes.BORDER_RADIUS,
        paddingHorizontal: sizes.PADDING,
        paddingVertical: sizes.PADDING * 0.8,
        marginBottom: 20,
        minHeight: scaleWithMax(45, 50),
        justifyContent: 'center',
      },
      genderTitle: {
        fontFamily: fonts.Quicksand.medium,
        fontSize: sizes.FONTSIZE,
        color: colors.PRIMARY_TEXT,
        marginBottom: sizes.PADDING * 0.5,
      },
      genderOptions: {
        flexDirection: 'row',
        gap: sizes.PADDING * 1.5,
        // backgroundColor: 'red',
        // justifyContent: 'flex-start',
      },
      genderOption: {
        flexDirection: 'row',
        alignItems: 'center',
        width: theme.sizes.WIDTH * 0.38,
      },
      genderText: {
        fontFamily: fonts.Quicksand.medium,
        fontSize: sizes.FONTSIZE,
        color: colors.BLACK,
      },
    });
  }, [theme]);

  return { styles, theme };
};

export default useStyles;
