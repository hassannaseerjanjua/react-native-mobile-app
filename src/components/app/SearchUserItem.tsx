import React, { useMemo } from 'react';
import {
  View,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { SvgSearchAdd, SvgSelectedCheck } from '../../assets/icons';
import { ActiveUser } from '../../types';
import { useLocaleStore } from '../../store/reducer/locale';
import useTheme from '../../styles/theme';
import fonts from '../../assets/fonts';
import { Text } from '../../utils/elements';
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
}) => {
  const { styles, theme } = useStyles();
  const { getString } = useLocaleStore();
  const currentStatus = updatedUsers[item.UserId] ?? item.RelationStatus;
  const isAdded = currentStatus === 1;
  const isLoading = loadingUsers[item.UserId] || false;
  const dummyImage = require('../../assets/images/user.png');

  const isTempAdded = tempAddedUserIds?.has(item.UserId) || false;
  const shouldShowButton = isGeneralSearchScreen
    ? !isAdded || isTempAdded || isLoading
    : showAddButton;

  return (
    <TouchableOpacity
      style={[styles.userRow, !isLast && styles.userRowDivider]}
      onPress={showSelection ? onSelectionPress : onPress}
      activeOpacity={1}
    >
      <View style={styles.userInfo}>
        <View style={styles.avatarWrapper}>
          <Image
            source={item?.ProfileUrl ? { uri: item.ProfileUrl } : dummyImage}
            style={styles.avatar}
          />
        </View>
        <Text
          style={[
            styles.userName,
            {
              width: shouldShowButton ? '80%' : '85%',
            },
          ]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {item.FullName}
        </Text>
      </View>

      {shouldShowButton && (
        <TouchableOpacity
          activeOpacity={0.8}
          style={[
            styles.addButton,
            (isAdded || isTempAdded) && styles.addedButton,
          ]}
          onPress={() => handleAddUser?.(item.UserId)}
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
                  ,
                ]}
              >
                {isTempAdded
                  ? getString('SEARCH_ADDED')
                  : isAdded
                  ? getString('MF_UNFRIEND')
                  : getString('SEARCH_ADD')}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      )}

      {showSelection && (
        <TouchableOpacity
          style={[styles.selectionCircle, isSelected && styles.selectedCircle]}
          onPress={onSelectionPress}
          activeOpacity={0.7}
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
  );
};

const useStyles = () => {
  const theme = useTheme();

  const styles = useMemo(() => {
    const { colors, sizes } = theme;

    return StyleSheet.create({
      userRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: scaleWithMax(8, 8),
        paddingHorizontal: scaleWithMax(14, 14),
      },
      userRowDivider: {
        borderBottomWidth: 1,
        borderBottomColor: colors.DIVIDER_COLOR,
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
        fontFamily: fonts.Quicksand.medium,
        fontSize: sizes.FONTSIZE_BUTTON,
        letterSpacing: 0.15,
        color: colors.PRIMARY_TEXT,
      },
      addButton: {
        borderRadius: sizes.BORDER_RADIUS,
        paddingHorizontal: theme.sizes.WIDTH * 0.018,
        paddingVertical: theme.sizes.HEIGHT * 0.006,
        backgroundColor: colors.SECONDARY,
        minWidth: scaleWithMax(68, 68),
        alignItems: 'center',
        justifyContent: 'center',
      },
      addButtonText: {
        fontFamily: fonts.Quicksand.medium,
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
    });
  }, [theme]);

  return { theme, styles };
};

export default SearchUserItem;
