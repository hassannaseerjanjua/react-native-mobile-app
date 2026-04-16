import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { SvgLogoBlue } from '../../assets/icons';
import { Text } from '../../utils/elements';
import useTheme from '../../styles/theme';
import { scaleWithMax } from '../../utils';

interface PlaceholderLogoTextProps {
  text: string;
  logoSize?: number;
  containerStyle?: any;
}

const PlaceholderLogoText: React.FC<PlaceholderLogoTextProps> = ({
  text,
  logoSize,
  containerStyle,
}) => {
  const { styles, theme } = useStyles();
  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.logoContainer}>
        <SvgLogoBlue
          width={scaleWithMax(88, 93)}
          height={scaleWithMax(38, 43)}
        />
      </View>
      <Text style={styles.text}>{text || 'No orders found'}</Text>
    </View>
  );
};

export default PlaceholderLogoText;

const useStyles = () => {
  const theme = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        },
        logoContainer: {
          alignItems: 'center',
          marginBottom: scaleWithMax(3, 4),
        },
        text: {
          ...theme.globalStyles.TEXT_STYLE,
          fontSize: theme.sizes.FONTSIZE,
          color: theme.colors.PRIMARY_TEXT,
          textAlign: 'center',
        },
      }),
    [theme],
  );

  return {
    styles,
    theme,
  };
};
