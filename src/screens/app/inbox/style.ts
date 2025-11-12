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
        // padding: sizes.PADDING,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        width: '100%',
        height: scaleWithMax(290, 300),
        // width: scaleWithMax(290, 300),
        // height: scaleWithMax(290, 300),
        resizeMode: 'cover',
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',

        backgroundColor: theme.colors.WHITE,
        ...theme.globalStyles.SHADOW_STYLE_LOW,
      },
      row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: sizes.WIDTH * 0.013,
      },
      inboxImageBottom: {
        // backgroundColor: theme.colors.RED,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: sizes.PADDING,
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
        ...theme.globalStyles.SHADOW_STYLE_LOW,
      },
      numCircle: {
        padding: scaleWithMax(12, 15),
        overflow: 'hidden',
        borderRadius: 99,
        backgroundColor: theme.colors.PRIMARY,
        position: 'relative',
        // marginRight: sizes.MARGIN,
      },
      numText: {
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
      bottomSheet: {
        width: sizes.PADDED_WIDTH,
        alignSelf: 'center',
        position: 'relative',
        gap: sizes.HEIGHT * 0.01,
        paddingBottom: sizes.PADDING * 1.3,
      },
    }),
    theme,
  };
};

export default useStyles;
