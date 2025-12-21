import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import useTheme from '../../../styles/theme';
import { scaleWithMax } from '../../../utils';
import fonts from '../../../assets/fonts';

const useStyles = () => {
  const theme = useTheme();
  const { sizes } = theme;
  const styles = useMemo(
    () =>
      StyleSheet.create({
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
          height: sizes.HEIGHT * 0.512,
          paddingHorizontal: sizes.PADDING,
          ...theme.globalStyles.SHADOW_STYLE,
        },
        inputWrapper: {
          flex: 1,
          height: '100%',

          borderRadius: 10,
          backgroundColor: '#fff',
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
          borderRadius: 10,
        },
        textInputWrapper: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          zIndex: 1,
        },
        textInput: {
          width: '100%',
          borderRadius: 10,
          color: '#000',
          textAlign: 'center',
          paddingHorizontal: scaleWithMax(15, 18),
          paddingVertical: scaleWithMax(42, 45),
          backgroundColor: 'transparent',
          fontSize: sizes.FONTSIZE_HIGH,
          fontFamily: fonts.Quicksand.semibold,
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
        },
        imageContainer: {
          width: sizes.WIDTH * 0.5,
          height: sizes.HEIGHT * 0.21,
          borderRadius: 12,
          marginRight: scaleWithMax(12, 14),
          backgroundColor: '#fff',
          ...theme.globalStyles.SHADOW_STYLE,
          overflow: 'hidden',
        },

        filterImage: {
          width: '100%',
          height: '100%',
          resizeMode: 'cover',
          borderRadius: 12,
        },

        footer: {
          position: 'absolute',
          bottom: scaleWithMax(25, 30),
          left: 0,
          right: 0,
          paddingHorizontal: sizes.PADDING,
        },
        timer: {
          position: 'absolute',
          top: sizes.PADDING,
          left: sizes.PADDING,
          right: sizes.PADDING,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        },
        timerDisplay: {
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          paddingHorizontal: scaleWithMax(12, 14),
          paddingVertical: scaleWithMax(6, 8),
          borderRadius: scaleWithMax(8, 10),
        },
        timerText: {
          color: '#FFFFFF',
          fontSize: scaleWithMax(14, 16),
          fontWeight: '600',
        },
        crossButton: {
          // Removed marginLeft since timer text is gone
        },
        crossBackground: {
          backgroundColor: 'rgba(0,0,0,0.3)',
          borderWidth: 1,
          borderColor: theme.colors.WHITE,
          borderRadius: 50, // circle
          padding: sizes.PADDING / 2,
          justifyContent: 'center',
          alignItems: 'center',
        },
        recordButtonContainer: {
          position: 'absolute',
          bottom: sizes.HEIGHT * 0.05,
          alignSelf: 'center',
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
          fontSize: scaleWithMax(11, 12),
          color: theme.colors.WHITE,
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
          ...theme.globalStyles.SHADOW_STYLE,
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
      }),
    [sizes, theme],
  );

  return {
    styles,
    theme,
  };
};

export default useStyles;
