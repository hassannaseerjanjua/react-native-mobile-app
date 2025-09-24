import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import useTheme from '../../styles/theme';

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  title,
  showBackButton = true,
  onBackPress,
}) => {
  const navigation = useNavigation();
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
        padding: 8,
        // borderRadius: 20,
        // backgroundColor: colors.LIGHT_GRAY,
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
      },
      backButtonText: {
        // fontSize: 20,
        // color: colors.PRIMARY_TEXT,
        // fontWeight: 'bold',
        width: 20,
        height: 20,
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

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      {showBackButton && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackPress}
          activeOpacity={0.7}
        >
          <Image
            source={require('../../assets/images/backIcon.png')}
            style={styles.backButtonText}
          />
        </TouchableOpacity>
      )}
      {title && <Text style={styles.title}>{title}</Text>}
      <View style={styles.placeholder} />
    </View>
  );
};

export default Header;
