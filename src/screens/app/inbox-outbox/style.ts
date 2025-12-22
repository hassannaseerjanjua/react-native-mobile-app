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
        overflow: 'visible',
      },
      inboxProfile: {
        borderRadius: 99,
        width: scaleWithMax(50, 55),
        height: scaleWithMax(50, 55),
        resizeMode: 'cover',
      },
      imageContainer: {
        borderRadius: 12,
        // backgroundColor: theme.colors.RED,
        position: 'relative',
        marginBottom: sizes.HEIGHT * 0.008,
        marginRight: sizes.WIDTH * 0.01,
        width: sizes.WIDTH * 0.78,
        alignSelf: 'flex-start',
        overflow: 'visible',
        ...theme.globalStyles.SHADOW_STYLE,
      },
      redeemedBox: {
        backgroundColor: theme.colors.PRIMARY,
        position: 'absolute',
        zIndex: 2,
        borderRadius: 6,
        top: sizes.HEIGHT * 0.02,
        left: sizes.WIDTH * 0.04,
        paddingHorizontal: sizes.PADDING * 0.5,
        paddingVertical: sizes.PADDING * 0.3,

        ...theme.globalStyles.SHADOW_STYLE,
      },
      inboxImage: {
        width: sizes.WIDTH * 0.78,
        height: sizes.HEIGHT * 0.34,
        resizeMode: 'cover',
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        alignSelf: 'flex-start',
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
        width: sizes.WIDTH * 0.78,
        alignSelf: 'flex-start',
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
      },
      userNameText: {
        ...theme.globalStyles.TEXT_STYLE_MEDIUM,
        fontSize: sizes.FONTSIZE,
        color: theme.colors.BLACK,
      },
      timeText: {
        ...theme.globalStyles.TEXT_STYLE,
        fontSize: sizes.FONTSIZE_MEDIUM,
        color: theme.colors.BLACK,
      },
      storeNameText: {
        ...theme.globalStyles.TEXT_STYLE,
        fontSize: sizes.FONTSIZE_MEDIUM,
        color: theme.colors.SECONDARY_TEXT,
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
        flex: 1,
        marginRight: sizes.PADDING * 0.5,
      },
      backIconContainer: {
        backgroundColor: theme.colors.PRIMARY,
        height: scaleWithMax(16, 16),
        width: scaleWithMax(16, 16),
        borderRadius: 9999,
        justifyContent: 'center',
        alignItems: 'center',
      },
      // Pagination Dots Styles
      paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: sizes.PADDING * 0.8,
        gap: sizes.WIDTH * 0.02,
      },
      paginationDot: {
        width: scaleWithMax(8, 8),
        height: scaleWithMax(8, 8),
        borderRadius: 100,
        backgroundColor: '#E0E0E0',
        opacity: 0.5,
      },
      paginationDotActive: {
        backgroundColor: theme.colors.PRIMARY,
        opacity: 1,
        width: scaleWithMax(8, 8),
        borderRadius: scaleWithMax(4, 4),
      },
      quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: sizes.PADDING * 0.5,
        paddingVertical: sizes.PADDING * 0.5,
      },
      quantityLabel: {
        ...theme.globalStyles.TEXT_STYLE_MEDIUM,
        fontSize: sizes.FONTSIZE,
        color: theme.colors.BLACK,
      },
      quantitySelector: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: sizes.PADDING * 0.8,
        borderWidth: 1.3,
        borderColor: theme.colors.PRIMARY,
        borderRadius: 10,
        paddingHorizontal: sizes.PADDING * 0.6,
        paddingVertical: sizes.PADDING * 0.4,
      },
      quantityButton: {
        padding: sizes.PADDING * 0.2,
      },
      quantityButtonDisabled: {
        opacity: 0.5,
      },
      quantityText: {
        ...theme.globalStyles.TEXT_STYLE_MEDIUM,
        fontSize: sizes.FONTSIZE_MED_HIGH,
        color: theme.colors.PRIMARY,
        minWidth: scaleWithMax(30, 35),
        textAlign: 'center',
      },
    }),
    theme,
  };
};

export default useStyles;
