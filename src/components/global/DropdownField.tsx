import {
  StyleSheet,
  TouchableOpacity,
  View,
  Modal,
  FlatList,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Platform,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Dimensions,
  Animated,
} from 'react-native';

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import useTheme from '../../styles/theme';
import { scaleWithMax } from '../../utils';
import InputField from './InputField';
import { Text } from '../../utils/elements';
import LinearGradient from 'react-native-linear-gradient';
import ShadowView from './ShadowView';

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
  renderDisplay?: ReactNode;
  inline?: boolean;
};

const ITEM_HEIGHT = scaleWithMax(44, 50);
const VISIBLE_ITEMS = 5;
const CONTAINER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;
const MIDDLE_INDEX = Math.floor(VISIBLE_ITEMS / 2);

const DropdownField = ({
  icon = null,
  error,
  style,
  placeholder = 'Select City',
  options,
  selectedValue,
  onSelect,
  disabled = false,
  label,
  searchValue = '',
  onSearchChange,
  isLoading = false,
  selectedOption,
  renderDisplay,
  inline = false,
}: Props) => {
  const { theme, styles } = useStyles();
  const [isVisible, setIsVisible] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const modalHeight = CONTAINER_HEIGHT + scaleWithMax(100, 120);

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

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible, slideAnim, backdropOpacity]);

  const initialScrollIndex = useMemo(() => {
    if (options.length === 0) return 0;
    const index = options.findIndex(
      opt => Number(opt.value) === Number(selectedValue),
    );
    return index !== -1 ? index : 0;
  }, [options, selectedValue]);

  const initialScrollOffset = initialScrollIndex * ITEM_HEIGHT;

  useEffect(() => {
    if (isVisible && options.length > 0) {
      setSelectedIndex(initialScrollIndex);
    }
  }, [isVisible, options.length, initialScrollIndex]);

  const renderItem = ({
    item,
    index,
  }: {
    item: DropdownOption;
    index: number;
  }) => {
    const isSelected = index === selectedIndex;

    return (
      <View style={[styles.itemContainer, isSelected && styles.selectedItem]}>
        <Text style={[styles.itemText, isSelected && styles.selectedItemText]}>
          {item.label}
        </Text>
      </View>
    );
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = y === 0 ? 0 : Math.round(y / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(index, options.length - 1));
    if (clampedIndex !== selectedIndex) {
      setSelectedIndex(clampedIndex);
    }
  };

  const handleMomentumScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = y === 0 ? 0 : Math.round(y / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(index, options.length - 1));

    if (clampedIndex !== selectedIndex) {
      setSelectedIndex(clampedIndex);
    }

    if (Platform.OS === 'android') {
      const expectedOffset =
        clampedIndex === 0 ? 0 : clampedIndex * ITEM_HEIGHT;
      if (Math.abs(y - expectedOffset) > ITEM_HEIGHT * 0.05) {
        flatListRef.current?.scrollToOffset({
          offset: expectedOffset,
          animated: true,
        });
      }
    }
  };

  const handleConfirm = () => {
    const selected = options[selectedIndex];
    if (selected) {
      // FIX 1: pass the full DropdownOption object, not just selected.value
      onSelect(selected);
    }
    setIsVisible(false);
  };

  const getItemLayout = (_: any, index: number) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  });

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [modalHeight, 0],
  });

  const renderContent = () => (
    <View
      style={isLoading ? styles.loadingContainer : styles.optionsListContainer}
    >
      {isLoading ? (
        <ActivityIndicator size="large" color={theme.colors.PRIMARY} />
      ) : (
        <FlatList
          data={options}
          renderItem={renderOption}
          keyExtractor={(item, index) => `${item.value}-${index}`}
          style={styles.optionsList}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchValue ? 'No results found' : 'No options available'}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );

  return (
    <View style={[inline && styles.inlineWrapper, style]}>
      {/* <ShadowView preset="default"> */}
      <TouchableOpacity
        style={[
          styles.container,
          {
            borderWidth: !!error ? 1 : 0.5,
            borderColor: !!error ? theme.colors.RED : theme.colors.LIGHT_GRAY,
            opacity: disabled ? 0.6 : 1,
          },
        ]}
        onPress={() => !disabled && setIsVisible(!isVisible)}
        disabled={disabled}
      >
        {icon}
        <View style={styles.textContainer}>
          {renderDisplay ? (
            <View
              style={[
                styles.customDisplayContainer,
                { paddingLeft: icon ? theme.sizes.PADDING * 0.5 : 0 },
              ]}
            >
              {renderDisplay}
            </View>
          ) : (
            <Text
              style={[
                styles.displayText,
                {
                  paddingLeft: icon ? theme.sizes.PADDING * 0.5 : 0,
                  color: selectedOption
                    ? theme.colors.PRIMARY_TEXT
                    : theme.colors.SECONDARY_TEXT,
                },
              ]}
            >
              {selectedOption ? selectedOption.label : placeholder}
            </Text>
          )}
        </View>
        <View
          style={{
            transform: [{ rotate: isVisible ? '180deg' : '0deg' }],
          }}
        >
          <Text>Dropdown</Text>
        </View>
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
      {/* </ShadowView> */}
      {inline ? (
        isVisible && renderContent()
      ) : (
        <Modal
          visible={isVisible}
          transparent
          animationType="none"
          statusBarTranslucent
          onRequestClose={() => setIsVisible(false)}
        >
          <View style={styles.modalContainer}>
            {/* Backdrop */}
            <TouchableWithoutFeedback onPress={() => setIsVisible(false)}>
              <Animated.View
                style={[styles.backdrop, { opacity: backdropOpacity }]}
              />
            </TouchableWithoutFeedback>

            {/* Bottom Sheet Content */}
            <Animated.View
              style={[
                styles.bottomSheet,
                {
                  height: modalHeight,
                  transform: [{ translateY }],
                },
              ]}
            >
              {/* FIX 3: use modalInnerContainer instead of styles.container */}
              <View style={styles.modalInnerContainer}>
                <View style={styles.header}>
                  <TouchableOpacity
                    onPress={() => setIsVisible(false)}
                    style={styles.button}
                  >
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>
                  {/* FIX 2: use label prop as the title */}
                  {label && <Text style={styles.title}>{label}</Text>}
                  <TouchableOpacity
                    onPress={handleConfirm}
                    style={styles.button}
                  >
                    <Text style={styles.doneText}>Done</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.pickerContainer}>
                  <LinearGradient
                    colors={[
                      theme.colors.BACKGROUND || '#FFFFFF',
                      (theme.colors.BACKGROUND || '#FFFFFF') + '00',
                    ]}
                    style={styles.topGradient}
                    pointerEvents="none"
                  />
                  <LinearGradient
                    colors={[
                      (theme.colors.BACKGROUND || '#FFFFFF') + '00',
                      theme.colors.BACKGROUND || '#FFFFFF',
                    ]}
                    style={styles.bottomGradient}
                    pointerEvents="none"
                  />

                  <View style={styles.selectionIndicator} />

                  {isVisible && (
                    <FlatList
                      ref={flatListRef}
                      key={`picker-${initialScrollIndex}`}
                      data={options}
                      renderItem={renderItem}
                      keyExtractor={(item, index) => `${item.value}-${index}`}
                      getItemLayout={getItemLayout}
                      contentOffset={{ x: 0, y: initialScrollOffset }}
                      onScroll={handleScroll}
                      onMomentumScrollEnd={handleMomentumScrollEnd}
                      scrollEventThrottle={16}
                      showsVerticalScrollIndicator={false}
                      snapToInterval={ITEM_HEIGHT}
                      snapToAlignment="start"
                      decelerationRate="fast"
                      contentContainerStyle={styles.listContent}
                      bounces={true}
                      overScrollMode="never"
                      nestedScrollEnabled={Platform.OS === 'android'}
                    />
                  )}
                </View>
              </View>
            </Animated.View>
          </View>
        </Modal>
      )}
    </View>
  );
};

