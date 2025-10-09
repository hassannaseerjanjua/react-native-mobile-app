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
import { SvgEmail, SvgPhone, SvgPhoneIcon } from '../../assets/icons';

type Props = {
  error?: any;
  icon?: any;
  style?: any;
  iconColor?: string;
  fieldProps: TextInputProps;

  isPhone?: boolean;
};

const InputField = ({
  icon = null,
  error,
  iconColor,
  style,
  fieldProps,
  isPhone,
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
        {isPhone ? (
          <SvgPhone
            width={scaleWithMax(20, 25)}
            height={scaleWithMax(20, 25)}
          />
        ) : (
          icon
        )}
        {isPhone && <Text style={styles.prefixText}>+966</Text>}
        <TextInput
          {...fieldProps}
          style={[
            styles.input,
            {
              paddingLeft: isPhone || icon ? theme.sizes.PADDING : 0,
            },
            fieldProps.style,
          ]}
          placeholderTextColor={theme.colors.SECONDARY_TEXT}
          selectionColor={theme.colors.PRIMARY}
          underlineColorAndroid="transparent"
        />
      </View>
      {!!error && (
        <Text
          style={[
            styles.error,
            {
              textAlign: 'left',
            },
          ]}
        >
          {error}
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
        top: -8,
        end: 6,
        backgroundColor: theme.colors.LIGHT_GRAY,
        paddingHorizontal: 6,
        paddingVertical: 1,
        borderRadius: 6,
        borderWidth: 0.5,
        borderColor: theme.colors.RED,

        // bottom: sizes.HEIGHT * -0.0216,
      },
      prefixText: {
        ...globalStyles.TEXT_STYLE,
        fontSize: 16,
        color: colors.PRIMARY_TEXT,
        marginLeft: 8,
      },
    });
  }, [theme]);

  return {
    styles,
    theme,
  };
};
