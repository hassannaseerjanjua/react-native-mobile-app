import {
  StyleSheet,
  View,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  Image,
  TextStyle,
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
import { Text } from '../../utils/elements';
import { scaleWithMax, rtlTransform } from '../../utils';
import { useLocaleStore } from '../../store/reducer/locale';

interface TabItemProps {
  title: string;
  onPress: () => void;
  TabItemStyles?: StyleProp<ViewStyle>;
  TabTextStyles?: StyleProp<TextStyle>;
  isEditGroup?: boolean;
  isLink?: boolean;
  isGroupImage?: any;
  onDeletePress?: () => void;
  onEditPress?: () => void;
  icon?: React.ReactNode;
  hideRightIcon?: boolean;
}

const TabItem = ({
  title,
  onPress,
  TabItemStyles,
  TabTextStyles,
  isEditGroup,
  isLink,
  isGroupImage = false,
  onDeletePress,
  onEditPress,
  icon,
  hideRightIcon,
}: TabItemProps) => {
  const { styles, theme } = useStyles();
  const { isRtl } = useLocaleStore();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.container, TabItemStyles]}
    >
      <View style={styles.contentContainer}>
        {isGroupImage ? (
          <Image
            source={
              typeof isGroupImage === 'string'
                ? { uri: isGroupImage }
                : isGroupImage
            }
            style={styles.groupImage}
          />
        ) : (
          isGroupImage === '' && <SvgGroup />
        )}
        {isLink && <SvgGiftLink />}
        {icon && icon}
        <Text
          style={[styles.titleText, TabTextStyles]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {title}
        </Text>
      </View>
      {isEditGroup ? (
        <>
          <View style={styles.editGroupContainer}>
            <SvgDeleteIcon onPress={onDeletePress} />
            <SvgEditIcon onPress={onEditPress} />
          </View>
        </>
      ) : (
        !hideRightIcon && (
          <SvgNextIcon style={{ transform: rtlTransform(isRtl) }} />
        )
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
        paddingHorizontal: theme.sizes.PADDING,
        paddingVertical: theme.sizes.HEIGHT * 0.017,
        shadowColor: '#000',
        shadowOpacity: 0.03,
        shadowRadius: 2,
        shadowOffset: { width: 0, height: 1 },
        elevation: 1,
        borderRadius: 8,
      },
      contentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        flex: 1,
        minWidth: 0,
      },
      titleText: {
        fontFamily: 'Quicksand-Medium',
        fontSize: theme.sizes.FONTSIZE_LESS_HIGH,
        color: colors.PRIMARY_TEXT,
        maxWidth: '75%',
        flexShrink: 1,
      },
      editGroupContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scaleWithMax(22, 26),
        flexShrink: 0,
      },
      groupImage: {
        width: 40,
        height: 40,
        borderRadius: 999,
      },
    });
  }, [theme]);

  return { theme, styles };
};

export default TabItem;
