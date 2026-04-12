import { useMemo } from 'react';
import { Platform, StyleSheet } from 'react-native';
import useTheme from '../../../styles/theme';
import { scaleWithMax } from '../../../utils';

/** var(--Primary-Red, rgba(199, 62, 81, 1)) — muted fill for disabled primary footer button */
const PRIMARY_RED_DISABLED = 'rgba(199, 62, 81, 0.48)';

const useStyles = () => {
  const theme = useTheme();
  const { sizes, fonts } = theme;
  const styles = useMemo(() => {
    /** Same value as filter thumbnails — scaled so selection border matches message preview. */
    const cardRadius = scaleWithMax(12, 14);

    return StyleSheet.create({
      container: {
        ...theme.globalStyles.CONTAINER_STYLE,
        position: 'relative',
        paddingHorizontal: 0,
      },
      content: {
        flex: 1,
      },
      body: {
        flexGrow: 1,
        flex: 1,
        paddingTop: sizes.HEIGHT * 0.006,
        paddingBottom: sizes.PADDING + sizes.HEIGHT * 0.1,
      },
      messageContainer: {
        position: 'relative' as const,
        height: sizes.HEIGHT * 0.512,
        paddingHorizontal: sizes.PADDING,
      },
      inputWrapper: {
        flex: 1,
        height: '100%',

        borderRadius: cardRadius,
        backgroundColor: '#FFF7F1',
        overflow: 'hidden',
        position: 'relative',
      },
      filterBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        opacity: 1,
        borderRadius: cardRadius,
      },
      textInputWrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'stretch',
        alignSelf: 'stretch',
        width: '100%',
        zIndex: 1,
      },
      textInput: {
        flex: 1,
        width: '100%',
        maxWidth: '100%',
        borderRadius: cardRadius,
        color: '#000',
        textAlign: 'center',
        paddingHorizontal: scaleWithMax(15, 18),
        paddingVertical: 0,
        backgroundColor: 'transparent',
        fontSize: sizes.FONTSIZE_HIGH,
        fontFamily: fonts.semibold,
        lineHeight: Math.round(sizes.FONTSIZE_HIGH * 1.35),
        ...Platform.select({
          android: { textAlignVertical: 'center' as const },
          default: {},
        }),
      },
      /** Overrides InputField textareaContainer alignItems:flex-start + extra padding that pinned text to the top. */
      giftMessageInputField: {
        flex: 1,
        alignSelf: 'stretch',
        width: '100%',
        minHeight: 0,
        alignItems: 'stretch',
        justifyContent: 'center',
        paddingVertical: 0,
        paddingHorizontal: 0,
        borderRadius: cardRadius,
        overflow: 'hidden',
      },
      /** Full-width row with horizontal padding; children align to logical end. */
      giftFilterErrorRow: {
        position: 'absolute' as const,
        bottom: -18,
        left: 0,
        right: 0,
        paddingHorizontal: sizes.PADDING,
        flexDirection: 'row' as const,
      },
      giftFilterErrorRowLtr: {
        justifyContent: 'flex-end' as const,
      },
      giftFilterErrorRowRtl: {
        justifyContent: 'flex-start' as const,
      },
      giftFilterErrorText: {
        maxWidth: sizes.WIDTH * 0.72,
        color: theme.colors.RED,
        fontSize: scaleWithMax(11, 12),
        fontFamily: fonts.regular,
      },
      cameraIcon: {
        position: 'absolute',
        bottom: scaleWithMax(20, 25),
        right: scaleWithMax(20, 25),
      },
      sectionTitle: {
        ...theme.globalStyles.TEXT_STYLE_SEMIBOLD,
        fontSize: sizes.FONTSIZE_MED_HIGH,
        paddingVertical: sizes.HEIGHT * 0.01,
        paddingHorizontal: sizes.PADDING,
      },
      filtersWrapper: {
        height: sizes.HEIGHT * 0.4,
        backgroundColor: 'transparent',
      },
      filtersScrollContent: {
        paddingRight: sizes.PADDING,
        paddingVertical: sizes.HEIGHT * 0.01,
        flexGrow: 1,
      },
      imageContainer: {
        width: sizes.WIDTH * 0.5,
        height: sizes.HEIGHT * 0.21,
        borderRadius: cardRadius,
        marginRight: scaleWithMax(12, 14),
        backgroundColor: '#fff',
        overflow: 'hidden',
      },

      /** Wrapper for selection border — same radius as message preview (`cardRadius`). */
      filterThumbFrame: {
        width: '100%',
        height: '100%',
        borderRadius: cardRadius,
        overflow: 'hidden',
      },

      filterImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
        // borderRadius: cardRadius,
      },

      /** Fills the thumb so the confetti SVG scales edge-to-edge like `filterImage` (cover). */
      confettiFilterWrapper: {
        ...StyleSheet.absoluteFillObject,
      },
      confettiFilterSvg: {
        width: '100%',
        height: '100%',
      },

      footer: {
        position: 'absolute',
        bottom: scaleWithMax(25, 30),
        left: 0,
        right: 0,
        paddingHorizontal: sizes.PADDING,
      },
      footerPrimaryButtonDisabled: {
        backgroundColor: PRIMARY_RED_DISABLED,
        borderWidth: 0,
      },
      footerPrimaryButtonDisabledLabel: {
        color: 'rgba(255, 255, 255, 0.88)',
      },
      doneButtonContainer: {
        position: 'absolute',
        top: sizes.PADDING,
        left: sizes.PADDING,
        zIndex: 10,
      },
      timerDisplay: {
        position: 'absolute',
        top: sizes.PADDING,
        alignSelf: 'center',
        backgroundColor: '#FF0000',
        paddingHorizontal: scaleWithMax(10, 12),
        paddingVertical: scaleWithMax(4, 6),
        borderRadius: scaleWithMax(4, 5),
        zIndex: 10,
      },
      timerText: {
        color: '#FFFFFF',
        fontSize: scaleWithMax(14, 16),
        fontWeight: '600',
      },
      crossBackground: {
        backgroundColor: 'rgba(40,40,40,0.85)',
        borderRadius: 50, // circle
        width: scaleWithMax(36, 40),
        height: scaleWithMax(36, 40),
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.35)',
      },
      flipButton: {
        position: 'absolute',
        right: scaleWithMax(60, 70),
      },
      flashButton: {
        position: 'absolute',
        top: sizes.PADDING,
        right: sizes.PADDING,
      },
      flashButtonBackground: {
        backgroundColor: 'rgba(40,40,40,0.85)',
        borderRadius: 50, // circle
        width: scaleWithMax(36, 40),
        height: scaleWithMax(36, 40),
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.35)',
      },
      flashButtonBackgroundActive: {
        backgroundColor: 'rgba(255, 255, 0, 0.3)',
      },
      flashButtonIcon: {
        width: scaleWithMax(20, 22),
        height: scaleWithMax(20, 22),
      },
      flipButtonBackground: {
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 50, // circle
        width: scaleWithMax(44, 48),
        height: scaleWithMax(44, 48),
        justifyContent: 'center',
        alignItems: 'center',
      },
      flipButtonIcon: {
        width: '100%',
        height: '100%',
      },
      recordButtonContainer: {
        position: 'absolute',
        bottom: sizes.HEIGHT * 0.08,
        left: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
      },
      recordButtonWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
      },
      recordButton: {
        width: scaleWithMax(70, 80),
        height: scaleWithMax(70, 80),
        borderRadius: scaleWithMax(35, 40),
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
      },
      recordButtonInner: {
        width: scaleWithMax(60, 68),
        height: scaleWithMax(60, 68),
        borderRadius: scaleWithMax(30, 34),
        backgroundColor: '#FFFFFF',
      },
      recordButtonInnerRecording: {
        width: scaleWithMax(30, 34),
        height: scaleWithMax(30, 34),
        borderRadius: scaleWithMax(6, 8),
        backgroundColor: '#FF0000',
      },
      videoBadge: {
        position: 'absolute',
        bottom: scaleWithMax(40, 45),
        right: scaleWithMax(18, 18),
        width: scaleWithMax(14, 16),
        height: scaleWithMax(14, 16),
        borderRadius: scaleWithMax(10, 11),
        backgroundColor: '#FF0000',
        justifyContent: 'center',
        alignItems: 'center',
      },
      videoBadgeText: {
        ...theme.globalStyles.TEXT_STYLE_BOLD,
        fontSize: 10,
        color: theme.colors.WHITE,
        textAlign: 'center',
        lineHeight: scaleWithMax(14, 16),
      },
      floatingButtonsContainer: {
        position: 'absolute',
        bottom: scaleWithMax(70, 80),
        right: scaleWithMax(20, 25),
        zIndex: 1000,
      },
      floatingButton: {
        backgroundColor: theme.colors.PRIMARY,
        paddingHorizontal: scaleWithMax(16, 18),
        paddingVertical: scaleWithMax(10, 12),
        borderRadius: scaleWithMax(20, 22),
        minWidth: scaleWithMax(90, 100),
        alignItems: 'center',
      },
      floatingButtonText: {
        ...theme.globalStyles.TEXT_STYLE_SEMIBOLD,
        fontSize: scaleWithMax(14, 15),
        color: theme.colors.WHITE,
      },
      inputFieldContainer: {
        backgroundColor: 'transparent',
        shadowOpacity: 0,
        elevation: 0,
      },
      inputAccessory: {
        backgroundColor: '#E5E5EA', // iOS default gray background
        height: 44, // iOS default height
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingRight: scaleWithMax(16, 20),
        borderTopWidth: 0.5,
        borderTopColor: '#C7C7CC', // iOS default border color
      },
      doneButton: {
        // No padding needed - iOS default button has built-in spacing
      },
      doneButtonText: {
        fontSize: 17, // iOS default font size
        color: '#007AFF', // iOS default blue color
        fontWeight: '400', // iOS default weight (not bold)
      },
    });
  }, [sizes, theme, fonts.semibold, fonts.regular]);

  return {
    styles,
    theme,
  };
};

export default useStyles;
