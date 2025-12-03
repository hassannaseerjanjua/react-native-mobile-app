import React from 'react';
import {
  TouchableOpacity,
  useWindowDimensions,
  StyleProp,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  View,
} from 'react-native';
import useTheme from '../../styles/theme';
import { scaleWithMax } from '../../utils';
import { Text } from '../../utils/elements';

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
  icon?: React.ReactNode;
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
  icon,
}: CustomButtonProps) => {
  const theme = useTheme();
  const { height, width } = useWindowDimensions();
  const colors = theme.colors;

  const baseStyle: ViewStyle = {
    width: '100%',
    height: scaleWithMax(45, 50),
    borderRadius: 10,
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
        <>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View
              style={{
                marginTop: 2,
              }}
            >
              {icon}
            </View>
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
                  marginStart: icon ? 5 : 0,
                },
                labelStyle,
              ]}
            >
              {title}
            </Text>
          </View>
        </>
      )}
    </TouchableOpacity>
  );
};

export default CustomButton;
