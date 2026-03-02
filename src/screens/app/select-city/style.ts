import { StyleSheet } from 'react-native';
import useTheme from '../../../styles/theme';
import { scaleWithMax } from '../../../utils';

const useStyles = () => {
  const theme = useTheme();
  const { colors, sizes } = theme;

  return {
    styles: StyleSheet.create({
      listContainer: {
        paddingHorizontal: scaleWithMax(14, 16),
        paddingVertical: scaleWithMax(10, 12),
      },

      cityItem: {
        backgroundColor: colors.WHITE,
        paddingVertical: scaleWithMax(12, 14),
        paddingHorizontal: scaleWithMax(14, 16),
        borderRadius: scaleWithMax(8, 10),
        marginBottom: scaleWithMax(8, 10),

        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 1,
      },

      cityName: {
        fontSize: sizes.FONTSIZE_MEDIUM,
        color: colors.BLACK,
      },
    }),
    theme,
  };
};

export default useStyles;
