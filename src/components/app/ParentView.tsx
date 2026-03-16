import { StatusBar, View, ViewStyle } from 'react-native';
import React from 'react';
import { Edge, SafeAreaView } from 'react-native-safe-area-context';
import useTheme from '../../styles/theme';
import PlaceholderLogoText from '../global/PlaceholderLogoText';
import { useStableSafeAreaInsets } from '../../hooks/useStableSafeAreaInsets';

interface ParentViewProps {
  children: React.ReactNode | React.ReactNode[];
  style?: ViewStyle;
  edges?: Edge[];
  /** Prevents header jerk on cache load; uses stable insets instead of SafeAreaView */
  stableLayout?: boolean;
  /** When provided, shows a centered empty state with logo above the content */
  emptyStateText?: string;
}

const ParentView = ({
  children,
  style,
  edges = ['top', 'left', 'right'],
  stableLayout = true,
  emptyStateText,
}: ParentViewProps) => {
  const theme = useTheme();
  const insets = useStableSafeAreaInsets();

  const containerStyle: ViewStyle[] = [
    { flex: 1, backgroundColor: theme.colors.BACKGROUND },
    ...(style ? [style] : []),
  ];
  if (stableLayout) {
    containerStyle.push({
      paddingTop: insets.top,
      ...(edges.includes('left') && { paddingLeft: insets.left }),
      ...(edges.includes('right') && { paddingRight: insets.right }),
    });
  }

  const content = (
    <>
      <StatusBar
        backgroundColor={theme.colors.BACKGROUND}
        barStyle="dark-content"
      />
      {children}
      {emptyStateText != null && emptyStateText !== '' && (
        <View
          style={{
            position: 'absolute',
            top: theme.sizes.HEIGHT * 0.02,
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
    </>
  );

  if (stableLayout) {
    return <View style={containerStyle}>{content}</View>;
  }
  return (
    <SafeAreaView style={containerStyle} edges={edges}>
      {content}
    </SafeAreaView>
  );
};

export default ParentView;
