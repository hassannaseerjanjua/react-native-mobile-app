import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Pressable,
  Image,
  TouchableWithoutFeedback,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import useTheme from '../../styles/theme';
import {
  SvgLogoHeader,
  SvgSearchIcon,
  SvgDummyAvatar,
  SvgHomeBack,
  SvgLogoBlue,
} from '../../assets/icons';
import {
  isAndroid,
  isAndroidThen,
  scaleWithMax,
  rtlTransform,
  rtlTextAlign,
} from '../../utils';
import fonts from '../../assets/fonts';
import { useAuthStore } from '../../store/reducer/auth';
import { useLocaleStore } from '../../store/reducer/locale';
import { Text } from '../../utils/elements';

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
  rightSideTitleStyle?: StyleProp<ViewStyle>;
  showLogo?: boolean;
  customContainerStyle?: StyleProp<ViewStyle>;
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
}) => {
  const { styles, theme } = useStyles();
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const { getString, isRtl } = useLocaleStore();
  const defaultSearchPlaceholder =
    searchPlaceholder || getString('HOME_SEARCH');

  // Internal state for search when onSearchChange is not provided
  const [internalSearchValue, setInternalSearchValue] = useState(
    searchValue || '',
  );

  // Sync internal state with prop when it changes
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

  // Use controlled value if onSearchChange is provided, otherwise use internal state
  const displaySearchValue = onSearchChange ? searchValue : internalSearchValue;

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  const backSize = scaleWithMax(20, 25);
  const dummyImage = require('../../assets/images/user.png');

  return (
    <View>
      <View style={[styles.container, customContainerStyle]}>
        {showBackButton && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackPress}
            activeOpacity={0.7}
          >
            <SvgHomeBack style={{ transform: rtlTransform(isRtl) }} />
          </TouchableOpacity>
        )}
        {title && (
          <Text style={styles.title} onPress={handleBackPress}>
            {title}
          </Text>
        )}
        {showLogo && (
          <SvgLogoBlue
            width={scaleWithMax(88, 93)}
            height={scaleWithMax(38, 43)}
          />
        )}

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
              <Image
                source={
                  user?.ProfileUrl ? { uri: user.ProfileUrl } : dummyImage
                }
                style={styles.avatar}
              />
            </Pressable>
          )}
          {rightSideTitle && (
            <TouchableOpacity
              onPress={rightSideTitlePress}
              style={[
                {
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                },
                rightSideTitleStyle,
              ]}
            >
              {rightSideIcon && rightSideIcon}
              <Text style={styles.rightSideTitle}>{rightSideTitle}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {showSearchBar && (
        <View style={styles.searchBarContainer}>
          <View style={styles.searchIconWrapper}>
            <SvgSearchIcon width={20} height={20} />
          </View>
          <TextInput
            allowFontScaling={false}
            style={[styles.searchInput, { textAlign: rtlTextAlign(isRtl) }]}
            placeholder={defaultSearchPlaceholder}
            placeholderTextColor="#A0A0A0EE"
            value={displaySearchValue}
            onChangeText={handleSearchChange}
            editable={true}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
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
        paddingTop: isAndroidThen(sizes.PADDING, 0),
        paddingBottom: sizes.HEIGHT * 0.01,
        // backgroundColor: 'blue',
        paddingHorizontal: theme.sizes.PADDING,
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
        marginHorizontal: theme.sizes.PADDING,
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
      rightSideTitle: {
        fontFamily: fonts.Quicksand.semibold,
        fontSize: sizes.FONTSIZE_MEDIUM,
        color: colors.PRIMARY,
        marginStart: 4,
      },
    });
  }, [theme]);

  return {
    theme,
    styles,
  };
};
