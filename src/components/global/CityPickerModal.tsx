import React, { useRef, useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import AppBottomSheet from './AppBottomSheet';
import useTheme from '../../styles/theme';
import { scaleWithMax } from '../../utils';
import fonts from '../../assets/fonts';

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
  const flatListRef = useRef<FlatList>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Find initial index when modal opens
  useEffect(() => {
    if (options.length > 0 && visible) {
      const index = options.findIndex(opt => opt.value === selectedValue);
      const targetIndex = index !== -1 ? index : 0;
      setSelectedIndex(targetIndex);
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({
          offset: targetIndex * ITEM_HEIGHT,
          animated: false,
        });
      }, 200);
    }
  }, [options, selectedValue, visible]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(index, options.length - 1));
    
    if (clampedIndex !== selectedIndex) {
      setSelectedIndex(clampedIndex);
    }
  };

  const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(index, options.length - 1));
    
    if (clampedIndex !== selectedIndex) {
      setSelectedIndex(clampedIndex);
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

  const renderItem = ({ item, index }: { item: CityPickerOption; index: number }) => {
    const isSelected = index === selectedIndex;

    return (
      <View
        style={[
          styles.itemContainer,
          isSelected && styles.selectedItem,
        ]}
      >
        <Text
          style={[
            styles.itemText,
            isSelected && styles.selectedItemText,
          ]}
        >
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

  return (
    <AppBottomSheet
      isOpen={visible}
      onClose={onClose}
      height={CONTAINER_HEIGHT + scaleWithMax(100, 120)}
      enablePanDownToClose={true}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.button}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          {title && (
            <Text style={styles.title}>{title}</Text>
          )}
          <TouchableOpacity onPress={handleConfirm} style={styles.button}>
            <Text style={styles.doneText}>Done</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.pickerContainer}>
          {/* Gradient overlays for iOS picker fade effect */}
          <LinearGradient
            colors={[theme.colors.BACKGROUND || '#FFFFFF', (theme.colors.BACKGROUND || '#FFFFFF') + '00']}
            style={styles.topGradient}
            pointerEvents="none"
          />
          <LinearGradient
            colors={[(theme.colors.BACKGROUND || '#FFFFFF') + '00', theme.colors.BACKGROUND || '#FFFFFF']}
            style={styles.bottomGradient}
            pointerEvents="none"
          />
          
          {/* Selection indicator */}
          <View style={styles.selectionIndicator} />

          <FlatList
            ref={flatListRef}
            data={options}
            renderItem={renderItem}
            keyExtractor={(item, index) => `${item.value}-${index}`}
            getItemLayout={getItemLayout}
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
          />
        </View>
      </View>
    </AppBottomSheet>
  );
};

const useStyles = () => {
  const theme = useTheme();

  const styles = useMemo(() => {
    const { colors, sizes } = theme;

    return StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: colors.BACKGROUND || '#FFFFFF',
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
        fontFamily: fonts.Quicksand.medium,
        fontSize: sizes.FONTSIZE,
        color: colors.PRIMARY || '#007AFF',
      },
      title: {
        fontFamily: fonts.Quicksand.semibold,
        fontSize: sizes.FONTSIZE_MED_HIGH,
        color: colors.PRIMARY_TEXT,
      },
      doneText: {
        fontFamily: fonts.Quicksand.semibold,
        fontSize: sizes.FONTSIZE,
        color: colors.PRIMARY || '#007AFF',
      },
      pickerContainer: {
        height: CONTAINER_HEIGHT,
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: colors.BACKGROUND || '#FFFFFF',
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
        zIndex: 1,
        pointerEvents: 'none',
        borderTopWidth: StyleSheet.hairlineWidth,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: Platform.OS === 'ios' 
          ? 'rgba(0, 0, 0, 0.1)' 
          : colors.SECONDARY_GRAY + '60',
        borderRadius: scaleWithMax(4, 6),
        backgroundColor: Platform.OS === 'ios' 
          ? 'rgba(0, 122, 255, 0.05)' 
          : 'transparent',
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
        // Selected item styling
      },
      itemText: {
        fontFamily: fonts.Quicksand.regular,
        fontSize: sizes.FONTSIZE,
        color: Platform.OS === 'ios' 
          ? colors.SECONDARY_TEXT || '#C7C7CC' 
          : colors.SECONDARY_TEXT || '#999999',
      },
      selectedItemText: {
        fontFamily: fonts.Quicksand.semibold,
        fontSize: sizes.FONTSIZE_MED_HIGH,
        color: Platform.OS === 'ios' 
          ? colors.PRIMARY_TEXT || '#000000' 
          : colors.PRIMARY_TEXT || '#000000',
      },
    });
  }, [theme]);

  return { styles, theme };
};

export default CityPickerModal;

