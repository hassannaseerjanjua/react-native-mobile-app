import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { SvgSearchAdd } from '../../assets/icons';
import { ActiveUser } from '../../types';
import { useLocaleStore } from '../../store/reducer/locale';
import useTheme from '../../styles/theme';
import fonts from '../../assets/fonts';

interface SearchUserItemProps {
  item: ActiveUser;
  index: number;
  isLast: boolean;
  updatedUsers?: Record<number, number>;
  loadingUsers?: Record<number, boolean>;
  handleAddUser?: (userId: number) => void;
  showAddButton?: boolean;
}

const SearchUserItem: React.FC<SearchUserItemProps> = ({
  item,
  index,
  isLast,
  updatedUsers = {},
  loadingUsers = {},
  handleAddUser,
  showAddButton = true,
}) => {
  const { styles, theme } = useStyles();
  const { getString } = useLocaleStore();
  const currentStatus = updatedUsers[item.UserId] ?? item.RelationStatus;
  const isAdded = currentStatus === 1;
  const isLoading = loadingUsers[item.UserId] || false;

  return (
    <TouchableOpacity
      style={[styles.userRow, !isLast && styles.userRowDivider]}
    >
      <View style={styles.userInfo}>
        <View style={styles.avatarWrapper}>
          <Image
            source={{ uri: item?.ProfileUrl ?? '' }}
            style={styles.avatar}
          />
        </View>
        <Text style={styles.userName}>{item.FullName}</Text>
      </View>

      {showAddButton && (
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.addButton, isAdded && styles.addedButton]}
          onPress={() => handleAddUser?.(item.UserId)}
          disabled={isLoading}
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
              {!isAdded && <SvgSearchAdd width={16} height={16} />}
              <Text
                style={[
                  styles.addButtonText,
                  isAdded && styles.addedButtonText,
                ]}
              >
                {isAdded ? getString('SEARCH_ADDED') : getString('SEARCH_ADD')}
              </Text>
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
    });
  }, [theme]);

  return { theme, styles };
};

export default SearchUserItem;
