import React, { useMemo } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import useTheme from '../../styles/theme';
import { SvgBackIcon } from '../../assets/icons';
import { scaleWithMax, rtlTransform } from '../../utils';
import { Text } from '../../utils/elements';
import { useLocaleStore } from '../../store/reducer/locale';

interface AuthHeaderProps {
  title?: string;
  showBackButton?: boolean;
  spaceTaken?: boolean;
  onBackPress?: () => void;
}

const AuthHeader: React.FC<AuthHeaderProps> = ({
  title,
  showBackButton = true,
  spaceTaken = false,
  onBackPress,
}) => {
  const navigation = useNavigation();
  const { styles } = useStyles();
  const { sizes } = useTheme();
  const { isRtl } = useLocaleStore();

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
          <SvgBackIcon
            width={backSize}
            height={backSize}
            style={{ transform: rtlTransform(isRtl) }}
          />
        </TouchableOpacity>
      ) : spaceTaken ? (
        <View
          style={{
            width: backSize + sizes.PADDING * 2,
            height: backSize + sizes.PADDING * 2,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        />
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
    const { colors, sizes, fonts } = theme;
    return StyleSheet.create({
      container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      },
      backButton: {
        paddingVertical: sizes.PADDING,
        alignItems: 'center',
        justifyContent: 'center',
      },
      title: {
        fontFamily: fonts.bold,
        fontSize: 20,
        lineHeight: 32,
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
