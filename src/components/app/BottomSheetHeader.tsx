import React, { useMemo } from 'react';
import {
  View,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import useTheme from '../../styles/theme';
import { scaleWithMax } from '../../utils';
import { Text } from '../../utils/elements';

interface BottomSheetHeaderProps {
  title?: string;
  subTitle?: string;
  leftSideTitle?: string;
  showSearchBar?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (text: string) => void;
  rightSideTitle?: string;
  rightSideTitlePress?: () => void;
  rightSideLoading?: boolean;
  leftSideTitlePress?: () => void;
  isGroup?: boolean;
}

const BottomSheetHeader: React.FC<BottomSheetHeaderProps> = ({
  title,
  subTitle,
  leftSideTitle,
  showSearchBar = false,
  searchPlaceholder,
  searchValue = '',
  onSearchChange,
  rightSideTitle,
  rightSideTitlePress,
  rightSideLoading = false,
  leftSideTitlePress,
  isGroup,
}) => {
  const { styles, theme } = useStyles();
  const defaultSearchPlaceholder = searchPlaceholder || 'Search';

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {leftSideTitle && (
          <TouchableOpacity onPress={leftSideTitlePress} activeOpacity={0.7}>
            <Text style={styles.backText}>{leftSideTitle}</Text>
          </TouchableOpacity>
        )}

        <View style={styles.centerContent}>
          {title && (
            <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
              {title}
            </Text>
          )}
          {subTitle && (
            <Text
              style={styles.subTitle}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {subTitle}
            </Text>
          )}
        </View>

        {rightSideTitle && (
          <TouchableOpacity
            onPress={rightSideTitlePress}
            disabled={rightSideLoading}
            activeOpacity={rightSideLoading ? 1 : 0.7}
          >
            {rightSideLoading ? (
              <ActivityIndicator size="small" color={theme.colors.PRIMARY} />
            ) : (
              <Text style={styles.rightSideTitle}>{rightSideTitle}</Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      {showSearchBar && (
        <View style={styles.searchBarContainer}>
          {isGroup ? (
            <View style={styles.imageIconContainer}>
              <Text>Image</Text>
            </View>
          ) : (
            <Text>Search</Text>
          )}
          <TextInput
            allowFontScaling={false}
            style={[styles.searchInput]}
            placeholder={defaultSearchPlaceholder}
            placeholderTextColor={theme.colors.SECONDARY_TEXT}
            value={searchValue}
            onChangeText={onSearchChange}
          />
        </View>
      )}
    </View>
  );
};

export default BottomSheetHeader;

const useStyles = () => {
  const theme = useTheme();
  const styles = useMemo(() => {
    const { colors, sizes, fonts } = theme;

    return StyleSheet.create({
      wrapper: {
        paddingHorizontal: sizes.PADDING,
      },
      container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: sizes.HEIGHT * 0.058,
      },
      centerContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
      },
      backText: {
        fontSize: 16,
        fontFamily: fonts.regular,
        color: colors.PRIMARY_TEXT,
        zIndex: 1,
      },
      title: {
        fontFamily: fonts.bold,
        fontSize: 16,
        color: colors.PRIMARY_TEXT,
        textAlign: 'center',
        maxWidth: '70%',
      },
      subTitle: {
        fontFamily: fonts.regular,
        fontSize: 12,
        color: colors.SECONDARY_TEXT,
        textAlign: 'center',
        maxWidth: '70%',
      },
      rightSideTitle: {
        fontSize: 16,
        fontFamily: fonts.semibold,
        color: colors.PRIMARY,
        zIndex: 1,
      },
      searchBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.LIGHT_GRAY,
        borderRadius: sizes.BORDER_RADIUS,
        paddingHorizontal: sizes.PADDING * 0.8,
        ...theme.globalStyles.BUTTON_TAB_TFIELD_HEIGHT,
        marginTop: sizes.HEIGHT * 0.006,
        marginBottom: sizes.HEIGHT * 0.008,
      },
      searchInput: {
        flex: 1,
        fontSize: 14,
        fontFamily: fonts.regular,
        color: colors.PRIMARY_TEXT,
        marginLeft: sizes.PADDING * 0.6,
        padding: 0,
      },
      imageIconContainer: {
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 99,
        backgroundColor: colors.SECONDARY,
      },
    });
  }, [theme]);

  return { theme, styles };
};
