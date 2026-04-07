import { StyleSheet, useWindowDimensions } from 'react-native';
import useTheme from '../../../styles/theme';
import { useMemo } from 'react';

const useStyles = () => {
  const theme = useTheme();
  const { width } = useWindowDimensions();

  const styles = useMemo(() => {
    const { colors, sizes } = theme;

    const boxSpacing = width * 0.02;
    const boxCount = 6;
    const borderWidth = 1;
    const totalBorderWidth = boxCount * borderWidth * 2;
    const availableWidth =
      width -
      sizes.PADDING * 2 -
      (boxCount - 1) * boxSpacing -
      totalBorderWidth;
    const boxSize = availableWidth / boxCount;

    return StyleSheet.create({
      mainContent: {
        flex: 1,
      },
      headerContainer: {
        marginTop: 25,
        marginBottom: 36,
        alignItems: 'center',
      },
      title: {
        ...theme.globalStyles.TEXT_STYLE_MEDIUM,
        fontSize: sizes.FONTSIZE_HEADING,
        color: colors.PRIMARY_TEXT,
      },
      otpContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: boxSpacing,
        direction: 'ltr',
      },
      otpInput: {
        ...theme.globalStyles.TEXT_STYLE_MEDIUM,
        width: boxSize,
        height: boxSize * 0.94,
        // borderWidth: 1,
        // borderColor: colors.LIGHT_GRAY,
        borderRadius: boxSize * 0.2,
        backgroundColor: colors.LIGHT_GRAY,
        fontSize: boxSize * 0.4,
        textAlign: 'center',
        textAlignVertical: 'center',
        padding: 0,
        margin: 0,
      },
      subtitleContainer: {
        alignItems: 'center',
        marginTop: 20,
      },
      subtitle: {
        ...theme.globalStyles.TEXT_STYLE_MEDIUM,
        fontSize: sizes.FONTSIZE_BUTTON,
        color: colors.PRIMARY_TEXT,
        textAlign: 'center',
      },
      resendText: {
        ...theme.globalStyles.TEXT_STYLE_BOLD,
        fontSize: sizes.FONTSIZE_BUTTON,
        color: colors.PRIMARY,
        textDecorationLine: 'underline',
      },
      buttonContainer: {
        marginTop: 70,
        alignItems: 'center',
      },
    });
  }, [theme]);

  return {
    theme,
    styles,
  };
};

export default useStyles;
