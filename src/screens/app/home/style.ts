import { StyleSheet } from 'react-native';
import { useMemo } from 'react';
import useTheme from '../../../styles/theme';
import { isIOS, isIOSThen, scaleWithMax } from '../../../utils';

const useStyles = () => {
  const theme = useTheme();

  const styles = useMemo(() => {
    const { colors, sizes, fonts } = theme;

    return StyleSheet.create({
      container: {
        flex: 1,
        paddingHorizontal: 0,
        backgroundColor: 'transparent',
        position: 'relative',
      },
      mainContent: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
      },
      contentWrapper: {
        flex: 1,
        zIndex: 1,
        backgroundColor: 'transparent',
        overflow: 'hidden',
      },
      contentContainer: {
        flex: 1,
        gap: scaleWithMax(10, 12),
        paddingHorizontal: sizes.PADDING,
      },
      welcomeText: {
        fontFamily: fonts.semibold,
        fontSize: sizes.FONTSIZE_HIGH,
        color: colors.BLACK,
        paddingHorizontal: sizes.PADDING,
      },
      userName: {
        fontFamily: fonts.bold,
      },
      heroImage: {
        borderRadius: sizes.BORDER_RADIUS_MID,
        height: sizes.HEIGHT * (sizes.HEIGHT > 850 ? 0.3 : 0.29),
      },
      sectionTitle: {
        fontFamily: fonts.bold,
        fontSize:
          sizes.WIDTH >= 430 && isIOS
            ? sizes.FONTSIZE_HIGH * 0.95
            : sizes.FONTSIZE_HIGH,
        color: colors.PRIMARY_TEXT,
        marginVertical: isIOSThen(scaleWithMax(8, 9), scaleWithMax(5, 7)),
        paddingHorizontal: sizes.PADDING,
      },

      innerSectionTitle: {
        fontFamily: fonts.bold,
        fontSize: sizes.FONTSIZE_HIGH,
        color: colors.PRIMARY_TEXT,
      },
      optionsWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: scaleWithMax(10, 12),
      },
    });
  }, [theme]);

  return { theme, styles };
};

export default useStyles;
