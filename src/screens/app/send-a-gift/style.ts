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
      },
      content: {
        flex: 1,
        marginTop: sizes.HEIGHT * 0.02,
      },
      listCard: {
        backgroundColor: colors.WHITE,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOpacity: 0.03,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 1,
        marginBottom: sizes.HEIGHT * 0.018,
      },
      emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: sizes.PADDING * 2,
      },
      emptyText: {
        fontFamily: fonts.Quicksand.regular,
        fontSize: 14,
        color: colors.SECONDARY_TEXT,
        textAlign: 'center',
      },
      listContainer: {
        paddingVertical: sizes.HEIGHT * 0.0,
      },
      userRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: sizes.WIDTH * 0.04,
        paddingVertical: sizes.HEIGHT * 0.015,
      },
      userRowDivider: {
        borderBottomWidth: 1,
        borderBottomColor: colors.LIGHT_GRAY,
      },
      userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
      },
      avatarWrapper: {
        marginRight: sizes.WIDTH * 0.03,
      },
      avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.LIGHT_GRAY,
      },
      userName: {
        fontFamily: fonts.Quicksand.medium,
        fontSize: 14,
        color: colors.PRIMARY_TEXT,
        flex: 1,
      },
      selectButton: {
        backgroundColor: colors.PRIMARY,
        paddingHorizontal: sizes.WIDTH * 0.04,
        paddingVertical: sizes.HEIGHT * 0.008,
        borderRadius: 8,
        minWidth: 80,
        alignItems: 'center',
        justifyContent: 'center',
      },
      selectedButton: {
        backgroundColor: colors.WHITE,
        borderWidth: 1,
        borderColor: colors.PRIMARY,
      },
      selectButtonText: {
        fontFamily: fonts.Quicksand.semibold,
        fontSize: 12,
        color: colors.WHITE,
      },
      selectedButtonText: {
        color: colors.PRIMARY,
      },
      loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      },
      loadingText: {
        fontFamily: fonts.Quicksand.regular,
        fontSize: 14,
        color: colors.SECONDARY_TEXT,
      },
      sectionTitle: {
        fontFamily: fonts.Quicksand.semibold,
        fontSize: 18,
        color: colors.PRIMARY_TEXT,
        paddingBottom: sizes.HEIGHT * 0.01,
      },
      tabContainer: {
        marginBottom: sizes.HEIGHT * 0.018,
      },
    });
  }, [theme]);

  return {
    theme,
    styles,
  };
};

export default useStyles;