export default DropdownField;

const useStyles = () => {
  const theme = useTheme();

  const styles = useMemo(() => {
    const { colors, sizes, globalStyles, fonts } = theme;
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
      // FIX 3: dedicated style for the modal's inner wrapper (replaces misused `container`)
      modalInnerContainer: {
        flex: 1,
        backgroundColor: colors.BACKGROUND,
      },
      textContainer: {
        flex: 1,
        height: '100%',
        justifyContent: 'center',
      },
      customDisplayContainer: {
        flex: 1,
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
        shadowOffset: { width: 0, height: 2 },
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
      inlineWrapper: {
        zIndex: 2000,
      },
      optionsListContainer: {
        backgroundColor: colors.WHITE,
        borderRadius: sizes.BORDER_RADIUS,
        marginTop: 4,
        maxHeight: theme.sizes.HEIGHT * 0.3,
        borderWidth: 1,
        borderColor: colors.LIGHT_GRAY,
        overflow: 'hidden',
        zIndex: 2000,
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
      listContent: {
        paddingVertical: ITEM_HEIGHT * MIDDLE_INDEX,
      },
      itemContainer: {
        height: ITEM_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: sizes.PADDING,
      },
      selectedItem: {
        backgroundColor: colors.PRIMARY + '08',
      },
      itemText: {
        fontFamily: fonts.regular,
        fontSize: sizes.FONTSIZE,
        color: colors.SECONDARY_TEXT,
      },
      selectedItemText: {
        fontFamily: fonts.semibold,
        fontSize: sizes.FONTSIZE_MED_HIGH,
        color: colors.PRIMARY_TEXT,
      },
      pickerContainer: {
        height: CONTAINER_HEIGHT,
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: colors.BACKGROUND,
      },
      topGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: ITEM_HEIGHT * MIDDLE_INDEX + ITEM_HEIGHT / 2,
        zIndex: 2,
      },
      bottomGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: ITEM_HEIGHT * MIDDLE_INDEX + ITEM_HEIGHT / 2,
        zIndex: 2,
      },
      selectionIndicator: {
        position: 'absolute',
        top: ITEM_HEIGHT * MIDDLE_INDEX,
        left: sizes.PADDING * 0.5,
        right: sizes.PADDING * 0.5,
        height: ITEM_HEIGHT,
        zIndex: 3,
        pointerEvents: 'none',
        borderTopWidth: StyleSheet.hairlineWidth,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: colors.PRIMARY + '40',
        borderRadius: scaleWithMax(4, 6),
        backgroundColor: colors.PRIMARY + '15',
      },
      modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
      },
      backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      },
      bottomSheet: {
        backgroundColor: colors.BACKGROUND,
        borderTopLeftRadius: scaleWithMax(24, 30),
        borderTopRightRadius: scaleWithMax(24, 30),
        overflow: 'hidden',
      },
      header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: sizes.PADDING,
        paddingVertical: scaleWithMax(12, 16),
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.SECONDARY_GRAY + '40',
      },
      button: {
        paddingVertical: scaleWithMax(8, 10),
        paddingHorizontal: scaleWithMax(12, 16),
      },
      cancelText: {
        fontFamily: fonts.medium,
        fontSize: sizes.FONTSIZE,
        color: colors.PRIMARY,
      },
      title: {
        fontFamily: fonts.semibold,
        fontSize: sizes.FONTSIZE_MED_HIGH,
        color: colors.PRIMARY_TEXT,
      },
      doneText: {
        fontFamily: fonts.semibold,
        fontSize: sizes.FONTSIZE,
        color: colors.PRIMARY,
      },
    });
  }, [theme]);

  return { styles, theme };
};
