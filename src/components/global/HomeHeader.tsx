import React, { useMemo } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import useTheme from '../../styles/theme';
import {
  SvgLogoHeader,
  SvgSearchIcon,
  SvgDummyAvatar,
  SvgBackIcon,
  SvgHomeBack,
} from '../../assets/icons';
import { scaleWithMax } from '../../utils';
import fonts from '../../assets/fonts';
import { useAuthStore } from '../../store/reducer/auth';

interface HomeHeaderProps {
  title?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  showSearch?: boolean;
  showProfileIcon?: boolean;
  showSearchBar?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (text: string) => void;
  onProfilePress?: () => void;
}

const HomeHeader: React.FC<HomeHeaderProps> = ({
  title,
  showBackButton = false,
  onBackPress,
  showSearch = true,
  showProfileIcon = false,
  showSearchBar = false,
  searchPlaceholder = 'Search',
  searchValue = '',
  onSearchChange,
  onProfilePress,
}) => {
  const { styles, theme } = useStyles();
  const navigation = useNavigation();
  const { user } = useAuthStore();
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
    <View>
      <View style={styles.container}>
        {showBackButton ? (
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackPress}
            activeOpacity={0.7}
          >
            <SvgHomeBack
              width={scaleWithMax(38, 38)}
              height={scaleWithMax(22, 25)}
            />
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
            <Pressable style={styles.avatarContainer} onPress={onProfilePress}>
              {user?.ProfileUrl ? (
                <Image
                  source={{ uri: user.ProfileUrl }}
                  style={styles.avatar}
                />
              ) : (
                <SvgDummyAvatar />
              )}
            </Pressable>
          )}
        </View>
      </View>

      {showSearchBar && (
        <View style={styles.searchBarContainer}>
          <View style={styles.searchIconWrapper}>
            <SvgSearchIcon width={20} height={20} />
          </View>
          <TextInput
            style={styles.searchInput}
            placeholder={searchPlaceholder}
            placeholderTextColor="#A0A0A0EE"
            value={searchValue}
            onChangeText={onSearchChange}
          />
        </View>
      )}
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
        paddingTop: sizes.PADDING,
        // backgroundColor: colors.RED,
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
        // paddingVertical: sizes.PADDING,
        alignItems: 'center',
        justifyContent: 'center',
      },
      title: {
        fontFamily: fonts.Quicksand.bold,
        fontSize: 20,
        lineHeight: 32,
        color: colors.PRIMARY_TEXT,
        flex: 1,
        marginStart: sizes.WIDTH * 0.024,
      },
      searchBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.WHITE,
        borderRadius: 12,
        paddingHorizontal: sizes.PADDING,
        paddingVertical: sizes.HEIGHT * 0.018,
        // marginTop: sizes.PADDING,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
      },
      searchIconWrapper: {
        marginRight: sizes.PADDING * 0.8,
      },
      searchInput: {
        flex: 1,
        fontSize: 14,
        fontFamily: fonts.Quicksand.regular,
        color: colors.PRIMARY_TEXT,
        padding: 0,
      },
      avatar: {
        width: 35,
        height: 35,
        borderRadius: 35 / 2,
      },
    });
  }, [theme]);

  return {
    theme,
    styles,
  };
};
