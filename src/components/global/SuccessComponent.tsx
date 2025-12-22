import { StyleSheet, Text, View } from 'react-native';
import React, { useMemo } from 'react';
import { useSizes } from '../../styles/sizes';
import useTheme from '../../styles/theme';
import CustomFooter from './CustomFooter';
import CustomButton from './Custombutton';

type SuccessMessageProps = {
  SuccessLogo: React.ReactNode;
  SuccessMessage: string;
  SuccessSubMessage?: string;
  /** Primary action button label */
  primaryButtonTitle?: string;
  /** Primary action button handler */
  onPrimaryPress?: () => void;
  /** Secondary action button label */
  secondaryButtonTitle?: string;
  /** Secondary action button handler */
  onSecondaryPress?: () => void;
};

const SuccessMessage: React.FC<SuccessMessageProps> = ({
  SuccessLogo,
  SuccessMessage,
  SuccessSubMessage,
  primaryButtonTitle,
  onPrimaryPress,
  secondaryButtonTitle,
  onSecondaryPress,
}) => {
  const { styles } = useStyles();

  const showFooter = primaryButtonTitle || secondaryButtonTitle;

  return (
    <View style={styles.checkoutCompletedContainer}>
      {SuccessLogo}
      <Text style={styles.TextLarge}>{SuccessMessage}</Text>
      {!!SuccessSubMessage && (
        <Text style={styles.TextMed}>{SuccessSubMessage}</Text>
      )}
      {showFooter && (
        <CustomFooter>
          <View style={styles.buttonsRow}>
            {!!primaryButtonTitle && (
              <View style={styles.buttonWrapper}>
                <CustomButton
                  title={primaryButtonTitle}
                  onPress={onPrimaryPress}
                />
              </View>
            )}
            {!!secondaryButtonTitle && (
              <View style={styles.buttonWrapper}>
                <CustomButton
                  type="secondary"
                  title={secondaryButtonTitle}
                  onPress={onSecondaryPress}
                />
              </View>
            )}
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
          rowGap: sizes.HEIGHT * 0.009,
        },
        TextLarge: {
          ...theme.globalStyles.TEXT_STYLE_MEDIUM,
          fontSize: theme.sizes.FONT_SIZE_EXTRA_HIGH,
          color: theme.colors.BLACK,
          marginTop: theme.sizes.HEIGHT * 0.02,
          textAlign: 'center',
        },
        TextMed: {
          ...theme.globalStyles.TEXT_STYLE,
          fontSize: theme.sizes.FONTSIZE_BUTTON,
          color: theme.colors.BLACK,
          textAlign: 'center',
        },
        buttonsRow: {
          flexDirection: 'column',
          rowGap: sizes.HEIGHT * 0.012,
        },
        buttonWrapper: {
          width: '100%',
        },
      }),
    [sizes, theme],
  );

  return {
    styles,
    sizes,
    theme,
  };
};
