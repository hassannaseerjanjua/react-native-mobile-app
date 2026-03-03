import {
  StyleSheet,
  TouchableOpacity,
  View,
  Modal,
  FlatList,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from 'react-native';
import React, { useMemo, useState } from 'react';
import useTheme from '../../styles/theme';
import { scaleWithMax } from '../../utils';
import { SvgDropDown } from '../../assets/icons';
import InputField from './InputField';
import { Text } from '../../utils/elements';
import { useLocaleStore } from '../../store/reducer/locale';

export type DropdownOption = {
  label: any;
  value: any;
};

type Props = {
  error?: string;
  icon?: any;
  style?: any;
  placeholder?: string;
  options: DropdownOption[];
  selectedValue?: string | number;
  onSelect: (option: DropdownOption) => void;
  disabled?: boolean;
  label?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  isLoading?: boolean;
  selectedOption?: DropdownOption | null;
  textAlign?: 'left' | 'right';
};

const DropdownField = ({
  icon = null,
  error,
  style,
  placeholder = '',
  options,
  selectedValue,
  onSelect,
  disabled = false,
  label = '',
  searchValue = '',
  onSearchChange,
  isLoading = false,
  selectedOption,
  textAlign = 'left',
}: Props) => {
  const { theme, styles } = useStyles();
  const { getString } = useLocaleStore();
  const [isVisible, setIsVisible] = useState(false);

  const handleSelect = (option: DropdownOption) => {
    onSelect(option);
    setIsVisible(false);
    onSearchChange?.('');
  };

  const renderOption = ({ item }: { item: DropdownOption }) => (
    <TouchableOpacity
      style={[
        styles.optionItem,
        item.value === selectedValue && styles.selectedOption,
      ]}
      onPress={() => handleSelect(item)}
    >
      <Text
        style={[
          styles.optionText,
          item.value === selectedValue && styles.selectedOptionText,
        ]}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <>
      <TouchableOpacity
        style={[
          styles.container,
          {
            borderWidth: !!error ? 1 : 0.5,
            borderColor: !!error ? theme.colors.RED : theme.colors.LIGHT_GRAY,
            opacity: disabled ? 0.6 : 1,
          },
          style,
        ]}
        onPress={() => !disabled && setIsVisible(true)}
        disabled={disabled}
      >
        {icon}
        <View style={styles.textContainer}>
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={[
              styles.displayText,
              {
                paddingLeft: icon ? theme.sizes.WIDTH * 0.0245 : 0,
                textAlign: textAlign,
                color: selectedOption
                  ? theme.colors.PRIMARY_TEXT
                  : theme.colors.SECONDARY_TEXT,
              },
            ]}
          >
            {selectedOption ? selectedOption.label : placeholder || getString('COMP_SELECT_OPTION')}
          </Text>
        </View>
        <Text style={styles.chevron}>
          <SvgDropDown width={scaleWithMax(20, 25)} />
        </Text>
        {!!error && (
          <Text
            style={[
              styles.error,
              {
                textAlign: 'left',
              },
            ]}
          >
            {error}
          </Text>
        )}
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{label || getString('COMP_SELECT_OPTION_LABEL')}</Text>
                <TouchableOpacity
                  onPress={() => {
                    setIsVisible(false);
                    onSearchChange?.('');
                  }}
                >
                  <Text style={styles.closeButton}>✕</Text>
                </TouchableOpacity>
              </View>

              {onSearchChange && (
                <View style={styles.searchContainer}>
                  <View style={styles.searchInputContainer}>
                    <InputField
                      fieldProps={{
                        placeholder: getString('COMP_SEARCH_PLACEHOLDER'),
                        value: searchValue,
                        onChangeText: onSearchChange,
                        autoCapitalize: 'none',
                        autoCorrect: false,
                      }}
                    />
                    {searchValue.length > 0 && (
                      <TouchableOpacity
                        style={styles.clearButton}
                        onPress={() => onSearchChange('')}
                      >
                        <Text style={styles.clearButtonText}>✕</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )}

              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator
                    size="large"
                    color={theme.colors.PRIMARY}
                  />
                </View>
              ) : (
                <FlatList
                  data={options}
                  renderItem={renderOption}
                  keyExtractor={(item, index) => `${item.value}-${index}`}
                  style={styles.optionsList}
                  showsVerticalScrollIndicator={false}
                  ItemSeparatorComponent={() => (
                    <View style={styles.separator} />
                  )}
                  ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                      <Text style={styles.emptyText}>
                        {searchValue
                          ? getString('EMPTY_NO_RESULTS_FOUND')
                          : getString('EMPTY_NO_OPTIONS_AVAILABLE')}
                      </Text>
                    </View>
                  )}
                />
              )}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};

