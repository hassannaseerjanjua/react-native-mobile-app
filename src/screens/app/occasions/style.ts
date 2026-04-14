import { StyleSheet } from 'react-native';
import useTheme from '../../../styles/theme';
import { isAndroid, scaleWithMax } from '../../../utils';

const useStyles = () => {
  const theme = useTheme();
  const { sizes } = theme;
  return {
    styles: StyleSheet.create({
      container: {
        ...theme.globalStyles.CONTAINER_STYLE,
        paddingHorizontal: 0,
        position: 'relative',
      },
      content: {
        paddingHorizontal: sizes.PADDING,
        paddingTop: sizes.HEIGHT * 0.012,
        paddingBottom: sizes.HEIGHT * 0.1,
        gap: sizes.HEIGHT * 0.018,
      },
      TabItem: {
        height: '100%',
        marginBottom: 0,
        borderRadius: sizes.BORDER_RADIUS_MID,
      },
      occasionItemSpacing: {
        height: sizes.HEIGHT * 0.016,
        backgroundColor: theme.colors.WHITE,
      },
      TabText: {
        ...theme.globalStyles.TEXT_STYLE_SEMIBOLD,
        fontSize: sizes.FONTSIZE_SMALL_HEADING,
        color: theme.colors.PRIMARY_TEXT,
      },
      buttonContainer: {
        position: 'absolute',
        bottom: sizes.HEIGHT * 0.02,
        left: sizes.PADDING,
        right: sizes.PADDING,
      },
      inputContainer: {
        // marginBottom: sizes.HEIGHT * 0.012,
      },
      button: {
        marginTop: sizes.HEIGHT * 0.004,
      },
      uploadImageContainer: {
        borderWidth: 2,
        borderColor: theme.colors.PRIMARY,
        borderRadius: sizes.BORDER_RADIUS,
        padding: sizes.PADDING * 1.4,
        gap: sizes.HEIGHT * 0.01,
        alignItems: 'center',
        justifyContent: 'center',
        // Use dashed to get longer segments: --------
        borderStyle: 'dashed',
      },
      uploadButtonText: {
        ...theme.globalStyles.TEXT_STYLE_MEDIUM,
        fontSize: sizes.FONTSIZE_SMALL,
        borderRadius: sizes.BORDER_RADIUS,
        color: theme.colors.PRIMARY,
        padding: sizes.PADDING * 0.4,
        backgroundColor: theme.colors.SECONDARY,
      },
      pencilIconContainer: {
        position: 'absolute',
        bottom: -1,
        end: -2,
        backgroundColor: theme.colors.WHITE,
        borderRadius: scaleWithMax(10, 12),
        padding: scaleWithMax(3, 4),
        width: scaleWithMax(12, 14),
        height: scaleWithMax(12, 14),
        justifyContent: 'center',
        alignItems: 'center',
      },
    }),
    theme,
  };
};

export default useStyles;
