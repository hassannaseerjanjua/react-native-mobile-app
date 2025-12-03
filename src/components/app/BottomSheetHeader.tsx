import React, { useMemo } from 'react';
import { View, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import useTheme from '../../styles/theme';
import { SvgImageIcon, SvgSearchIcon } from '../../assets/icons';
import fonts from '../../assets/fonts';
import { useLocaleStore } from '../../store/reducer/locale';
import { Text } from '../../utils/elements';
import { rtlTextAlign } from '../../utils';

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
  leftSideTitlePress,
  isGroup,
}) => {
  const { styles, theme } = useStyles();
  const { getString, isRtl } = useLocaleStore();
  const defaultSearchPlaceholder =
    searchPlaceholder || getString('HOME_SEARCH');

  return (
    <View style={styles.wrapper}>
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

      {showSearchBar && (
        <View style={styles.searchBarContainer}>
          {isGroup ? (
            <View style={styles.imageIconContainer}>
              <SvgImageIcon />
            </View>
          ) : (
            <SvgSearchIcon />
          )}
          <TextInput
            allowFontScaling={false}
            style={[styles.searchInput, { textAlign: rtlTextAlign(isRtl) }]}
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
        fontFamily: fonts.Quicksand.regular,
        color: colors.PRIMARY_TEXT,
        zIndex: 1,
      },
      title: {
        fontFamily: fonts.Quicksand.bold,
        fontSize: 16,
        color: colors.PRIMARY_TEXT,
        textAlign: 'center',
      },
      subTitle: {
        fontFamily: fonts.Quicksand.regular,
        fontSize: 12,
        color: colors.SECONDARY_TEXT,
        textAlign: 'center',
      },
      rightSideTitle: {
        fontSize: 16,
        fontFamily: fonts.Quicksand.semibold,
        color: colors.PRIMARY,
        zIndex: 1,
      },
      searchBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.WHITE,
        borderRadius: 12,
        paddingHorizontal: sizes.PADDING,
        paddingVertical: sizes.HEIGHT * 0.018,
        marginTop: sizes.PADDING * 0.8,
        marginBottom: sizes.PADDING * 0.8,
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
