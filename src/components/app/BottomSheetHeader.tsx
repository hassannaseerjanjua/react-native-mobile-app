import React, { useMemo } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  TextInput,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import useTheme from '../../styles/theme';
import { SvgSearchIcon } from '../../assets/icons';
import fonts from '../../assets/fonts';
import { scaleWithMax } from '../../utils';
import { useAuthStore } from '../../store/reducer/auth';
import { useLocaleStore } from '../../store/reducer/locale';

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
  leftSideTitlePress?: () => void;
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
  leftSideTitlePress,
}) => {
  const { styles, theme } = useStyles();
  const { getString } = useLocaleStore();
  const defaultSearchPlaceholder =
    searchPlaceholder || getString('HOME_SEARCH');

  return (
    <View style={styles.wrapper}>
      {/* Header */}
      <View style={styles.container}>
        {leftSideTitle && (
          <TouchableOpacity onPress={leftSideTitlePress} activeOpacity={0.7}>
            <Text style={styles.backText}>{leftSideTitle}</Text>
          </TouchableOpacity>
        )}

        <View style={styles.centerContent}>
          {title && <Text style={styles.title}>{title}</Text>}
          {subTitle && <Text style={styles.subTitle}>{subTitle}</Text>}
        </View>

        {rightSideTitle && (
          <TouchableOpacity onPress={rightSideTitlePress}>
            <Text style={styles.rightSideTitle}>{rightSideTitle}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Search Bar */}
      {showSearchBar && (
        <View style={styles.searchBarContainer}>
          <SvgSearchIcon width={20} height={20} />
          <TextInput
            style={styles.searchInput}
            placeholder={defaultSearchPlaceholder}
            placeholderTextColor="#A0A0A0EE"
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
    const { colors, sizes } = theme;

    return StyleSheet.create({
      wrapper: {
        // paddingTop: sizes.HEIGHT * 0.02, // Pushes header to top area
        // borderTopRightRadius: 100,
        // borderTopLeftRadius: 100,
        // backgroundColor: colors.RED,
        // paddingTop: sizes.PADDING,
      },
      container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        // paddingHorizontal: sizes.PADDING * 1.2,
        // paddingVertical: sizes.PADDING * 0.8,
      },
      centerContent: {
        flex: 1,
        alignItems: 'center',
      },
      backText: {
        fontSize: 16,
        fontFamily: fonts.Quicksand.regular,
        color: colors.PRIMARY_TEXT,
      },
      title: {
        fontFamily: fonts.Quicksand.bold,
        fontSize: 16,
        color: colors.PRIMARY_TEXT,
      },
      subTitle: {
        fontFamily: fonts.Quicksand.regular,
        fontSize: 12,
        color: colors.SECONDARY_TEXT,
        // marginTop: 2,
      },
      rightSideTitle: {
        fontSize: 16,
        fontFamily: fonts.Quicksand.regular,
        color: colors.PRIMARY,
      },
      searchBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.WHITE,
        borderRadius: 12,
        paddingHorizontal: sizes.PADDING,
        paddingVertical: sizes.HEIGHT * 0.015,
        marginVertical: sizes.PADDING * 0.8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
      },
      searchInput: {
        flex: 1,
        fontSize: 14,
        fontFamily: fonts.Quicksand.regular,
        color: colors.PRIMARY_TEXT,
        marginLeft: sizes.PADDING * 0.6,
        padding: 0,
      },
    });
  }, [theme]);

  return { theme, styles };
};
