import { ViewStyle } from 'react-native';
import React from 'react';
import { Edge, SafeAreaView } from 'react-native-safe-area-context';
import useTheme from '../../styles/theme';

interface ParentViewProps {
  children: React.ReactNode | React.ReactNode[];
  style?: ViewStyle;
  edges?: Edge[];
}

const ParentView = ({ children, style, edges }: ParentViewProps) => {
  const theme = useTheme();
  return (
    <SafeAreaView
      style={[{ flex: 1, backgroundColor: theme.colors.BACKGROUND }, style]}
      edges={edges}
    >
      {children}
    </SafeAreaView>
  );
};

export default ParentView;
