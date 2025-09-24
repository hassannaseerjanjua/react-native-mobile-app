import React from 'react';
import {
  Text,
  TouchableOpacity,
  useWindowDimensions,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useColors } from '../../styles/colors';
import useTheme from '../../styles/theme';
import { verticalScale } from 'react-native-size-matters';
import { scaleWithMax } from '../../utils';

interface CustomButtonProps {
  title?: string;
  onPress?: () => void;
  type?: 'primary' | 'secondary';
  labelStyle?: StyleProp<TextStyle>;
  buttonStyle?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

const CustomButton = ({
  title = 'Button',
  onPress = () => {},
  type = 'primary',
  buttonStyle,
  disabled = false,
  labelStyle,
}: CustomButtonProps) => {
  const theme = useTheme();
  const { height, width } = useWindowDimensions();
  const colors = theme.colors;

  const baseStyle: ViewStyle = {
    width: '100%',
    // height: height * 0.06,
    height: scaleWithMax(45, 50),
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: type === 'primary' ? colors.PRIMARY : 'transparent',
    borderWidth: 1,
    borderColor: colors.PRIMARY,
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[baseStyle, buttonStyle]}
      activeOpacity={0.6}
      disabled={disabled}
    >
      <Text
        style={[
          theme.globalStyles.TEXT_STYLE_SEMIBOLD,
          {
            color:
              type === 'primary' ? theme.colors.WHITE : theme.colors.PRIMARY,
            fontSize: theme.sizes.FONTSIZE_BUTTON,
          },
          labelStyle,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default CustomButton;
