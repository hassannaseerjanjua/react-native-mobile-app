import {
  Image,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
} from 'react-native';
import React, { useMemo } from 'react';
import { SvgRiyalIcon } from '../../assets/icons';
import { useSizes } from '../../styles/sizes';
import useTheme from '../../styles/theme';
import { scaleWithMax } from '../../utils';
import CustomFooter from './CustomFooter';
import CustomButton from './Custombutton';
import { useNavigation } from '@react-navigation/native';

const SuccessMessage = ({
  SuccessLogo,
  SuccessMessage,
  SuccessSubMessage,
  onPress,
  BtnTitle,
}: {
  SuccessLogo: any;
  SuccessMessage: string;
  SuccessSubMessage?: string;
  onPress?: () => void;
  BtnTitle?: string;
}) => {
  const { styles, theme } = useStyles();

  return (
    <View style={styles.checkoutCompletedContainer}>
      {SuccessLogo}
      <Text
        style={{ ...styles.TextLarge, marginTop: theme.sizes.HEIGHT * 0.02 }}
      >
        {SuccessMessage}
      </Text>
      <Text style={styles.TextMed}>{SuccessSubMessage}</Text>
      {BtnTitle && (
        <CustomFooter>
          <View style={{ position: 'relative' }}>
            <CustomButton title="Home" onPress={onPress} />
          </View>
        </CustomFooter>
      )}
    </View>
  );
};

export default SuccessMessage;

const useStyles = () => {
  const sizes = useSizes();
  const theme = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        checkoutCompletedContainer: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          rowGap: sizes.HEIGHT * 0.007,
        },
        TextLarge: {
          ...theme.globalStyles.TEXT_STYLE_MEDIUM,
          fontSize: theme.sizes.FONT_SIZE_EXTRA_HIGH,
          color: theme.colors.BLACK,
        },
        TextMed: {
          fontSize: theme.sizes.FONT_SIZE_EXTRA_HIGH,
          color: theme.colors.BLACK,
        },
      }),
    [sizes],
  );

  return {
    styles,
    sizes,
    theme,
  };
};
