import { StyleSheet } from 'react-native';
import useTheme from '../../../styles/theme';
import { scaleWithMax } from '../../../utils';

const useStyles = () => {
  const theme = useTheme();
  const { sizes } = theme;
  return {
    styles: StyleSheet.create({
      bottomSheetContainer: {
        width: sizes.PADDED_WIDTH,
        alignSelf: 'center',
        position: 'relative',
      },
      bottomSheetHeading: {
        ...theme.globalStyles.TEXT_STYLE_BOLD,
        fontSize: sizes.FONTSIZE_LESS_HIGH,
        color: theme.colors.PRIMARY_TEXT,
        marginBottom: scaleWithMax(2, 3),
      },
      bottomSheetDescription: {
        ...theme.globalStyles.TEXT_STYLE,
        fontSize: scaleWithMax(12, 13),
      },
      locationCircle: {
        padding: scaleWithMax(12, 15),
        overflow: 'hidden',
        borderRadius: 99,
        backgroundColor: theme.colors.PRIMARY,
        position: 'relative',
      },
      locationNumText: {
        color: theme.colors.WHITE,

        position: 'absolute',
        top: 4,
        right: 0,
        bottom: 0,
        left: 10,
        alignItems: 'center',
        justifyContent: 'center',
      },
    }),
    theme,
  };
};

export default useStyles;
