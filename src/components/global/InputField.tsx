import {
  Image,
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import React, { useMemo } from 'react';
import useTheme from '../../styles/theme';
import { scaleWithMax } from '../../utils';

type Props = {
  error?: boolean;
  icon?: any;
  style?: any;
  iconColor?: string;
  fieldProps: TextInputProps;
};

const InputField = ({ icon, error, iconColor, style, fieldProps }: Props) => {
  const { theme, styles } = useStyles();
  return (
    <View
      style={[
        styles.container,
        {
          borderWidth: error ? 1 : 0.5,
          borderColor: error ? theme.colors.RED : theme.colors.LIGHT_GRAY,
        },
        style,
      ]}
    >
      {icon && (
        <Image source={icon} style={[styles.image, { tintColor: iconColor }]} />
      )}
      <TextInput
        {...fieldProps}
        style={[styles.input, fieldProps.style]}
        placeholderTextColor={theme.colors.SECONDARY_TEXT}
        selectionColor={theme.colors.PRIMARY}
        underlineColorAndroid="transparent"
      />
    </View>
  );
};

export default InputField;

const useStyles = () => {
  const theme = useTheme();

  const styles = useMemo(() => {
    const { colors, sizes, globalStyles } = theme;
    return StyleSheet.create({
      container: {
        width: '100%',
        height: scaleWithMax(45, 50),
        borderRadius: sizes.BORDER_RADIUS,
        flexDirection: 'row',
        paddingHorizontal: sizes.PADDING,
        alignItems: 'center',
        backgroundColor: colors.LIGHT_GRAY,
      },
      input: {
        flex: 1,
        height: '100%',
        fontSize: 16,
        color: colors.PRIMARY_TEXT,
        fontFamily: globalStyles.TEXT_STYLE.fontFamily,
        paddingVertical: 0,
        paddingHorizontal: 0,
      },
      image: {
        width: sizes.ICON * 0.5,
        height: sizes.ICON * 0.5,
        marginRight: sizes.PADDING,
      },
    });
  }, [theme]);

  return {
    styles,
    theme,
  };
};
