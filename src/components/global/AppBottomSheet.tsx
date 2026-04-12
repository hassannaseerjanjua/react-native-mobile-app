import {
  View,
  Text,
  ViewStyle,
  StyleProp,
  Modal,
  TouchableWithoutFeedback,
  Dimensions,
  Platform,
} from 'react-native';
import React, {
  useRef,
  useCallback,
  useMemo,
  useEffect,
  useState,
} from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, {
  BottomSheetView,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import { BlurView } from '@react-native-community/blur';
import useTheme from '../../styles/theme';
import { scaleWithMax } from '../../utils';

export interface AppBottomSheetProps {
  children: React.ReactNode;
  isOpen: boolean;
  height?: number;
  onClose: () => void;
  enablePanDownToClose?: boolean;
  enableHandlePanningGesture?: boolean;
  enableContentPanningGesture?: boolean;
  /**
   * When false, the sheet height follows only `snapPoints` / computed height — not measured
   * child layout. Turn off for scrollable content so the inner scroll view can scroll.
   * @default false
   */
  enableDynamicSizing?: boolean;
  /**
   * When `enableDynamicSizing` is true, limits how tall the sheet can grow.
   * Once this max is reached, the inner scrollable should scroll.
   */
  maxDynamicContentSize?: number;
  /**
   * When false, children are rendered directly inside the sheet (use when the child is
   * `BottomSheetScrollView` / `BottomSheetFlatList`). Avoids an extra `BottomSheetView`
   * that can steal scroll registration from gorhom.
   * @default true
   */
  embedContentInBottomSheetView?: boolean;
  snapPoints?: string[];
  blurType?: 'light' | 'dark' | 'regular';
  hasBackDrop?: boolean;
  blurAmount?: number;
  fullHeight?: boolean;
  pressBehavior?: 'close' | 'none';
  initialSnapIndex?: number;
  keyboardBehavior?: 'interactive' | 'extend' | 'fillParent';
  keyboardBlurBehavior?: 'none' | 'restore';
  android_keyboardInputMode?: 'adjustResize' | 'adjustPan';
}

const AppBottomSheet: React.FC<AppBottomSheetProps> = ({
  children,
  height,
  isOpen,
  onClose,
  enablePanDownToClose = true,
  enableHandlePanningGesture = true,
  enableContentPanningGesture = true,
  enableDynamicSizing = false,
  maxDynamicContentSize,
  embedContentInBottomSheetView = true,
  snapPoints,
  blurType = 'light',
  blurAmount = 10,
  pressBehavior = 'close',
  fullHeight = false,
  hasBackDrop = true,
  initialSnapIndex = 0,
  keyboardBehavior = 'extend',
  keyboardBlurBehavior = 'restore',
  android_keyboardInputMode = 'adjustResize',
}) => {
  const theme = useTheme();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [modalVisible, setModalVisible] = useState(isOpen);
  const [sheetIndex, setSheetIndex] = useState<number>(
    isOpen ? initialSnapIndex : -1,
  );
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const calculatedSnapPoints = () => {
    if (snapPoints) return snapPoints;
    if (height) {
      const { height: screenHeight } = Dimensions.get('window');
      if (fullHeight) {
        const { height: fullScreenHeight } = Dimensions.get('screen');
        const percentage = Math.round((height / fullScreenHeight) * 100);
        return [`${percentage}%`];
      } else {
        const percentage = Math.round((height / screenHeight) * 100);
        return [`${percentage}%`];
      }
    }
    return fullHeight ? ['100%'] : ['50%'];
  };

  const resolvedSnapPoints =
    enableDynamicSizing && !snapPoints && !height
      ? undefined
      : calculatedSnapPoints();

  const handleSheetClosed = () => {
    setModalVisible(false);
    setSheetIndex(-1);
    // Only close parent state if parent still thinks it's open.
    if (isOpen) onClose();
  };

  const handleSheetChanges = (index: number) => {
    // Keep local index in sync (helps when closing during opening).
    setSheetIndex(index);
  };

  const requestClose = () => {
    setSheetIndex(-1);
    // Force-close prevents gesture/scroll interruptions (common when user scrolled content).
    bottomSheetRef.current?.forceClose();
    // Unmount Modal immediately so it won't block touches.
    setModalVisible(false);
    if (isOpen) onClose();

    // Fallback: if sheet callbacks don't fire for any reason, ensure cleanup.
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    closeTimeoutRef.current = setTimeout(() => {
      setModalVisible(false);
      closeTimeoutRef.current = null;
    }, 100);
  };

  useEffect(() => {
    if (isOpen) {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }
      setModalVisible(true);
      setSheetIndex(initialSnapIndex);
    } else {
      setSheetIndex(-1);
      setModalVisible(false);
    }
  }, [isOpen, initialSnapIndex]);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }
    };
  }, []);

  return (
    <Modal
      visible={modalVisible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={requestClose}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <BottomSheet
          ref={bottomSheetRef}
          index={sheetIndex}
          snapPoints={resolvedSnapPoints}
          enableDynamicSizing={enableDynamicSizing}
          maxDynamicContentSize={maxDynamicContentSize}
          keyboardBehavior={keyboardBehavior}
          keyboardBlurBehavior={keyboardBlurBehavior}
          android_keyboardInputMode={android_keyboardInputMode}
          backdropComponent={
            hasBackDrop
              ? props => (
                  <BottomSheetBackdrop
                    {...props}
                    appearsOnIndex={0}
                    disappearsOnIndex={-1}
                    opacity={0.5}
                    pressBehavior={pressBehavior}
                    onPress={requestClose}
                  >
                    <BlurView
                      pointerEvents="none"
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                      }}
                      blurType={blurType}
                      blurAmount={blurAmount}
                      reducedTransparencyFallbackColor="rgba(0, 0, 0, 0.3)"
                    />
                  </BottomSheetBackdrop>
                )
              : undefined
          }
          enablePanDownToClose={enablePanDownToClose}
          enableOverDrag={false}
          enableHandlePanningGesture={enableHandlePanningGesture}
          enableContentPanningGesture={enableContentPanningGesture}
          handleStyle={{
            borderTopLeftRadius: scaleWithMax(24, 30),
            borderTopRightRadius: scaleWithMax(24, 30),
            backgroundColor: theme.colors?.BACKGROUND || '#FFFFFF',
          }}
          handleIndicatorStyle={
            fullHeight
              ? {
                  backgroundColor: 'transparent',
                  width: 0,
                  height: 0,
                }
              : {
                  backgroundColor: theme.colors?.SECONDARY_GRAY,
                  width: scaleWithMax(30, 35),
                  height: scaleWithMax(4, 6),
                }
          }
          backgroundStyle={{
            backgroundColor: theme.colors?.BACKGROUND || '#FFFFFF',
          }}
          onChange={handleSheetChanges}
          onClose={handleSheetClosed}
        >
          {embedContentInBottomSheetView ? (
            <BottomSheetView
              style={
                snapPoints
                  ? { flex: 1 }
                  : { height: height, flex: height ? 0 : 1 }
              }
            >
              <View
                style={{
                  flex: 1,
                }}
              >
                {children}
              </View>
            </BottomSheetView>
          ) : (
            children
          )}
        </BottomSheet>
      </GestureHandlerRootView>
    </Modal>
  );
};

export default AppBottomSheet;
