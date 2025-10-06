import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
} from 'react-native';
import React, { useMemo } from 'react';
import { SvgGiftLink, SvgNextIcon } from '../../assets/icons';
import useTheme from '../../styles/theme';

interface TabItemProps {
  title: string;
  onPress: () => void;
  styles?: StyleProp<ViewStyle>;
}

const TabItem = ({ title, onPress, styles: customStyles }: TabItemProps) => {
  const { styles, theme } = useStyles();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.container, customStyles]}
    >
      <View style={styles.contentContainer}>
        <SvgGiftLink />
        <Text style={styles.titleText}>{title}</Text>
      </View>
      <SvgNextIcon />
    </TouchableOpacity>
  );
};

const useStyles = () => {
  const theme = useTheme();

  const styles = useMemo(() => {
    const { colors } = theme;

    return StyleSheet.create({
      container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.WHITE,
        gap: 10,
        width: '100%',
        height: 60,
        paddingHorizontal: 16,
        paddingVertical: 12,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
        borderRadius: 8,
      },
      contentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
      },
      titleText: {
        fontFamily: 'Quicksand-Medium',
        fontSize: theme.sizes.FONTSIZE_HIGH,
        color: colors.PRIMARY_TEXT,
      },
    });
  }, [theme]);

  return { theme, styles };
};

export default TabItem;
