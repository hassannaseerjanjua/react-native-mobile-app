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
        flex: 1,
        paddingTop: sizes.HEIGHT * 0.016,
      },
      listCard: {
        backgroundColor: colors.WHITE,
        borderRadius: 16,
        // marginBottom: sizes.HEIGHT * 0.24,
        ...theme.globalStyles.SHADOW_STYLE,
      },
      tabSpacing: {
        height: sizes.HEIGHT * 0.016,
      },
      listContainer: {
        paddingVertical: 0,
      },
      TabItem: {
        // height: sizes.HEIGHT * 0.075,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 17,
        elevation: 4,
      },
      sectionTitle: {
        fontFamily: fonts.Quicksand.semibold,
        fontSize: sizes.FONTSIZE_MED_HIGH,
        color: colors.PRIMARY_TEXT,
        paddingTop: sizes.HEIGHT * 0.014,
        paddingBottom: sizes.HEIGHT * 0.008,
      },
      errorText: {
        fontFamily: fonts.Quicksand.regular,
        fontSize: 14,
        color: colors.PRIMARY_TEXT,
        padding: 20,
        textAlign: 'center',
      },
      noFriendsContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        // backgroundColor: 'red',
        flex: 1,
        height: '100%',
        paddingTop: sizes.HEIGHT * 0.16,
        // paddingBottom: sizes.HEIGHT * 0.2,
      },
      noFriendsText: {
        ...theme.globalStyles.TEXT_STYLE,
        color: colors.BLACK,
        fontSize: sizes.FONTSIZE_BUTTON,
        paddingVertical: sizes.HEIGHT * 0.007,
        paddingBottom: sizes.HEIGHT * 0.03,
        textAlign: 'center',
      },
      tabContainer: {
        // marginBottom: sizes.HEIGHT * 0.01,
        marginTop: sizes.HEIGHT * 0.016,
      },
      scrollableContent: {
        flex: 1,
      },
      scrollableContentContainer: {
        flexGrow: 1,
        // paddingHorizontal: theme.sizes.PADDING,
        // paddingTop: sizes.HEIGHT * 0.01,
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
        shadowOpacity: 0.08,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
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
      step2Container: {
        paddingVertical: sizes.HEIGHT * 0.02,
      },
      membersHeading: {
        fontFamily: fonts.Quicksand.semibold,
        fontSize: 16,
        color: colors.PRIMARY_TEXT,
        marginBottom: sizes.HEIGHT * 0.015,
      },
      membersGridContainer: {
        flex: 1,
      },
      memberRow: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginBottom: sizes.HEIGHT * 0.02,
      },
      memberGridItem: {
        alignItems: 'center',
        width: 80,
        marginRight: 12,
      },
      memberGridImageContainer: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
      },
      memberGridCrossIcon: {
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
      memberGridAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginBottom: 6,
      },
      memberGridName: {
        fontFamily: fonts.Quicksand.medium,
        fontSize: 12,
        color: colors.PRIMARY_TEXT,
        textAlign: 'center',
        maxWidth: 80,
      },
    });
  }, [theme]);

  return {
    theme,
    styles,
  };
};

export default useStyles;
