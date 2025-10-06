import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
} from 'react-native';
import React, { useMemo } from 'react';
import {
  SvgDeleteIcon,
  SvgEditIcon,
  SvgGiftLink,
  SvgGroup,
  SvgNextIcon,
} from '../../assets/icons';
import useTheme from '../../styles/theme';

interface TabItemProps {
  title: string;
  onPress: () => void;
  styles?: StyleProp<ViewStyle>;
  isEditGroup?: boolean;
  isLink?: boolean;
  isGroup?: boolean;
}

const TabItem = ({
  title,
  onPress,
  styles: customStyles,
  isEditGroup,
  isLink,
  isGroup,
}: TabItemProps) => {
  const { styles, theme } = useStyles();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.container, customStyles]}
    >
      <View style={styles.contentContainer}>
        {isGroup && <SvgGroup />}
        {isLink && <SvgGiftLink />}
        <Text style={styles.titleText}>{title}</Text>
      </View>
      {isEditGroup ? (
        <>
          <View style={styles.editGroupContainer}>
            <SvgDeleteIcon />
            <SvgEditIcon />
          </View>
        </>
      ) : (
        <SvgNextIcon />
      )}
    </TouchableOpacity>
  );
};

const useStyles = () => {
  const theme = useTheme();

  const styles = useMemo(() => {
    const { colors, sizes } = theme;

    return StyleSheet.create({
      container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.WHITE,
        gap: 10,
        width: '100%',
        // height: theme.sizes.HEIGHT * 0.07,
        paddingHorizontal: 16,
        paddingVertical: 14,
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
      editGroupContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: sizes.WIDTH * 0.07,
      },
    });
  }, [theme]);

  return { theme, styles };
};

export default TabItem;
