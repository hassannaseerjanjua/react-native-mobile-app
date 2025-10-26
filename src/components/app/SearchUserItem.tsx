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
}) => {
  const { styles, theme } = useStyles();
  const { getString } = useLocaleStore();
  const currentStatus = updatedUsers[item.UserId] ?? item.RelationStatus;
  const isAdded = currentStatus === 1;
  const isLoading = loadingUsers[item.UserId] || false;
  const dummyImage = require('../../assets/images/user.png');

  // On general search screen: hide button for existing friends unless temporarily showing "Added"
  const isTempAdded = tempAddedUserIds?.has(item.UserId) || false;
  const shouldShowButton = isGeneralSearchScreen
    ? !isAdded || isTempAdded || isLoading // Show button if not added, temporarily showing "Added", or loading
    : showAddButton; // For other screens, use the normal showAddButton prop

  return (
    <TouchableOpacity
      style={[styles.userRow, !isLast && styles.userRowDivider]}
      onPress={showSelection ? onSelectionPress : undefined}
      activeOpacity={1}
    >
      <View style={styles.userInfo}>
        <View style={styles.avatarWrapper}>
          <Image
            source={item?.ProfileUrl ? { uri: item.ProfileUrl } : dummyImage}
            style={styles.avatar}
          />
        </View>
        <Text style={styles.userName}>{item.FullName}</Text>
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
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 2,
                justifyContent: 'center',
              }}
            >
              {/* {!isAdded && !isTempAdded && (
                <SvgSearchAdd width={16} height={16} />
              )} */}
              <Text
                style={[
                  styles.addButtonText,
                  (isAdded || isTempAdded) && styles.addedButtonText,
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
              <SvgSelectedCheck width={10} height={10} />
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
    const { colors } = theme;

    return StyleSheet.create({
      userRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 8,
        paddingHorizontal: 14,
      },
      userRowDivider: {
        borderBottomWidth: 1,
        borderBottomColor: '#F1F1F1',
      },

      userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
      },

      avatarWrapper: {
        width: 36,
        height: 36,
        borderRadius: 18,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        backgroundColor: '#FFFFFF',
      },

      userName: {
        fontFamily: fonts.Quicksand.medium,
        fontSize: 15,
        letterSpacing: 0.15,
        color: colors.PRIMARY_TEXT,
      },
      addButton: {
        borderWidth: 1,
        borderColor: '#DDEAFB',
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: colors.SECONDARY,
        minWidth: 68,
        alignItems: 'center',
        justifyContent: 'center',
      },
      addButtonText: {
        fontFamily: fonts.Quicksand.medium,
        fontSize: 14,
        color: colors.PRIMARY,
      },
      addedButton: {
        backgroundColor: '#EAF3FF',
        borderColor: '#EAF3FF',
      },
      addedButtonText: {
        // color: colors.PRIMARY,
        // fontWeight: '600',
      },
      avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
      },
      selectionCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
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
        top: '50%',
        left: '50%',
        transform: [{ translateX: -5 }, { translateY: -5 }],
      },
    });
  }, [theme]);

  return { theme, styles };
};

export default SearchUserItem;
