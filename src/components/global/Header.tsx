import React, { useMemo } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import useTheme from '../../styles/theme';
import {
  SvgBackIcon,
  SvgLogoHeader,
  SvgSearchIcon,
  SvgDummyAvatar,
} from '../../assets/icons';
import { scaleWithMax } from '../../utils';
import { Text } from '../../utils/elements';

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  spaceTaken?: boolean;
  onBackPress?: () => void;
  isLogo?: boolean;
  isSearch?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  title,
  showBackButton = true,
  spaceTaken = false,
  onBackPress,
  isLogo = false,
  isSearch = false,
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
      {isLogo && <SvgLogoHeader />}
      {showBackButton ? (
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackPress}
          activeOpacity={0.7}
        >
          <SvgBackIcon width={backSize} height={backSize} />
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
        <View />
      )}

      {title && <Text style={styles.title}>{title}</Text>}
      {isSearch && (
        <View style={styles.rightSection}>
          <View style={styles.searchContainer}>
            <SvgSearchIcon />
          </View>
          <View style={{ marginStart: sizes.WIDTH * 0.05 }}>
            <SvgDummyAvatar />
          </View>
        </View>
      )}
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
      rightSection: {
        flexDirection: 'row',
        alignItems: 'center',
      },
      searchContainer: {
        width: 35,
        height: 35,
        backgroundColor: theme.colors.WHITE,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 35 / 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
      },
    });
  }, [theme]);

  return {
    theme,
    styles,
  };
};
