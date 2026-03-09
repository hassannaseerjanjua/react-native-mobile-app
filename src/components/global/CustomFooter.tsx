import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import React, { useMemo } from 'react';
import { useSizes } from '../../styles/sizes';
import useTheme from '../../styles/theme';
import { scaleWithMax } from '../../utils';
import ShadowView from './ShadowView';

const CustomFooter = ({
  children,
  style,
  disableShadow,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  disableShadow?: boolean;
}) => {
  const { theme } = useStyles();
  const containerStyle = [
    {
      position: 'absolute' as const,
      bottom: scaleWithMax(25, 30),
      left: 0,
      right: 0,
      paddingHorizontal: theme.sizes.PADDING,
    },
    style,
  ];
  const content = <View style={{ width: '100%' }}>{children}</View>;
  if (disableShadow) {
    return <View style={containerStyle}>{content}</View>;
  }
  return (
    <ShadowView preset="default" containerStyle={containerStyle}>
      {content}
    </ShadowView>
  );
};

export default CustomFooter;

const useStyles = () => {
  const sizes = useSizes();
  const { colors } = useTheme();
  const theme = useTheme();
  const styles = useMemo(() => StyleSheet.create({}), [sizes]);

  return {
    styles,
    sizes,
    theme,
  };
};
