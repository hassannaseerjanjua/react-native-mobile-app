import React, { useMemo } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import useTheme from '../../styles/theme';
import {
  SvgLogoHeader,
  SvgSearchIcon,
  SvgDummyAvatar,
  SvgBackIcon,
} from '../../assets/icons';
import { scaleWithMax } from '../../utils';

interface HomeHeaderProps {
  title?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  showSearch?: boolean;
  showProfileIcon?: boolean;
}

const HomeHeader: React.FC<HomeHeaderProps> = ({
  title,
  showBackButton = false,
  onBackPress,
  showSearch = true,
  showProfileIcon = false,
}) => {
  const { styles } = useStyles();
  const navigation = useNavigation();

  const handleSearchPress = () => {
    navigation.navigate('Search' as never);
  };

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  const backSize = scaleWithMax(20, 25);

  return (
    <View style={styles.container}>
      {showBackButton ? (
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackPress}
          activeOpacity={0.7}
        >
          <SvgBackIcon width={backSize} height={backSize} />
        </TouchableOpacity>
      ) : (
        <SvgLogoHeader />
      )}

      {title && <Text style={styles.title}>{title}</Text>}

      <View style={styles.rightSection}>
        {showSearch && (
          <TouchableOpacity
            style={styles.searchContainer}
            onPress={handleSearchPress}
            activeOpacity={0.7}
          >
            <SvgSearchIcon />
          </TouchableOpacity>
        )}
        {showProfileIcon && (
          <View style={styles.avatarContainer}>
            <SvgDummyAvatar />
          </View>
        )}
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
      backButton: {
        paddingVertical: sizes.PADDING,
        alignItems: 'center',
        justifyContent: 'center',
      },
      title: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.PRIMARY_TEXT,
        textAlign: 'center',
        flex: 1,
      },
    });
  }, [theme]);

  return {
    theme,
    styles,
  };
};
