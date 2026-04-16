import { StyleSheet, TextInputProps, View, Platform, TouchableOpacity } from 'react-native';
import React, { useMemo } from 'react';
import useTheme from '../../styles/theme';
import { scaleWithMax } from '../../utils';
import { Text, TextInput } from '../../utils/elements';

type Props = {
  label?: string;
  error?: any;
  icon?: any;
  style?: any;
  fieldProps: TextInputProps;
  secureTextEntry?: boolean;
  onIconPress?: () => void;
};

const InputField = ({
  label,
  icon = null,
  error,
  style,
  fieldProps,
  secureTextEntry,
  onIconPress,
}: Props) => {
  const { theme, styles } = useStyles();
  const showErrorBorder = !!error;

  return (
    <View style={[styles.outerContainer, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.container,
          {
            borderColor: showErrorBorder ? theme.colors.RED : theme.colors.BORDER_COLOR,
            borderWidth: 1,
          },
        ]}
      >
        <TextInput
          {...fieldProps}
          style={[styles.input, fieldProps.style]}
          secureTextEntry={secureTextEntry}
          allowFontScaling={false}
          placeholderTextColor={theme.colors.SECONDARY_TEXT}
          selectionColor={theme.colors.PRIMARY}
        />
        {icon && (
          <TouchableOpacity onPress={onIconPress} style={styles.iconContainer}>
            {icon}
          </TouchableOpacity>
        )}
      </View>
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

export default InputField;

const useStyles = () => {
  const theme = useTheme();

  const styles = useMemo(() => {
    const { colors, sizes, globalStyles, fonts } = theme;
    return StyleSheet.create({
      outerContainer: {
        width: '100%',
        marginBottom: 16,
      },
      label: {
        ...globalStyles.TEXT_STYLE_SEMIBOLD,
        fontSize: 14,
        color: colors.PRIMARY_TEXT,
        marginBottom: 8,
      },
      container: {
        width: '100%',
        height: 50,
        borderRadius: 8,
        flexDirection: 'row',
        paddingHorizontal: 12,
        alignItems: 'center',
        backgroundColor: colors.WHITE,
      },
      input: {
        ...globalStyles.TEXT_STYLE,
        fontFamily: fonts.regular,
        flex: 1,
        fontSize: 15,
        color: colors.PRIMARY_TEXT,
        paddingVertical: 0,
      },
      iconContainer: {
        padding: 4,
      },
      errorText: {
        ...globalStyles.TEXT_STYLE,
        color: colors.RED,
        fontSize: 12,
        marginTop: 4,
      },
    });
  }, [theme]);

  return {
    styles,
    theme,
  };
};
