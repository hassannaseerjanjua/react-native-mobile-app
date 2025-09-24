import {
  View,
  Text,
  ViewStyle,
  StyleProp,
  Modal,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import React, { useRef, useCallback, useMemo } from 'react';
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
  blurAmount?: number;
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
}: AppBottomSheetProps) => {
  const theme = useTheme();
  const bottomSheetRef = useRef<BottomSheet>(null);

  // Calculate snap points based on height or use provided snap points
  const calculatedSnapPoints = useMemo(() => {
    if (snapPoints) return snapPoints;
    if (height) {
      const { height: screenHeight } = Dimensions.get('window');
      const percentage = Math.round((height / screenHeight) * 100);
      return [`${percentage}%`];
    }
    return ['50%'];
  }, [height, snapPoints]);

  // Custom backdrop component with blur effect
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.5}
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
    ),
    [blurType, blurAmount],
  );

  // Handle sheet changes
  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose();
      }
    },
    [onClose],
  );

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
          index={isOpen ? 0 : -1}
          snapPoints={calculatedSnapPoints}
          backdropComponent={renderBackdrop}
          enablePanDownToClose={enablePanDownToClose}
          handleStyle={{
            borderTopLeftRadius: scaleWithMax(24, 30),
            borderTopRightRadius: scaleWithMax(24, 30),
            backgroundColor: theme.colors?.BACKGROUND || '#FFFFFF',
          }}
          handleIndicatorStyle={{
            backgroundColor: theme.colors?.SECONDARY_GRAY,
            width: scaleWithMax(30, 35),
            height: scaleWithMax(4, 6),
          }}
          backgroundStyle={{
            backgroundColor: theme.colors?.BACKGROUND || '#FFFFFF',
          }}
          onChange={handleSheetChanges}
        >
          <BottomSheetView style={{ height: height, flex: height ? 0 : 1 }}>
            <View style={{ flex: 1, padding: scaleWithMax(16, 20) }}>
              {children}
            </View>
          </BottomSheetView>
        </BottomSheet>
      </GestureHandlerRootView>
    </Modal>
  );
};

export default AppBottomSheet;
