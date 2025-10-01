import { StyleSheet } from 'react-native';
import { useMemo } from 'react';
import useTheme from '../../../styles/theme';
import fonts from '../../../assets/fonts';

const useStyles = () => {
  const theme = useTheme();

  const styles = useMemo(() => {
    const { colors, sizes } = theme;

    return StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: colors.BACKGROUND,
        paddingHorizontal: sizes.PADDING,
      },
      content: {
        flex: 1,
        paddingVertical: sizes.PADDING,
      },
      listCard: {
        backgroundColor: colors.WHITE,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOpacity: 0.03,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 1,
      },
      listContainer: {
        paddingVertical: 2,
      },
      userRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 8,
        paddingHorizontal: 14,
      },
      userRowDivider: {
        borderBottomWidth: 1,
        borderBottomColor: '#F1F1F1',
      },

      userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
      },

      avatarWrapper: {
        width: 36,
        height: 36,
        borderRadius: 18,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        backgroundColor: '#FFFFFF',
      },

      userName: {
        fontFamily: fonts.Quicksand.medium,
        fontSize: 15,
        letterSpacing: 0.15,
        color: colors.PRIMARY_TEXT,
      },
      addButton: {
        borderWidth: 1,
        borderColor: '#DDEAFB',
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: colors.SECONDARY,
        minWidth: 68,
        alignItems: 'center',
        justifyContent: 'center',
      },
      addButtonText: {
        fontFamily: fonts.Quicksand.medium,
        fontSize: 14,
        color: colors.PRIMARY,
      },
      addedButton: {
        backgroundColor: '#EAF3FF',
        borderColor: '#EAF3FF',
      },
      addedButtonText: {
        color: colors.PRIMARY,
        fontWeight: '600',
      },
    });
  }, [theme]);

  return { theme, styles };
};

export default useStyles;
