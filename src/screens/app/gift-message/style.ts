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
        // paddingTop: sizes.HEIGHT * 0.03,
        // flex: 1,
      },
      inputWrapper: {
        shadowColor: '#0000000D',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 8,
        borderRadius: 10,
        backgroundColor: '#fff',
      },

      textInput: {
        height: '100%',
        borderRadius: 10,
        fontFamily: 'Poppins-Regular',
        color: '#000',
        textAlignVertical: 'top',
        paddingHorizontal: scaleWithMax(15, 18),
        paddingVertical: scaleWithMax(15, 18),
      },
      ImageContainer: {
        overflow: 'hidden',
      },
      FilterImage: {
        borderRadius: 8,
        marginRight: scaleWithMax(15, 18),
        width: sizes.WIDTH * 0.55,
        height: sizes.HEIGHT * 0.2,
        objectFit: 'cover',
      },
    }),
    theme,
  };
};

export default useStyles;
