import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import useTheme from '../../styles/theme';
import {
  SvgLogoHeader,
  SvgSearchIcon,
  SvgDummyAvatar,
} from '../../assets/icons';

const HomeHeader: React.FC = () => {
  const { styles } = useStyles();

  return (
    <View style={styles.container}>
      <SvgLogoHeader />
      <View style={styles.rightSection}>
        <View style={styles.searchContainer}>
          <SvgSearchIcon />
        </View>
        <View style={styles.avatarContainer}>
          <SvgDummyAvatar />
        </View>
      </View>
    </View>
  );
};

export default HomeHeader;

const useStyles = () => {
  const theme = useTheme();
  const styles = useMemo(() => {
    const { colors, sizes } = theme;
    return StyleSheet.create({
      container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: sizes.PADDING,
        backgroundColor: colors.BACKGROUND,
      },
      rightSection: {
        flexDirection: 'row',
        alignItems: 'center',
      },
      searchContainer: {
        width: 35,
        height: 35,
        backgroundColor: colors.WHITE,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 35 / 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
      },
      avatarContainer: {
        marginStart: sizes.WIDTH * 0.05,
      },
    });
  }, [theme]);

  return {
    theme,
    styles,
  };
};
