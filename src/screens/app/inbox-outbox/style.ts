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
        // marginRight: sizes.PADDING * 0.6,
        width: scaleWithMax(45, 50),
        height: scaleWithMax(45, 50),
        resizeMode: 'stretch',
      },
      imageContainer: {
        borderRadius: 12,
        backgroundColor: theme.colors.WHITE,
        ...theme.globalStyles.SHADOW_STYLE,
        marginBottom: sizes.HEIGHT * 0.016,
      },
      inboxImage: {
        width: '100%',
        height: sizes.HEIGHT * 0.34,
        resizeMode: 'cover',
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
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
        paddingVertical: sizes.PADDING * 0.6,
        paddingHorizontal: sizes.PADDING,
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
        backgroundColor: theme.colors.WHITE,
      },
      numCircle: {
        width: scaleWithMax(24, 25),
        height: scaleWithMax(24, 25),
        borderRadius: scaleWithMax(14, 16),
        backgroundColor: theme.colors.PRIMARY,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
      },
      numText: {
        ...theme.globalStyles.TEXT_STYLE,
        fontSize: sizes.FONTSIZE,
        color: theme.colors.WHITE,
        position: 'absolute',
        left: 0,
        right: 0,
        textAlign: 'center',
        zIndex: 0,
      },
      bottomSheet: {
        width: sizes.PADDED_WIDTH,
        alignSelf: 'center',
        position: 'relative',
        gap: sizes.HEIGHT * 0.01,
        // paddingBottom: sizes.PADDING * 1.3,
      },
      userNameText: {
        ...theme.globalStyles.TEXT_STYLE_MEDIUM,
        fontSize: sizes.FONTSIZE_BUTTON,
        color: theme.colors.BLACK,
      },
      timeText: {
        ...theme.globalStyles.TEXT_STYLE,
        fontSize: sizes.FONTSIZE_MEDIUM,
        color: theme.colors.BLACK,
      },
      storeNameText: {
        ...theme.globalStyles.TEXT_STYLE,
        fontSize: sizes.FONTSIZE,
        color: theme.colors.SECONDARY_TEXT,
        includeFontPadding: false,
      },
      storeNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: sizes.WIDTH * 0.013,
      },
      giftIconWrapper: {
        justifyContent: 'center',
        alignItems: 'center',
      },
      itemNameText: {
        ...theme.globalStyles.TEXT_STYLE_SEMIBOLD,
        fontSize: sizes.FONTSIZE_SMALL_HEADING,
        color: theme.colors.BLACK,
      },
      backIconContainer: {
        backgroundColor: theme.colors.PRIMARY,
        height: scaleWithMax(16, 16),
        width: scaleWithMax(16, 16),
        borderRadius: 9999,
        justifyContent: 'center',
        alignItems: 'center',
      },
    }),
    theme,
  };
};

export default useStyles;
