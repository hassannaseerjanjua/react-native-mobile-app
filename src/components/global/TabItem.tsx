import {
  StyleSheet,
  View,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import React, { useEffect, useMemo } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import useTheme from '../../styles/theme';
import { Text, Image } from '../../utils/elements';
import { isAndroid, scaleWithMax } from '../../utils';
import { Platform } from 'react-native';
import ShadowView from './ShadowView';
import type { ShadowPresetName } from '../../styles/global-styles';

interface TabItemProps {
  title: string;
  isVerified?: boolean;
  onPress: () => void;
  TabItemStyles?: StyleProp<ViewStyle>;
  TabTextStyles?: StyleProp<TextStyle>;
  isEditGroup?: boolean;
  editOnly?: boolean;
  isLink?: boolean;
  isGroupImage?: any;
  groupImageSize?: number;
  onDeletePress?: () => void;
  onEditPress?: () => void;
  onImagePress?: () => void;
  icon?: React.ReactNode;
  hideRightIcon?: boolean;
  rightIconRotated?: boolean;
  rightSideView?: React.ReactNode;
  subtitle?: string;
  activeOpacity?: number;
  disabled?: boolean;
  shadowPreset?: ShadowPresetName;
  shadowDisabled?: boolean;
}

const TabItem = ({
  activeOpacity,
  title,
  isVerified,
  onPress,
  TabItemStyles,
  TabTextStyles,
  isEditGroup,
  editOnly = false,
  isLink,
  isGroupImage = false,
  groupImageSize,
  onDeletePress,
  onEditPress,
  onImagePress,
  icon,
  hideRightIcon,
  rightIconRotated = false,
  rightSideView,
  subtitle,
  disabled = false,
  shadowPreset = 'listItem',
  shadowDisabled = false,
}: TabItemProps) => {
  const { styles, theme } = useStyles();

  const androidTextAdjust =
    Platform.OS === 'android' ? { includeFontPadding: false } : null;

  const resolvedGroupImageSize = groupImageSize ?? scaleWithMax(36, 36);
  const groupImageSizeSV = useSharedValue(resolvedGroupImageSize);

  useEffect(() => {
    groupImageSizeSV.value = withTiming(resolvedGroupImageSize, {
      duration: 180,
    });
  }, [resolvedGroupImageSize, groupImageSizeSV]);

  const animatedGroupImageContainerStyle = useAnimatedStyle(() => ({
    width: groupImageSizeSV.value,
    height: groupImageSizeSV.value,
    borderRadius: groupImageSizeSV.value / 2,
    overflow: 'hidden',
  }));

  const rotation = useSharedValue(rightIconRotated ? 1 : 0);

  useEffect(() => {
    rotation.value = withTiming(rightIconRotated ? 1 : 0, {
      duration: 120,
    });
  }, [rightIconRotated, rotation]);

  const animatedIconStyle = useAnimatedStyle(() => {
    const rotateDeg = interpolate(rotation.value, [0, 1], [0, 90]);
    return {
      transform: [{ rotate: `${rotateDeg}deg` }],
    };
  });

  return (
    <ShadowView preset={shadowPreset} disabled={shadowDisabled}>
      <TouchableOpacity
        activeOpacity={activeOpacity ?? 0.8}
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
            React.isValidElement(isGroupImage) ? (
              onImagePress ? (
                <TouchableOpacity
                  onPress={e => {
                    e.stopPropagation();
                    onImagePress();
                  }}
                  activeOpacity={0.8}
                >
                  <Animated.View
                    style={[
                      animatedGroupImageContainerStyle,
                      styles.groupImageSvgInner,
                    ]}
                  >
                    {isGroupImage}
                  </Animated.View>
                </TouchableOpacity>
              ) : (
                <Animated.View
                  style={[
                    animatedGroupImageContainerStyle,
                    styles.groupImageSvgInner,
                  ]}
                >
                  {isGroupImage}
                </Animated.View>
              )
            ) : onImagePress ? (
              <TouchableOpacity
                onPress={e => {
                  e.stopPropagation();
                  onImagePress();
                }}
                activeOpacity={0.8}
              >
                <Animated.View style={animatedGroupImageContainerStyle}>
                  <Image
                    source={
                      typeof isGroupImage === 'string'
                        ? { uri: isGroupImage }
                        : isGroupImage
                    }
                    style={styles.groupImage}
                  />
                </Animated.View>
              </TouchableOpacity>
            ) : (
              <Animated.View style={animatedGroupImageContainerStyle}>
                <Image
                  source={
                    typeof isGroupImage === 'string'
                      ? { uri: isGroupImage }
                      : isGroupImage
                  }
                  style={styles.groupImage}
                />
              </Animated.View>
            )
          ) : (
            isGroupImage === '' && <Text>Group</Text>
          )}
          {isLink && <Text>Link</Text>}
          {icon && icon}
          <View style={styles.titleContainer}>
            <Text
              style={[styles.titleText, TabTextStyles, androidTextAdjust]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {title}
            </Text>
            {isVerified && <Text>Verified</Text>}
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
              {!editOnly && onDeletePress && (
                <Text onPress={onDeletePress}>Delete</Text>
              )}
              <Text onPress={onEditPress}>Edit</Text>
            </View>
          </>
        ) : (
          !hideRightIcon && (
            <Animated.View style={animatedIconStyle}>
              <Text>Next</Text>
            </Animated.View>
          )
        )}
      </TouchableOpacity>
    </ShadowView>
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
        width: '100%',
        height: '100%',
      },
      groupImageSvgInner: {
        alignItems: 'center',
        justifyContent: 'center',
      },
    });
  }, [theme]);

  return { theme, styles };
};

export default TabItem;
