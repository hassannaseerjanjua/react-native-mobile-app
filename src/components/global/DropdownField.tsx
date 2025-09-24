import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  FlatList,
  TouchableWithoutFeedback,
} from 'react-native';
import React, { useMemo, useState } from 'react';
import useTheme from '../../styles/theme';
import { scaleWithMax } from '../../utils';

export type DropdownOption = {
  label: any;
  value: any;
};

type Props = {
  error?: boolean;
  icon?: any;
  style?: any;
  placeholder?: string;
  options: DropdownOption[];
  selectedValue?: string | number;
  onSelect: (option: DropdownOption) => void;
  disabled?: boolean;
  label?: string;
};

const DropdownField = ({
  icon = null,
  error,
  style,
  placeholder = 'Select an option',
  options,
  selectedValue,
  onSelect,
  disabled = false,
  label = 'Select Option',
}: Props) => {
  const { theme, styles } = useStyles();
  const [isVisible, setIsVisible] = useState(false);

  const selectedOption = options.find(option => option.value === selectedValue);

  const handleSelect = (option: DropdownOption) => {
    onSelect(option);
    setIsVisible(false);
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
            borderWidth: error ? 1 : 0.5,
            borderColor: error ? theme.colors.RED : theme.colors.LIGHT_GRAY,
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
            style={[
              styles.displayText,
              {
                paddingLeft: icon ? theme.sizes.PADDING : 0,
                color: selectedOption
                  ? theme.colors.PRIMARY_TEXT
                  : theme.colors.SECONDARY_TEXT,
              },
            ]}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </Text>
        </View>
        <Text style={styles.chevron}>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{label}</Text>
                  <TouchableOpacity onPress={() => setIsVisible(false)}>
                    <Text style={styles.closeButton}>✕</Text>
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={options}
                  renderItem={renderOption}
                  keyExtractor={(item, index) => `${item.value}-${index}`}
                  style={styles.optionsList}
                  showsVerticalScrollIndicator={false}
                  ItemSeparatorComponent={() => (
                    <View style={styles.separator} />
                  )}
                />
              </View>
            </TouchableWithoutFeedback>
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
        backgroundColor: colors.LIGHT_GRAY,
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
        elevation: 5,
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
    });
  }, [theme]);

  return {
    styles,
    theme,
  };
};
