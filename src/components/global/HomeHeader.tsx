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
import {
  SvgSearchIcon,
  SvgHomeBack,
  SvgLogoBlue,
  SvgCartIcon,
} from '../../assets/icons';
import { isAndroidThen, scaleWithMax, rtlTransform } from '../../utils';
import { useAuthStore } from '../../store/reducer/auth';
import { useLocaleStore } from '../../store/reducer/locale';
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
  showCartIcon?: boolean;
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
  showCartIcon = false,
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
  const { getString, isRtl } = useLocaleStore();
  const defaultSearchPlaceholder =
    searchPlaceholder || getString('HOME_SEARCH');

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

  const getCartCount = useGetApi<any>(apiEndpoints.GET_CART_COUNT, {
    transformData: data => data.Data,
    enabled: showCartIcon,
  });

  useFocusEffect(
    React.useCallback(() => {
      if (showCartIcon) getCartCount.refetch();
    }, [showCartIcon]),
  );

  return (
    <View>
      <View style={[styles.container, customContainerStyle]}>
        {showBackButton && (
          <TouchableOpacity
            style={[
              styles.backButton,
              { transform: [{ translateX: isRtl ? 5 : -5 }] },
            ]}
            onPress={handleBackPress}
            activeOpacity={0.7}
            hitSlop={10}
          >
            <SvgHomeBack
              style={{ transform: rtlTransform(isRtl) }}
              fill={backButtonIconColor}
              width={scaleWithMax(25, 25)}
              height={scaleWithMax(25, 25)}
            />
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
        {showLogo && (
          <SvgLogoBlue
            width={scaleWithMax(105, 108)}
            // height={scaleWithMax(38, 43)}
          />
        )}

        <View style={styles.rightSection}>
          {showCartIcon &&
            getCartCount.data &&
            getCartCount.data?.Count > 0 && (
              <TouchableOpacity
                style={[
                  styles.searchContainer,
                  { marginEnd: theme.sizes.WIDTH * 0.022 },
                ]}
                onPress={() => navigation.navigate('CheckOut' as never)}
              >
                <View style={styles.cartCount}>
                  <Text style={styles.cartCountText}>
                    {getCartCount.data?.Count}
                  </Text>
                </View>
                <SvgCartIcon
                  width={scaleWithMax(22, 22)}
                  height={scaleWithMax(22, 22)}
                />
              </TouchableOpacity>
            )}
          {showSearch && (
            <TouchableOpacity
              style={styles.searchContainer}
              onPress={handleSearchPress}
              activeOpacity={0.7}
            >
              <SvgSearchIcon
                height={scaleWithMax(20, 24)}
                width={scaleWithMax(20, 24)}
              />
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
            icon={
              <SvgSearchIcon
                width={scaleWithMax(20, 22)}
                height={scaleWithMax(20, 22)}
              />
            }
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
      cartCount: {
        position: 'absolute',
        top: 0,
        end: 0,
        backgroundColor: colors.PRIMARY,
        borderRadius: 9999,
        zIndex: 1,
        height: scaleWithMax(14, 16),
        width: scaleWithMax(14, 16),
        justifyContent: 'center',
        alignItems: 'center',
      },
      cartCountText: {
        fontFamily: fonts.regular,
        fontSize: sizes.FONTSIZE_MEDIUM,
        color: colors.WHITE,
        textAlign: 'center',
        lineHeight: scaleWithMax(14, 16),
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
