import { StyleSheet } from 'react-native';
import useTheme from '../../../styles/theme';
import { scaleWithMax } from '../../../utils';

const useStyles = () => {
  const theme = useTheme();
  const { sizes, colors } = theme;

  return {
    styles: StyleSheet.create({
      container: {
        ...theme.globalStyles.CONTAINER_STYLE,
        paddingHorizontal: 0,
        flex: 1,
        backgroundColor: colors.BACKGROUND,
      },
      heroWrapper: {
        height: sizes.HEIGHT * 0.32,
        position: 'relative',
      },
      heroImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
      },
      heroOverlay: {
        position: 'absolute',
        top: sizes.HEIGHT * 0.05,
        left: 0,
        right: 0,
        // paddingHorizontal: sizes.PADDING,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      },
      actionButton: {
        width: scaleWithMax(36, 40),
        height: scaleWithMax(36, 40),
        borderRadius: 999,
        backgroundColor: colors.WHITE,
        justifyContent: 'center',
        alignItems: 'center',
        ...theme.globalStyles.SHADOW_STYLE,
      },
      contentWrapper: {
        flex: 1,
        // paddingHorizontal: sizes.PADDING,
        paddingBottom: sizes.PADDING * 3,
      },
      storeCard: {
        backgroundColor: colors.WHITE,
        borderRadius: sizes.BORDER_RADIUS_MID,
        padding: sizes.PADDING * 0.8,
        marginTop: -sizes.HEIGHT * 0.08,
        ...theme.globalStyles.SHADOW_STYLE,
      },
      storeInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
      },
      storeAvatar: {
        width: scaleWithMax(70, 80),
        height: scaleWithMax(70, 80),
        borderRadius: 999,
        borderWidth: 2,
        borderColor: colors.BACKGROUND,
        marginRight: sizes.PADDING * 0.8,
      },
      storeTextContainer: {
        flex: 1,
      },
      storeTitle: {
        ...theme.globalStyles.TEXT_STYLE_SEMIBOLD,
        fontSize: sizes.FONTSIZE_HEADING,
        color: colors.PRIMARY_TEXT,
      },
      storeSubtitle: {
        ...theme.globalStyles.TEXT_STYLE,
        marginTop: 4,
        color: colors.SECONDARY_TEXT,
      },
      tabsContainer: {
        marginTop: sizes.HEIGHT * 0.026,
        marginBottom: sizes.HEIGHT * 0.02,
        height: sizes.HEIGHT * 0.044,
      },
      gridItem: {
        width: '48%',
        marginBottom: scaleWithMax(16, 20),
      },
      listContent: {
        paddingBottom: sizes.PADDING * 3,
        paddingHorizontal: sizes.PADDING,
      },
      columnWrapper: {
        justifyContent: 'space-between',
      },
    }),
    theme,
  };
};

export default useStyles;
