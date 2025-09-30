import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import useTheme from '../../styles/theme';
import { SvgBackIcon } from '../../assets/icons';
import { scaleWithMax } from '../../utils';

interface AuthHeaderProps {
  title?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
}

const AuthHeader: React.FC<AuthHeaderProps> = ({
  title,
  showBackButton = true,
  onBackPress,
}) => {
  const navigation = useNavigation();
  const { styles } = useStyles();
  const { sizes } = useTheme();

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
      {showBackButton ? (
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackPress}
          activeOpacity={0.7}
        >
          <SvgBackIcon width={backSize} height={backSize} />
        </TouchableOpacity>
      ) : (
        <View style={styles.placeholder} />
      )}

      {title && <Text style={styles.title}>{title}</Text>}

      <View style={styles.placeholder} />
    </View>
  );
};

export default AuthHeader;

const useStyles = () => {
  const theme = useTheme();
  const styles = useMemo(() => {
    const { colors, sizes } = theme;
    return StyleSheet.create({
      container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: sizes.PADDING,
        backgroundColor: colors.BACKGROUND,
      },
      backButton: {
        paddingVertical: sizes.PADDING,
        alignItems: 'center',
        justifyContent: 'center',
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
