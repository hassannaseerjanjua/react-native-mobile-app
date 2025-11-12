import { StyleProp, StyleSheet, TextStyle, View } from 'react-native';
import React, { useMemo } from 'react';
import { SvgRiyalIcon } from '../../assets/icons';
import { useSizes } from '../../styles/sizes';
import useTheme from '../../styles/theme';
import { scaleWithMax } from '../../utils';
import { Text } from '../../utils/elements';

const PriceWithIcon = ({
  Price,
  style,
  Icon = (
    <SvgRiyalIcon width={scaleWithMax(12, 14)} height={scaleWithMax(12, 14)} />
  ),
}: {
  Price: number;
  style?: StyleProp<any>;
  Icon?: React.ReactNode;
}) => {
  const { styles, theme } = useStyles();
  return (
    <View>
      <View style={styles.row}>
        {Icon}
        <Text
          style={{
            ...theme.globalStyles.TEXT_STYLE_BOLD,
            fontSize: theme.sizes.FONTSIZE_BUTTON,
            ...style,
          }}
        >
          {Price}
        </Text>
      </View>
    </View>
  );
};

export default PriceWithIcon;

const useStyles = () => {
  const sizes = useSizes();
  const theme = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        selectionCircle: {
          width: 20,
          height: 20,
          borderRadius: 10,
          borderWidth: 2,
          borderColor: theme.colors.SECONDARY_GRAY,
          backgroundColor: 'transparent',
          position: 'relative',
        },
        selectedCircle: {
          backgroundColor: theme.colors.PRIMARY,
          borderColor: theme.colors.PRIMARY,
        },
        row: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: sizes.WIDTH * 0.013,
        },
        iconWrapper: {
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          alignItems: 'center',
          justifyContent: 'center',
        },
      }),
    [sizes],
  );

  return {
    styles,
    sizes,
    theme,
  };
};
