import { StyleSheet, useWindowDimensions } from 'react-native';
import useTheme from '../../../styles/theme';
import { useMemo } from 'react';

const useStyles = () => {
  const theme = useTheme();
  const { width } = useWindowDimensions();

  const styles = useMemo(() => {
    const { colors, sizes } = theme;

    const boxSpacing = width * 0.025;
    const boxCount = 6;
    const availableWidth =
      width - sizes.PADDING * 2 - (boxCount - 1) * boxSpacing;
    const boxSize = availableWidth / boxCount;

    return StyleSheet.create({
      mainContent: {
        flex: 1,
      },
      headerContainer: {
        marginBottom: sizes.PADDING * 1.5,
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
      },
      otpInput: {
        ...theme.globalStyles.TEXT_STYLE_MEDIUM,
        width: boxSize,
        height: boxSize,
        borderWidth: 1,
        borderColor: colors.LIGHT_GRAY,
        borderRadius: boxSize * 0.2,
        backgroundColor: colors.BACKGROUND,
        fontSize: boxSize * 0.4,
        textAlign: 'center',
        textAlignVertical: 'center',
        padding: 0,
        margin: 0,
      },
      subtitleContainer: {
        alignItems: 'center',
        marginTop: sizes.PADDING * 1.5,
      },
      subtitle: {
        ...theme.globalStyles.TEXT_STYLE,
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
        marginTop: sizes.HEIGHT * 0.05,
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
