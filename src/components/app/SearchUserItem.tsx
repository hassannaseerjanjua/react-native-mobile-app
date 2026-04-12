import React, { useMemo } from 'react';
import {
  View,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from 'react-native';
import {
  SvgSearchAdd,
  SvgSelectedCheck,
  SvgVerifiedIcon,
} from '../../assets/icons';
import { ActiveUser } from '../../types';
import { useLocaleStore } from '../../store/reducer/locale';
import useTheme from '../../styles/theme';
import { Text, Image } from '../../utils/elements';
import { scaleWithMax } from '../../utils';

interface SearchUserItemProps {
  item: ActiveUser;
  index: number;
  isLast: boolean;
  updatedUsers?: Record<number, number>;
  loadingUsers?: Record<number, boolean>;
  handleAddUser?: (userId: number) => void;
  showAddButton?: boolean;
  showSelection?: boolean;
  isSelected?: boolean;
  onSelectionPress?: () => void;
  tempAddedUserIds?: Set<number>;
  isGeneralSearchScreen?: boolean;
  onPress?: () => void;
  customButtonText?: string;
  onCustomButtonPress?: () => void;
  selectionDisabled?: boolean;
}

const SearchUserItem: React.FC<SearchUserItemProps> = ({
  item,
  index,
  isLast,
  updatedUsers = {},
  loadingUsers = {},
  handleAddUser,
  showAddButton = true,
  showSelection = false,
  isSelected = false,
  onSelectionPress,
  tempAddedUserIds,
  isGeneralSearchScreen = false,
  onPress,
  customButtonText,
  onCustomButtonPress,
  selectionDisabled = false,
}) => {
  const { styles, theme } = useStyles();
  const { getString } = useLocaleStore();
  const currentStatus = updatedUsers[item.UserId] ?? item.RelationStatus;
  const isAdded = currentStatus === 1;
  const isLoading = loadingUsers[item.UserId] || false;
  const dummyImage = require('../../assets/images/user.png');
  const profileUrlRaw =
    typeof item?.ProfileUrl === 'string' ? item.ProfileUrl.trim() : '';
  const isInvalidProfileUrl =
    !profileUrlRaw ||
    profileUrlRaw.toLowerCase() === 'null' ||
    profileUrlRaw.toLowerCase() === 'undefined';
  const profileSource = !isInvalidProfileUrl
    ? { uri: profileUrlRaw }
    : dummyImage;

  const isTempAdded = tempAddedUserIds?.has(item.UserId) || false;
  const shouldShowButton = isGeneralSearchScreen
    ? !isAdded || isTempAdded || isLoading
    : showAddButton;

  const meSuffix = getString('SG_ME');
  const fullName = item.FullName || '';
  const hasMeSuffix = meSuffix ? fullName.endsWith(meSuffix) : false;
  const displayName = hasMeSuffix
    ? fullName.slice(0, -meSuffix.length)
    : fullName;

  return (
    <>
      <TouchableOpacity
        style={[styles.userRow, !isLast && styles.userRowDivider]}
        onPress={showSelection ? onSelectionPress : onPress}
        activeOpacity={1}
      >
        <View style={styles.userInfo}>
          <View style={styles.avatarWrapper}>
            <Image
              source={profileSource}
              placeholderSource={dummyImage}
              style={styles.avatar}
            />
          </View>
          <View style={styles.nameRow}>
            <Text
              style={[
                styles.userName,
                {
                  maxWidth: shouldShowButton ? '80%' : '80%',
                },
              ]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {displayName}
              {hasMeSuffix && (
                <Text style={styles.userNameSuffix}>{meSuffix}</Text>
              )}
            </Text>
            {item.IsVerified && (
              <View style={styles.verifiedIconWrapper}>
                <SvgVerifiedIcon />
              </View>
            )}
          </View>
        </View>

        {shouldShowButton && (
          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.addButton,
              (isAdded || isTempAdded) && styles.addedButton,
            ]}
            onPress={() => {
              if (customButtonText && onCustomButtonPress) {
                onCustomButtonPress();
              } else {
                handleAddUser?.(item.UserId);
              }
            }}
            disabled={isLoading || isTempAdded}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={theme.colors.PRIMARY} />
            ) : (
              <View style={[styles.buttonContent]}>
                <Text
                  style={[
                    styles.addButtonText,
                    (isAdded || isTempAdded) && styles.addedButtonText,
                  ]}
                >
                  {customButtonText ||
                    (isTempAdded
                      ? getString('SEARCH_ADDED')
                      : isAdded
                      ? getString('MF_UNFRIEND')
                      : getString('SEARCH_ADD'))}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}

        {showSelection && (
          <TouchableOpacity
            style={[
              styles.selectionCircle,
              isSelected && styles.selectedCircle,
              selectionDisabled && !isSelected && styles.disabledCircle,
            ]}
            onPress={
              selectionDisabled && !isSelected ? undefined : onSelectionPress
            }
            activeOpacity={selectionDisabled && !isSelected ? 1 : 0.7}
            disabled={selectionDisabled && !isSelected}
          >
            {isSelected && (
              <View style={styles.iconWrapper}>
                <SvgSelectedCheck
                  width={scaleWithMax(9, 10)}
                  height={scaleWithMax(9, 10)}
                />
              </View>
            )}
          </TouchableOpacity>
        )}
      </TouchableOpacity>
      {!isLast && <View style={styles.separator} />}
    </>
  );
};

const useStyles = () => {
  const theme = useTheme();

  const styles = useMemo(() => {
    const { colors, sizes, fonts } = theme;

    return StyleSheet.create({
      userRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: scaleWithMax(8, 8),
        paddingHorizontal: scaleWithMax(14, 14),
      },
      userRowDivider: {
        // borderBottomWidth: 1,
        // borderBottomColor: colors.DIVIDER_COLOR,
      },

      userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
      },

      avatarWrapper: {
        width: scaleWithMax(36, 36),
        height: scaleWithMax(36, 36),
        borderRadius: scaleWithMax(36, 36) / 2,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: scaleWithMax(12, 12),
        backgroundColor: colors.WHITE,
      },

      userName: {
        fontFamily: fonts.medium,
        fontSize: sizes.FONTSIZE_BUTTON,
        lineHeight: Math.round(sizes.FONTSIZE_BUTTON * 1.2),
        letterSpacing: 0.15,
        color: colors.PRIMARY_TEXT,
        marginEnd: scaleWithMax(3, 4),
        includeFontPadding: false,
      },
      userNameSuffix: {
        marginStart: scaleWithMax(3, 4),
        fontFamily: fonts.semibold,
        fontSize: sizes.FONTSIZE_BUTTON,
        lineHeight: Math.round(sizes.FONTSIZE_BUTTON * 1.2),
        letterSpacing: 0.15,
        color: colors.PRIMARY_TEXT,
        includeFontPadding: false,
      },
      nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        minWidth: 0,
      },
      verifiedIconWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: Platform.OS === 'ios' ? -scaleWithMax(1, 1) : 0,
      },
      addButton: {
        borderRadius: sizes.BORDER_RADIUS,
        paddingHorizontal: theme.sizes.WIDTH * 0.022,
        paddingVertical: theme.sizes.HEIGHT * 0.006,
        backgroundColor: colors.SECONDARY,
        // minWidth: scaleWithMax(68, 68),
        alignItems: 'center',
        justifyContent: 'center',
      },
      addButtonText: {
        fontFamily: fonts.medium,
        fontSize: sizes.FONTSIZE,
        color: colors.PRIMARY,
      },
      addedButton: {
        backgroundColor: colors.SECONDARY,
      },
      addedButtonText: {},
      avatar: {
        width: scaleWithMax(36, 36),
        height: scaleWithMax(36, 36),
        borderRadius: scaleWithMax(36, 36) / 2,
      },
      selectionCircle: {
        width: scaleWithMax(20, 20),
        height: scaleWithMax(20, 20),
        borderRadius: scaleWithMax(20, 20) / 2,
        borderWidth: scaleWithMax(2, 2),
        borderColor: colors.SECONDARY_GRAY,
        backgroundColor: 'transparent',
        position: 'relative',
      },
      selectedCircle: {
        backgroundColor: colors.PRIMARY,
        borderColor: colors.PRIMARY,
      },
      disabledCircle: {
        opacity: 0.4,
      },
      iconWrapper: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        alignItems: 'center',
        justifyContent: 'center',
      },
      buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scaleWithMax(2, 2),
        justifyContent: 'center',
      },
      separator: {
        height: 1,
        backgroundColor: colors.DIVIDER_COLOR,
        marginVertical: 0,
        marginHorizontal: theme.sizes.PADDING,
      },
    });
  }, [theme]);

  return { theme, styles };
};

export default SearchUserItem;
