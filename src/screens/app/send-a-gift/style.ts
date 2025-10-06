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
      listContainer: {
        paddingVertical: 0,
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
      bottomSheetContainer: {
        width: sizes.PADDED_WIDTH,
        alignSelf: 'center',
        height: sizes.HEIGHT * 0.97,
        padding: 0,
        borderTopRightRadius: 16,
        borderTopLeftRadius: 16,
      },
      selectedUsersContainer: {
        marginVertical: sizes.HEIGHT * 0.01,
        paddingVertical: 12,
        backgroundColor: colors.WHITE,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOpacity: 0.03,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 1,
      },
      selectedUsersList: {
        flexDirection: 'row',
      },
      selectedUserItem: {
        alignItems: 'center',
        width: 80,
      },
      selectedUserImageContainer: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
      },
      selectedUserCrossIcon: {
        position: 'absolute',
        top: 0,
        right: -5,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#F8F8F6',
        alignItems: 'center',
        justifyContent: 'center',
      },
      selectedUserAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginBottom: 6,
      },
      selectedUserName: {
        fontFamily: fonts.Quicksand.medium,
        fontSize: 12,
        color: colors.PRIMARY_TEXT,
        textAlign: 'center',
        maxWidth: 80,
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
      modalBackdrop: {
        flex: 1,
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
      },
      modalContent: {
        flex: 1,
        height: sizes.HEIGHT,
        width: '100%',
        paddingTop: sizes.HEIGHT * 0.01,
        paddingHorizontal: sizes.PADDING,
      },
      modalScrollView: {
        flex: 1,
        height: sizes.HEIGHT * 0.85,
        width: '100%',
      },
    });
  }, [theme]);

  return {
    theme,
    styles,
  };
};

export default useStyles;
