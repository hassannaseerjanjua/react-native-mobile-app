import React, { useRef, useEffect, useState, useMemo } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Modal,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import useTheme from '../../styles/theme';
import { scaleWithMax } from '../../utils';
import { useLocaleStore } from '../../store/reducer/locale';
import { Text } from '../../utils/elements';

interface CityPickerOption {
  label: string;
  value: number | string | null;
}

interface CityPickerModalProps {
  visible: boolean;
  onClose: () => void;
  options: CityPickerOption[];
  selectedValue?: number | string | null;
  onSelect: (value: number | string | null) => void;
  title?: string;
}

const ITEM_HEIGHT = scaleWithMax(44, 50);
const VISIBLE_ITEMS = 5;
const CONTAINER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;
const MIDDLE_INDEX = Math.floor(VISIBLE_ITEMS / 2);

const CityPickerModal: React.FC<CityPickerModalProps> = ({
  visible,
  onClose,
  options,
  selectedValue,
  onSelect,
  title,
}) => {
  const theme = useTheme();
  const { getString } = useLocaleStore();
  const flatListRef = useRef<FlatList>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const screenHeight = Dimensions.get('window').height;
  const modalHeight = CONTAINER_HEIGHT + scaleWithMax(100, 120);

  // Animate modal open/close
  useEffect(() => {
    if (visible) {
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
  }, [visible, slideAnim, backdropOpacity]);

  // Compute initial index so list opens with correct item centered (no snap)
  const initialScrollIndex = useMemo(() => {
    if (options.length === 0) return 0;
    const index = options.findIndex(
      opt => Number(opt.value) === Number(selectedValue),
    );
    return index !== -1 ? index : 0;
  }, [options, selectedValue]);

  const initialScrollOffset = initialScrollIndex * ITEM_HEIGHT;

  // Sync selectedIndex when modal opens
  useEffect(() => {
    if (visible && options.length > 0) {
      setSelectedIndex(initialScrollIndex);
    }
  }, [visible, options.length, initialScrollIndex]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = event.nativeEvent.contentOffset.y;
    // The center position in the content is: y + ITEM_HEIGHT * MIDDLE_INDEX
    // Item i starts at: ITEM_HEIGHT * MIDDLE_INDEX + i * ITEM_HEIGHT in the content
    // For item i to be centered: y + ITEM_HEIGHT * MIDDLE_INDEX = ITEM_HEIGHT * MIDDLE_INDEX + i * ITEM_HEIGHT
    // Simplifying: y = i * ITEM_HEIGHT
    // So: i = y / ITEM_HEIGHT
    // When y = 0, item 0 is centered (due to padding)
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
    // Same calculation as handleScroll
    const index = y === 0 ? 0 : Math.round(y / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(index, options.length - 1));

    if (clampedIndex !== selectedIndex) {
      setSelectedIndex(clampedIndex);
    }

    // On Android, ensure we snap to the exact position to prevent drift
    if (Platform.OS === 'android') {
      const expectedOffset =
        clampedIndex === 0 ? 0 : clampedIndex * ITEM_HEIGHT;
      // Only correct if we're significantly off (more than 5% of item height)
      if (Math.abs(y - expectedOffset) > ITEM_HEIGHT * 0.05) {
        flatListRef.current?.scrollToOffset({
          offset: expectedOffset,
          animated: true,
        });
      }
    }
  };

  const handleConfirm = () => {
    const selectedOption = options[selectedIndex];
    if (selectedOption) {
      onSelect(selectedOption.value);
    }
    onClose();
  };

  const { styles } = useStyles();

  const renderItem = ({
    item,
    index,
  }: {
    item: CityPickerOption;
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

  const getItemLayout = (_: any, index: number) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  });

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [modalHeight, 0],
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        {/* Backdrop */}
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View
            style={[
              styles.backdrop,
              {
                opacity: backdropOpacity,
              },
            ]}
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
          <View style={styles.container}>
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose} style={styles.button}>
                <Text style={styles.cancelText}>
                  {getString('COMP_CANCEL')}
                </Text>
              </TouchableOpacity>
              {title && <Text style={styles.title}>{title}</Text>}
              <TouchableOpacity onPress={handleConfirm} style={styles.button}>
                <Text style={styles.doneText}>{getString('COMP_DONE')}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.pickerContainer}>
              {/* Gradient overlays for iOS picker fade effect */}
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

              {/* Selection indicator */}
              <View style={styles.selectionIndicator} />

              {visible && (
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
  );
};

const useStyles = () => {
  const theme = useTheme();

  const styles = useMemo(() => {
    const { colors, sizes, fonts } = theme;

    return StyleSheet.create({
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
      container: {
        flex: 1,
        backgroundColor: colors.BACKGROUND,
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
    });
  }, [theme]);

  return { styles, theme };
};

export default CityPickerModal;
