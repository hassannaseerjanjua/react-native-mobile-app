import { StyleSheet } from 'react-native';
import useTheme from '../../../styles/theme';
import { scaleWithMax } from '../../../utils';

const useStyles = () => {
  const theme = useTheme();
  const { sizes } = theme;

  return {
    styles: StyleSheet.create({
      container: {
        ...theme.globalStyles.CONTAINER_STYLE,
        paddingHorizontal: 0,
        flex: 1,
      },
      content: {
        paddingHorizontal: sizes.PADDING,
        paddingBottom: sizes.PADDING * 2,
      },
      tabContainer: {
        marginTop: sizes.HEIGHT * 0.016,
      },
      listWrapper: {
        flex: 1,
      },
      listContent: {
        paddingHorizontal: sizes.PADDING,
        // paddingTop: sizes.HEIGHT * 0.005,
        paddingBottom: sizes.PADDING * 2,
      },
      listContainer: {
        flexGrow: 1,
        gap: sizes.PADDING,
      },
      columnWrapper: {
        gap: sizes.PADDING,
      },
      footerContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: theme.colors.WHITE,
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        ...theme.globalStyles.SHADOW_STYLE,
        paddingHorizontal: sizes.PADDING,
        paddingTop: sizes.HEIGHT * 0.015,
        paddingBottom: scaleWithMax(25, 30),
      },
      footerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: theme.colors.PRIMARY,
        borderRadius: 10,
        paddingHorizontal: sizes.PADDING,
        height: scaleWithMax(45, 50),
        width: '100%',
        position: 'relative',
      },
      footerQuantityBadge: {
        width: scaleWithMax(28, 32),
        height: scaleWithMax(28, 32),
        borderRadius: scaleWithMax(14, 16),
        backgroundColor: theme.colors.WHITE,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
      },
      footerQuantityText: {
        ...theme.globalStyles.TEXT_STYLE_BOLD,
        fontSize: sizes.FONTSIZE_MEDIUM,
        color: theme.colors.PRIMARY,
      },
      footerButtonText: {
        ...theme.globalStyles.TEXT_STYLE,
        fontSize: sizes.FONTSIZE_BUTTON,
        color: theme.colors.WHITE,
        position: 'absolute',
        left: 0,
        right: 0,
        textAlign: 'center',
        zIndex: 0,
      },
      catchIcon: {
        width: scaleWithMax(120, 140),
        height: scaleWithMax(120, 140),
        objectFit: 'contain',
      },
      footerPriceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scaleWithMax(4, 4),
        zIndex: 1,
      },
      footerPriceText: {
        ...theme.globalStyles.TEXT_STYLE,
        fontSize: sizes.FONTSIZE_BUTTON,
        color: theme.colors.WHITE,
      },
      // Error Modal Styles
      modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      },
      modalContent: {
        width: '85%',
        maxWidth: sizes.WIDTH * 0.9,
        padding: 0,
        overflow: 'visible',
      },
      innerContent: {
        position: 'relative',
        overflow: 'visible',
      },
      closeButton: {
        position: 'absolute',
        top: sizes.PADDING,
        right: sizes.PADDING,
        zIndex: 10,
      },
      contentWrapper: {
        alignItems: 'center',
        paddingVertical: sizes.HEIGHT * 0.015,
        paddingHorizontal: sizes.PADDING,
        position: 'relative',
        overflow: 'visible',
      },
      modalTitle: {
        ...theme.globalStyles.TEXT_STYLE_SEMIBOLD,
        fontSize: sizes.FONTSIZE_HIGH,
        color: theme.colors.BLACK,
        marginTop: sizes.HEIGHT * 0.088,
        marginBottom: sizes.HEIGHT * 0.015,
        textAlign: 'center',
      },
      modalSubtitle: {
        ...theme.globalStyles.TEXT_STYLE_MEDIUM,
        fontSize: sizes.FONTSIZE_BUTTON,
        color: theme.colors.PRIMARY_TEXT,
        textAlign: 'center',
        lineHeight: sizes.FONTSIZE * 2,
        // gap: sizes.HEIGHT * 0.015,
      },
      modalButton: {
        marginTop: sizes.HEIGHT * 0.02,
        width: '100%',
      },
    }),
    theme,
  };
};

export default useStyles;
