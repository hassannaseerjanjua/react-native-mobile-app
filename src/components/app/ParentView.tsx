import { View, Text, ViewStyle } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import useTheme from '../../styles/theme';

interface ParentViewProps {
  children: React.ReactNode | React.ReactNode[];
  style?: ViewStyle;
}

const ParentView = ({ children, style }: ParentViewProps) => {
  const theme = useTheme();
  return (
    <View
      style={{ flex: 1, backgroundColor: theme.colors.BACKGROUND, ...style }}
    >
      <SafeAreaView style={{ flex: 1 }}>{children}</SafeAreaView>
    </View>
  );
};

export default ParentView;
