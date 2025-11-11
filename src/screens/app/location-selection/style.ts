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
        fontSize: sizes.FONTSIZE_LARGE,
        color: theme.colors.PRIMARY_TEXT,
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
        // marginRight: sizes.MARGIN,
      },
      locationNumText: {
        color: theme.colors.WHITE,
        // fontWeight: 'bold',

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