export default DropdownField;

const useStyles = () => {
  const theme = useTheme();

  const styles = useMemo(() => {
    const { colors, sizes, globalStyles } = theme;
    return StyleSheet.create({
      container: {
        width: '100%',
        height: scaleWithMax(45, 50),
        borderRadius: sizes.BORDER_RADIUS,
        flexDirection: 'row',
        paddingHorizontal: sizes.PADDING,
        alignItems: 'center',
        backgroundColor: colors.WHITE,
        ...globalStyles.SHADOW_STYLE,
      },
      textContainer: {
        flex: 1,
        height: '100%',
        justifyContent: 'center',
      },
      displayText: {
        ...globalStyles.TEXT_STYLE,
        fontSize: 16,
        paddingVertical: 0,
        paddingHorizontal: 0,
      },
      chevron: {
        fontSize: 12,
        color: colors.SECONDARY_TEXT,
        marginLeft: sizes.PADDING / 2,
      },
      modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
      },
      modalContent: {
        backgroundColor: colors.WHITE,
        borderRadius: sizes.BORDER_RADIUS,
        maxHeight: '70%',
        width: '100%',
        elevation: 3,
        shadowColor: colors.BLACK,
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        overflow: 'hidden',
      },
      modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: sizes.PADDING,
        borderBottomWidth: 1,
        borderBottomColor: colors.LIGHT_GRAY,
      },
      modalTitle: {
        ...globalStyles.TEXT_STYLE,
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.PRIMARY_TEXT,
      },
      closeButton: {
        fontSize: 18,
        color: colors.SECONDARY_TEXT,
        fontWeight: 'bold',
      },
      optionsList: {
        maxHeight: theme.sizes.HEIGHT * 0.5,
      },
      optionItem: {
        padding: sizes.PADDING,
        backgroundColor: colors.WHITE,
      },
      selectedOption: {
        backgroundColor: colors.SECONDARY,
      },
      optionText: {
        ...globalStyles.TEXT_STYLE,
        fontSize: 16,
        color: colors.PRIMARY_TEXT,
      },
      selectedOptionText: {
        color: colors.PRIMARY,
        fontWeight: 'bold',
      },
      separator: {
        height: 1,
        backgroundColor: colors.LIGHT_GRAY,
      },
      searchContainer: {
        padding: sizes.PADDING,
        borderBottomWidth: 1,
        borderBottomColor: colors.LIGHT_GRAY,
      },
      searchInputContainer: {
        position: 'relative',
      },
      clearButton: {
        position: 'absolute',
        right: 10,
        top: '50%',
        transform: [{ translateY: -10 }],
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: colors.LIGHT_GRAY,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
      },
      clearButtonText: {
        fontSize: 12,
        color: colors.SECONDARY_TEXT,
        fontWeight: 'bold',
      },
      loadingContainer: {
        padding: sizes.PADDING * 2,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 120,
      },
      loadingText: {
        ...globalStyles.TEXT_STYLE,
        marginTop: sizes.PADDING,
        color: colors.SECONDARY_TEXT,
        fontSize: 14,
      },
      emptyContainer: {
        padding: sizes.PADDING * 2,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 80,
      },
      emptyText: {
        ...globalStyles.TEXT_STYLE,
        color: colors.SECONDARY_TEXT,
        fontSize: 14,
        textAlign: 'center',
      },
      error: {
        color: theme.colors.RED,
        fontSize: 12,
        fontFamily: theme.globalStyles.TEXT_STYLE.fontFamily,
        position: 'absolute',
        top: -8,
        end: 6,
        backgroundColor: theme.colors.LIGHT_GRAY,
        paddingHorizontal: 6,
        paddingVertical: 1,
        borderRadius: 6,
        borderWidth: 0.5,
        borderColor: theme.colors.RED,
      },
    });
  }, [theme]);

  return {
    styles,
    theme,
  };
};
