import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import useTheme from '../../../styles/theme';
import { scaleWithMax } from '../../../utils';

const useStyles = () => {
  const theme = useTheme();

  const styles = useMemo(() => {
    const { colors, sizes, fonts } = theme;

    return StyleSheet.create({
      container: {
        ...theme.globalStyles.CONTAINER_STYLE,
        paddingHorizontal: 0,
      },
      scrollView: {
        flex: 1,
      },
      scrollContent: {
        paddingHorizontal: sizes.PADDING,
        paddingBottom: sizes.HEIGHT * 0.02,
      },
      walletSection: {
        paddingVertical: sizes.HEIGHT * 0.01,
        marginBottom: sizes.HEIGHT * 0.02,
      },
      transactionsSection: {
        flex: 1,
      },
      sectionTitle: {
        fontFamily: fonts.bold,
        fontSize: sizes.FONTSIZE_HIGH,
        color: colors.PRIMARY_TEXT,
        marginBottom: sizes.PADDING,
      },
    });
  }, [theme]);

  return { styles, theme };
};

export default useStyles;
