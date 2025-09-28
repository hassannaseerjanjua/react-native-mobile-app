import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import React, { useMemo } from 'react';
import useTheme from '../../styles/theme';
import { scaleWithMax } from '../../utils';

type Props = {
  error?: boolean | string;
  icon?: any;
  style?: any;
  iconColor?: string;
  fieldProps: TextInputProps;
  errors?: string;
};

const InputField = ({
  icon = null,
  error,
  iconColor,
  style,
  fieldProps,
  errors,
}: Props) => {
  const { theme, styles } = useStyles();
  return (
    <>
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
        {icon}
        <TextInput
          {...fieldProps}
          style={[
            styles.input,
            {
              paddingLeft: icon ? theme.sizes.PADDING : 0,
            },
            fieldProps.style,
          ]}
          placeholderTextColor={theme.colors.SECONDARY_TEXT}
          selectionColor={theme.colors.PRIMARY}
          underlineColorAndroid="transparent"
        />
      </View>
      {(errors || (typeof error === 'string' && error)) && (
        <Text
          style={[
            styles.error,
            {
              textAlign: 'left',
            },
          ]}
        >
          {errors || (typeof error === 'string' ? error : '')}
        </Text>
      )}
    </>
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
        ...globalStyles.TEXT_STYLE,
        flex: 1,
        height: '100%',
        fontSize: 16,
        color: colors.PRIMARY_TEXT,
        paddingVertical: 0,
        paddingHorizontal: 0,
        position: 'relative',
      },
      image: {
        width: sizes.ICON * 0.5,
        height: sizes.ICON * 0.5,
        marginRight: sizes.PADDING,
      },
      error: {
        color: theme.colors.RED,
        fontSize: 12,
        fontFamily: theme.globalStyles.TEXT_STYLE.fontFamily,
        position: 'absolute',
        bottom: sizes.HEIGHT * -0.0216,
      },
    });
  }, [theme]);

  return {
    styles,
    theme,
  };
};
