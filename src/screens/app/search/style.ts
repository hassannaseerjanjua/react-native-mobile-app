import { StyleSheet } from 'react-native';
import { useMemo } from 'react';
import useTheme from '../../../styles/theme';

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
        flex: 1,        paddingTop: sizes.HEIGHT * 0.016,

      },
      contentContainer: {
        paddingHorizontal: sizes.PADDING,
        paddingVertical: sizes.PADDING*0.3,
        paddingBottom: sizes.HEIGHT * 0.04,
      },
      listCard: {
        backgroundColor: colors.WHITE,
        borderRadius: 16,
      },
      listCardEmpty: {
        backgroundColor: 'transparent',
        shadowColor: 'transparent',
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
      },
      listContainer: {
        paddingVertical: 2,
      },
    });
  }, [theme]);

  return { theme, styles };
};

export default useStyles;
