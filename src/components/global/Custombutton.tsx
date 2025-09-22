import React from 'react';
import {
  Text,
  TouchableOpacity,
  useWindowDimensions,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { useColors } from '../../styles/colors';
import useTheme from '../../styles/theme';

interface CustomButtonProps {
  title?: string;
  onPress?: () => void;
  type?: 'primary' | 'secondary';
  color?: string;
  textColor?: string;
  height?: number;
  borderRadius?: number;
  marginHorizontal?: number;
  fontSize?: number;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

const CustomButton = ({
  title = 'Button',
  onPress = () => {},
  type = 'primary',
  color,
  textColor,
  height = 50,
  borderRadius = 12,
  marginHorizontal = 20,
  fontSize = 15,
  style,
  disabled = false,
}: CustomButtonProps) => {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const colors = theme.colors;

  const buttonColor = color || colors.PRIMARY;
  const buttonTextColor = textColor || colors.WHITE;

  const baseStyle = {
    width: width - marginHorizontal * 2,
    height,
    borderRadius,
    justifyContent: 'center',
    alignItems: 'center',
  };

  const primaryStyle = {
    backgroundColor: buttonColor,
  };

  const secondaryStyle = {
    borderWidth: 1,
    borderColor: buttonColor,
    backgroundColor: 'transparent',
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        baseStyle as any,
        type === 'primary' ? primaryStyle : secondaryStyle,
        style,
      ]}
      activeOpacity={0.7}
      disabled={disabled}
    >
      <Text
        style={{
          ...theme.globalStyles.TEXT_STYLE,
          fontSize,
          color: type === 'primary' ? buttonTextColor : buttonColor,
        }}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default CustomButton;
