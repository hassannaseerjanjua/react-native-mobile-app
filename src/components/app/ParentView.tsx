import { StatusBar, View, ViewStyle } from 'react-native';
import React from 'react';
import { Edge, SafeAreaView } from 'react-native-safe-area-context';
import useTheme from '../../styles/theme';
import PlaceholderLogoText from '../global/PlaceholderLogoText';

interface ParentViewProps {
  children: React.ReactNode | React.ReactNode[];
  style?: ViewStyle;
  edges?: Edge[];
  /** When provided, shows a centered empty state with logo above the content */
  emptyStateText?: string;
}

const ParentView = ({ children, style, edges, emptyStateText }: ParentViewProps) => {
  const theme = useTheme();
  return (
    <SafeAreaView
      style={[{ flex: 1, backgroundColor: theme.colors.BACKGROUND }, style]}
      edges={edges || ['top', 'left', 'right']}
    >
      <StatusBar
        backgroundColor={theme.colors.BACKGROUND}
        barStyle="dark-content"
      />

      {children}

      {emptyStateText != null && emptyStateText !== '' && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
            pointerEvents: 'none',
          }}
        >
          <PlaceholderLogoText text={emptyStateText} />
        </View>
      )}
    </SafeAreaView>
  );
};

export default ParentView;
