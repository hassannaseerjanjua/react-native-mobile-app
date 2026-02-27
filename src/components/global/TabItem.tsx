import {
  StyleSheet,
  View,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  Image,
  TextStyle,
} from 'react-native';
import React, { useMemo } from 'react';
import {
  SvgDeleteIcon,
  SvgEditIcon,
  SvgGiftLink,
  SvgGroup,
  SvgNextIcon,
  SvgVerifiedIcon,
} from '../../assets/icons';
import useTheme from '../../styles/theme';
import { Text } from '../../utils/elements';
import { isAndroid, scaleWithMax, rtlTransform } from '../../utils';
import { useLocaleStore } from '../../store/reducer/locale';
import { Platform } from 'react-native';

interface TabItemProps {
  title: string;
  isVerified?: boolean;
  onPress: () => void;
  TabItemStyles?: StyleProp<ViewStyle>;
  TabTextStyles?: StyleProp<TextStyle>;
  isEditGroup?: boolean;
  isLink?: boolean;
  isGroupImage?: any;
  onDeletePress?: () => void;
  onEditPress?: () => void;
  onImagePress?: () => void;
  icon?: React.ReactNode;
  hideRightIcon?: boolean;
  rightSideView?: React.ReactNode;
  subtitle?: string;
  activeOpacity?: number;
  disabled?: boolean;
}

const TabItem = ({
  activeOpacity,
  title,
  isVerified,
  onPress,
  TabItemStyles,
  TabTextStyles,
  isEditGroup,
  isLink,
  isGroupImage = false,
  onDeletePress,
  onEditPress,
  onImagePress,
  icon,
  hideRightIcon,
  rightSideView,
  subtitle,
  disabled = false,
}: TabItemProps) => {
  const { styles, theme } = useStyles();
  const { isRtl } = useLocaleStore();

  const androidTextAdjust =
    Platform.OS === 'android' && !isRtl ? { includeFontPadding: false } : null;

  return (
    <TouchableOpacity
      activeOpacity={activeOpacity}
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      style={[
        styles.container,
        TabItemStyles,
        subtitle && styles.containerWithSubtitle,
      ]}
    >
      <View style={styles.contentContainer}>
        {isGroupImage ? (
          onImagePress ? (
            <TouchableOpacity
              onPress={e => {
                e.stopPropagation();
                onImagePress();
              }}
              activeOpacity={0.8}
            >
              <Image
                source={
                  typeof isGroupImage === 'string'
                    ? { uri: isGroupImage }
                    : isGroupImage
                }
                style={styles.groupImage}
              />
            </TouchableOpacity>
          ) : (
            <Image
              source={
                typeof isGroupImage === 'string'
                  ? { uri: isGroupImage }
                  : isGroupImage
              }
              style={styles.groupImage}
            />
          )
        ) : (
          isGroupImage === '' && <SvgGroup />
        )}
        {isLink && <SvgGiftLink />}
        {icon && icon}
        <View style={styles.titleContainer}>
          <Text
            style={[styles.titleText, TabTextStyles, androidTextAdjust]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {title}
          </Text>
          {isVerified && <SvgVerifiedIcon />}
          {subtitle && (
            <Text
              style={[styles.subtitleText, androidTextAdjust]}
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {rightSideView && rightSideView}
      {isEditGroup ? (
        <>
          <View style={styles.editGroupContainer}>
            <SvgDeleteIcon onPress={onDeletePress} />
            <SvgEditIcon onPress={onEditPress} />
          </View>
        </>
      ) : (
        !hideRightIcon && (
          <SvgNextIcon style={{ transform: rtlTransform(isRtl) }} />
        )
      )}
    </TouchableOpacity>
  );
};

const useStyles = () => {
  const theme = useTheme();

  const styles = useMemo(() => {
    const { colors, sizes } = theme;

    return StyleSheet.create({
      container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.WHITE,
        gap: 10,
        width: '100%',
        paddingHorizontal: theme.sizes.PADDING,
        // paddingVertical: theme.sizes.HEIGHT * 0.017,
        ...theme.globalStyles.BUTTON_TAB_TFIELD_HEIGHT,
        borderRadius: sizes.BORDER_RADIUS,
        ...theme.globalStyles.SHADOW_STYLE,
      },
      contentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scaleWithMax(8, 10),
        flex: 1,
        minWidth: 0,
      },
      titleContainer: {
        flex: 1,
        minWidth: 0,
        justifyContent: 'center',
      },
      titleText: {
        ...theme.globalStyles.TEXT_STYLE_MEDIUM,
        fontSize: theme.sizes.FONTSIZE_LESS_HIGH,
        color: colors.PRIMARY_TEXT,
      },
      subtitleText: {
        ...theme.globalStyles.TEXT_STYLE,
        fontSize: scaleWithMax(12, 13),
        color: colors.PRIMARY_TEXT,
        marginTop: scaleWithMax(2, 3),
      },
      containerWithSubtitle: {
        paddingVertical: theme.sizes.HEIGHT * 0.015,
      },
      editGroupContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scaleWithMax(22, 26),
        flexShrink: 0,
      },
      groupImage: {
        width: 40,
        height: 40,
        borderRadius: 999,
      },
    });
  }, [theme]);

  return { theme, styles };
};

export default TabItem;
