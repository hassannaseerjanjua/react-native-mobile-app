import { StyleSheet, View } from 'react-native';
import React, { useMemo } from 'react';
import { useSizes } from '../../styles/sizes';
import useTheme from '../../styles/theme';

const CustomFooter = ({ children }: { children: React.ReactNode }) => {
  const { styles, theme } = useStyles();
  return (
    <View
      style={{
        position: 'absolute',
        bottom: 25,
        left: 0,
        right: 0,
        paddingHorizontal: theme.sizes.PADDING,
        ...theme.globalStyles.SHADOW_STYLE,
      }}
    >
      {children}
    </View>
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
