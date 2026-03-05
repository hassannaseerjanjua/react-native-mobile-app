import { StyleSheet } from 'react-native';
import useTheme from '../../../styles/theme';
import { scaleWithMax } from '../../../utils';

const useStyles = () => {
  const theme = useTheme();
  const { sizes } = theme;
  return {
    styles: StyleSheet.create({
      heading: {
        ...theme.globalStyles.TEXT_STYLE_SEMIBOLD,
        fontSize: sizes.FONTSIZE_LESS_HIGH,
        color: theme.colors.BLACK,
      },

      inboxTop: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginHorizontal: sizes.PADDING,
        paddingTop: sizes.PADDING,
      },
      inboxProfile: {
        borderRadius: 99,
        marginRight: sizes.PADDING * 0.6,
        width: scaleWithMax(45, 50),

        height: scaleWithMax(45, 50),
        resizeMode: 'contain',
      },
      inboxImage: {
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        width: '100%',
        height: scaleWithMax(290, 300),
        resizeMode: 'cover',
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',

        backgroundColor: theme.colors.WHITE,
      },
      row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: sizes.WIDTH * 0.013,
      },
      inboxImageBottom: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: sizes.PADDING,
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
      },
      numCircle: {
        width: scaleWithMax(25, 30),
        height: scaleWithMax(25, 30),
        overflow: 'hidden',
        borderRadius: 99,
        backgroundColor: theme.colors.PRIMARY,
        justifyContent: 'center',
        alignItems: 'center',
        display: 'flex',
      },
      numText: {
        color: theme.colors.WHITE,
        textAlign: 'center',
        includeFontPadding: false,
        textAlignVertical: 'center',
      },
      redeemedView: {
        position: 'absolute',
        top: 25,
        zIndex: 1,
        borderRadius: 8,
        left: 15,
        padding: sizes.PADDING * 0.5,
        backgroundColor: theme.colors.PRIMARY,
      },
      redeemedText: {
        color: theme.colors.WHITE,
        fontSize: sizes.FONTSIZE_MEDIUM,
      },
    }),
    theme,
  };
};

export default useStyles;
