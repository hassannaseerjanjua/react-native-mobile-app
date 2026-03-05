import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import React, { useMemo } from 'react';
import { useSizes } from '../../styles/sizes';
import useTheme from '../../styles/theme';
import { scaleWithMax } from '../../utils';
import ShadowView from './ShadowView';

const CustomFooter = ({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) => {
  const { styles, theme } = useStyles();
  return (
    <ShadowView
      preset="default"
      containerStyle={[
        {
          position: 'absolute',
          bottom: scaleWithMax(25, 30),
          left: 0,
          right: 0,
          paddingHorizontal: theme.sizes.PADDING,
        },
        style,
      ]}
    >
      <View style={{ width: '100%' }}>{children}</View>
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
