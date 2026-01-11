import {
  View,
  Text,
  ViewStyle,
  StyleProp,
  Modal,
  TouchableWithoutFeedback,
  Dimensions,
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

interface AppBottomSheetProps {
  children: React.ReactNode;
  isOpen: boolean;
  height?: number;
  onClose: () => void;
  enablePanDownToClose?: boolean;
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

const AppBottomSheet = ({
  children,
  height,
  isOpen,
  onClose,
  enablePanDownToClose = true,
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
}: AppBottomSheetProps) => {
  const theme = useTheme();
  const bottomSheetRef = useRef<BottomSheet>(null);

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

  const handleSheetChanges = (index: number) => {
    if (index === -1) {
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen && bottomSheetRef.current) {
      bottomSheetRef.current.snapToIndex(initialSnapIndex);
    }
  }, [isOpen, initialSnapIndex]);

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <BottomSheet
          ref={bottomSheetRef}
          index={isOpen ? initialSnapIndex : -1}
          snapPoints={calculatedSnapPoints()}
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
                    onPress={onClose}
                  >
                    <BlurView
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
        >
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
        </BottomSheet>
      </GestureHandlerRootView>
    </Modal>
  );
};

export default AppBottomSheet;
