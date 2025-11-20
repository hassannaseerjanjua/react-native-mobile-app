import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import useTheme from '../../../styles/theme';
import fonts from '../../../assets/fonts';

const useStyles = () => {
  const theme = useTheme();
  const styles = useMemo(() => {
    const { colors, sizes } = theme;
    return StyleSheet.create({
      container: {
        ...theme.globalStyles.CONTAINER_STYLE,
        paddingHorizontal: 0,
      },
      content: {
        paddingHorizontal: sizes.PADDING,
        paddingTop: sizes.HEIGHT * 0.02,
      },
      tabSpacing: {
        height: sizes.HEIGHT * 0.016,
      },
      modalOverlay: {
        flex: 1,
        backgroundColor: 'transparent',
        justifyContent: 'flex-end',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      },
      modalContainer: {
        backgroundColor: colors.WHITE,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: sizes.HEIGHT,
        width: '100%',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        // overflow: 'hidden',
      },
      modalContent: {
        flex: 1,
        height: sizes.HEIGHT,
        width: '100%',
        paddingTop: sizes.HEIGHT * 0.01,
        paddingHorizontal: sizes.PADDING,
        overflow: 'visible',
      },
      modalScrollView: {
        flex: 1,
        height: sizes.HEIGHT * 0.85,
        width: '100%',
        overflow: 'visible',
      },
      membersContainer: {
        flex: 1,
        backgroundColor: colors.WHITE,
        zIndex: 1,
        position: 'relative',
        overflow: 'visible',
      },
      listCard: {
        backgroundColor: colors.WHITE,
        ...theme.globalStyles.SHADOW_STYLE,
        borderRadius: sizes.BORDER_RADIUS,
        marginBottom: sizes.HEIGHT * 0.018,
      },
      listContainer: {
        paddingVertical: 0,
      },
      TabItem: {
        height: sizes.HEIGHT * 0.075,
      },
    });
  }, [theme]);

  return { styles, theme };
};

export default useStyles;
