import React from 'react';
import {
  Text,
  TouchableOpacity,
  useWindowDimensions,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { useColors } from '../../styles/colors';
import useTheme from '../../styles/theme';
import { verticalScale } from 'react-native-size-matters';
import { scaleWithMax } from '../../utils';

interface CustomButtonProps {
  title?: string;
  onPress?: () => void;
  type?: 'primary' | 'secondary' | 'error';
  labelStyle?: StyleProp<TextStyle>;
  buttonStyle?: StyleProp<ViewStyle>;
  disabled?: boolean;
  isError?: boolean;
  loading?: boolean;
  loadingText?: string;
}

const CustomButton = ({
  title = 'Button',
  onPress = () => {},
  type = 'primary',
  buttonStyle,
  disabled = false,
  labelStyle,
  isError = false,
  loading = false,
  loadingText,
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
    backgroundColor:
      type === 'primary'
        ? colors.PRIMARY
        : type === 'error'
        ? 'rgba(255, 0, 0, 0.1)'
        : 'transparent',
    borderWidth: 1,
    borderColor:
      type === 'primary'
        ? colors.PRIMARY
        : type === 'error'
        ? 'transparent'
        : colors.PRIMARY,
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[baseStyle, buttonStyle]}
      activeOpacity={0.6}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={
            type === 'primary'
              ? theme.colors.WHITE
              : type === 'error'
              ? theme.colors.RED
              : theme.colors.PRIMARY
          }
        />
      ) : (
        <Text
          style={[
            type === 'error'
              ? theme.globalStyles.TEXT_STYLE
              : theme.globalStyles.TEXT_STYLE_SEMIBOLD,
            {
              color:
                type === 'primary'
                  ? theme.colors.WHITE
                  : type === 'error'
                  ? theme.colors.RED
                  : theme.colors.PRIMARY,
              fontSize: theme.sizes.FONTSIZE_BUTTON,
            },
            labelStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default CustomButton;
