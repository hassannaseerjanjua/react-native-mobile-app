import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Image } from '../../utils/elements';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import useTheme from '../../styles/theme';
import { isAndroidThen, scaleWithMax } from '../../utils';
import { useAuthStore } from '../../store/reducer/auth';
import { Text } from '../../utils/elements';
import apiEndpoints from '../../constants/api-endpoints';
import useGetApi from '../../hooks/useGetApi';
import InputField from './InputField';
import SkeletonLoader from '../SkeletonLoader';

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
  rightSideTitle?: string;
  rightSideTitlePress?: () => void;
  rightSideIcon?: any;
  rightSideTitleStyle?: StyleProp<TextStyle>;
  rightSideTitleTextStyle?: StyleProp<TextStyle>;
  /** Custom element to render on the right side (e.g., dropdown) */
  rightSideView?: React.ReactNode;
  showLogo?: boolean;
  customContainerStyle?: StyleProp<ViewStyle>;
  titleTextStyle?: StyleProp<TextStyle>;
  backButtonIconColor?: string;
  hideSearchBar?: boolean;
  loading?: boolean;
}

const HomeHeader: React.FC<HomeHeaderProps> = ({
  title,
  showBackButton = false,
  onBackPress,
  showSearch = false,
  showProfileIcon = false,
  showSearchBar = false,
  searchPlaceholder,
  searchValue = '',
  onSearchChange,
  onProfilePress,
  rightSideTitle,
  rightSideTitlePress,
  rightSideIcon,
  showLogo,
  customContainerStyle,
  rightSideTitleStyle,
  rightSideView,
  rightSideTitleTextStyle,
  titleTextStyle,
  backButtonIconColor,
  hideSearchBar,
  loading,
}) => {
  const { styles, theme } = useStyles();
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const defaultSearchPlaceholder = searchPlaceholder || 'Search';

  const [internalSearchValue, setInternalSearchValue] = useState(
    searchValue || '',
  );
  const [isFocused, setIsFocused] = useState(false);
  useEffect(() => {
    if (onSearchChange) {
      setInternalSearchValue(searchValue || '');
    }
  }, [searchValue, onSearchChange]);

  const handleSearchPress = () => {
    navigation.navigate('Search' as never);
  };

  const handleSearchChange = (text: string) => {
    if (onSearchChange) {
      onSearchChange(text);
    } else {
      setInternalSearchValue(text);
    }
  };

  const displaySearchValue = onSearchChange ? searchValue : internalSearchValue;

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const dummyImage = require('../../assets/images/user.png');



  return (
    <View>
      <View style={[styles.container, customContainerStyle]}>
        {showBackButton && (
          <TouchableOpacity
            style={[styles.backButton]}
            onPress={handleBackPress}
            activeOpacity={0.7}
            hitSlop={10}
          >
            <Text>Back</Text>
          </TouchableOpacity>
        )}
        {title && (
          <View
            style={[styles.titleContainer, { transform: [{ translateX: -3 }] }]}
          >
            <Pressable onPress={handleBackPress} style={styles.titlePressable}>
              <Text
                style={[styles.title, titleTextStyle]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {title}
              </Text>
            </Pressable>
          </View>
        )}
        {showLogo && <Text>Logo</Text>}

        <View style={styles.rightSection}>

          {showSearch && (
            <TouchableOpacity
              style={styles.searchContainer}
              onPress={handleSearchPress}
              activeOpacity={0.7}
            >
              <Text>Search</Text>
            </TouchableOpacity>
          )}

          {showProfileIcon && (
            <Pressable style={styles.avatarContainer} onPress={onProfilePress}>
              <Image
                source={
                  user?.ProfileUrl ? { uri: user.ProfileUrl } : dummyImage
                }
                style={styles.avatar}
              />
            </Pressable>
          )}
          {rightSideView && (
            <View style={styles.rightSideViewContainer}>{rightSideView}</View>
          )}
          {(rightSideTitle || rightSideIcon) && (
            <TouchableOpacity
              onPress={rightSideTitlePress}
              style={[
                {
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: theme.sizes.PADDING * 0.1,
                },
                rightSideTitleStyle,
              ]}
            >
              {rightSideIcon && rightSideIcon}
              {rightSideTitle ? (
                <Text style={[styles.rightSideTitle, rightSideTitleTextStyle]}>
                  {rightSideTitle}
                </Text>
              ) : null}
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading && !isFocused && (
        <View style={styles.searchBarContainer}>
          <SkeletonLoader screenType="searchBar" />
        </View>
      )}
      {((!loading && showSearchBar) || isFocused) && (
        <View style={styles.searchBarContainer}>
          <InputField
            icon={<Text>Search</Text>}
            fieldProps={{
              onFocus: () => setIsFocused(true),
              // onBlur: () => setTimeout(() => setIsFocused(false), 200),
              allowFontScaling: false,
              placeholder: defaultSearchPlaceholder,
              placeholderTextColor: theme.colors.SECONDARY_TEXT,
              value: displaySearchValue,
              style: { includeFontPadding: false },
              onChangeText: handleSearchChange,
              editable: true,
              autoCorrect: false,
              autoCapitalize: 'none',
              returnKeyType: 'done',
            }}
            style={styles.searchInputContainer}
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
    const { colors, sizes, fonts } = theme;
    return StyleSheet.create({
      container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: isAndroidThen(sizes.HEIGHT * 0.01, 0),
        paddingBottom: sizes.HEIGHT * 0.006,
        // backgroundColor: colors.RED,
        paddingHorizontal: theme.sizes.PADDING,
        position: 'relative',
      },
      rightSection: {
        flexDirection: 'row',
        alignItems: 'center',
      },
      rightSideViewContainer: {
        marginLeft: theme.sizes.PADDING * 0.5,
      },
      searchContainer: {
        width: scaleWithMax(35, 38),
        height: scaleWithMax(35, 38),
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: scaleWithMax(35, 38) / 2,
        // ...theme.globalStyles.SHADOW_STYLE_SEARCH_BAR,
        position: 'relative',
      },
      avatarContainer: {
        marginStart: sizes.WIDTH * 0.04,
      },
      backButton: {
        alignItems: 'center',
        justifyContent: 'center',
        marginEnd: sizes.WIDTH * 0.015,
      },
      titleContainer: {
        flex: 1,
        // marginStart: sizes.WIDTH * 0.02,
        justifyContent: 'center',
        // backgroundColor: colors.RED,
      },
      titlePressable: {
        alignSelf: 'flex-start',
      },
      title: {
        // fontFamily: fonts.bold,
        ...theme.globalStyles.TEXT_STYLE_BOLD,
        fontSize: sizes.FONTSIZE_HEADING,
        // lineHeight: sizes.FONTSIZE_HEADING * 1.2,
        color: colors.PRIMARY_TEXT,
        includeFontPadding: true,
      },
      searchBarContainer: {
        marginTop: sizes.HEIGHT * 0.008,
        marginHorizontal: theme.sizes.PADDING,
      },
      searchInputContainer: {
        width: '100%',
      },
      avatar: {
        width: scaleWithMax(35, 38),
        height: scaleWithMax(35, 38),
        borderRadius: scaleWithMax(35, 38) / 2,
      },
      rightSideTitle: {
        fontFamily: fonts.semibold,
        fontSize: sizes.FONTSIZE_MEDIUM,
        color: colors.PRIMARY,
        marginStart: sizes.PADDING * 0.1,
      },
    });
  }, [theme]);

  return {
    theme,
    styles,
  };
};
