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
    height: height * 0.06,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: type === 'primary' ? colors.PRIMARY : 'transparent',
    borderWidth: type === 'primary' ? 0 : 1,
    borderColor: type === 'primary' ? 'transparent' : colors.PRIMARY,
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[buttonStyle, baseStyle]}
      activeOpacity={0.7}
      disabled={disabled}
    >
      <Text
        style={[
          labelStyle,
          theme.globalStyles.TEXT_STYLE,
          {
            color:
              type === 'primary' ? theme.colors.WHITE : theme.colors.PRIMARY,
            fontSize: theme.sizes.FONTSIZE_BUTTON,
          },
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default CustomButton;
