import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import useTheme from '../../../styles/theme';
import { scaleWithMax } from '../../../utils';

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
          paddingTop: sizes.HEIGHT * 0.02,
          paddingBottom: sizes.PADDING + sizes.HEIGHT * 0.1,
        },
        messageContainer: {
          height: sizes.HEIGHT * 0.512,
          paddingHorizontal: sizes.PADDING,
        },
        inputWrapper: {
          flex: 1,
          height: '100%',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.05,
          shadowRadius: 15,
          elevation: 8,
          borderRadius: 10,
          backgroundColor: '#fff',
        },
        textInput: {
          flex: 1,
          borderRadius: 10,
          fontFamily: 'Poppins-Regular',
          color: '#000',
          textAlignVertical: 'top',
          paddingHorizontal: scaleWithMax(15, 18),
          paddingVertical: scaleWithMax(15, 18),
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
        },
        filtersScrollContent: {},
        imageContainer: {
          width: sizes.WIDTH * 0.67,
          height: sizes.HEIGHT * 0.21,
          borderRadius: 12,
          paddingRight: sizes.PADDING,
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
          bottom: sizes.HEIGHT * 0.025,
          left: 0,
          right: 0,
          paddingHorizontal: sizes.PADDING,
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
