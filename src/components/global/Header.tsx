import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import useTheme from '../../styles/theme';
import { SvgBackIcon } from '../../assets/icons';
import { scaleWithMax } from '../../utils';

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  spaceTaken?: boolean;
  onBackPress?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  title,
  showBackButton = true,
  spaceTaken = false,
  onBackPress,
}) => {
  const navigation = useNavigation();
  const { styles, theme } = useStyles();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  const backSize = scaleWithMax(20, 25);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={handleBackPress}
        activeOpacity={0.7}
      >
        {showBackButton && (
          <SvgBackIcon
            // style={styles.backButton}
            width={backSize}
            height={backSize}
          />
        )}
        {spaceTaken && (
          <View
            style={{ ...styles.backButton, width: backSize, height: backSize }}
          />
        )}
      </TouchableOpacity>

      {title && <Text style={styles.title}>{title}</Text>}
      <View style={styles.placeholder} />
    </View>
  );
};

export default Header;

const useStyles = () => {
  const theme = useTheme();
  const styles = useMemo(() => {
    const { colors, sizes } = theme;
    return StyleSheet.create({
      container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        // paddingHorizontal: 20,
        paddingVertical: sizes.PADDING,
        backgroundColor: colors.BACKGROUND,
      },
      backButton: {
        // padding: 8,
        paddingVertical: sizes.PADDING,
        alignItems: 'center',
        justifyContent: 'center',
      },
      backButtonText: {
        width: 8,
        height: 17,
        resizeMode: 'contain',
      },
      title: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.PRIMARY_TEXT,
        textAlign: 'center',
        flex: 1,
      },
      placeholder: {
        width: 40,
      },
    });
  }, [theme]);

  return {
    theme,
    styles,
  };
};
