import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useMemo } from 'react';
import { useSizes } from '../../styles/sizes';
import useTheme from '../../styles/theme';
import { SvgSelectedCheck } from '../../assets/icons';
import { scaleWithMax } from '../../utils';

const CheckBox = ({
  Selected,
  onSelectionPress,
}: {
  Selected: boolean;
  onSelectionPress?: () => void;
}) => {
  const { styles, sizes } = useStyles();
  return (
    <TouchableOpacity
      style={[styles.selectionCircle, Selected && styles.selectedCircle]}
      onPress={onSelectionPress}
      activeOpacity={0.7}
    >
      {Selected && (
        <View style={styles.iconWrapper}>
          <SvgSelectedCheck
            width={scaleWithMax(9, 10)}
            height={scaleWithMax(9, 10)}
          />
        </View>
      )}
    </TouchableOpacity>
  );
};

export default CheckBox;
const useStyles = () => {
  const sizes = useSizes();
  const { colors } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        selectionCircle: {
          width: 20,
          height: 20,
          borderRadius: 10,
          borderWidth: 2,
          borderColor: colors.SECONDARY_GRAY,
          backgroundColor: 'transparent',
          position: 'relative',
        },
        selectedCircle: {
          backgroundColor: colors.PRIMARY,
          borderColor: colors.PRIMARY,
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
  };
};
