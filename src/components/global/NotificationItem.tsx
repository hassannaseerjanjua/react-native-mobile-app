import {
  StyleSheet,
  View,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  Image,
  TextStyle,
  Platform,
} from 'react-native';
import React, { useMemo } from 'react';
import { SvgGiftLink, SvgGroup } from '../../assets/icons';
import useTheme from '../../styles/theme';
import { Text } from '../../utils/elements';
import { useLocaleStore } from '../../store/reducer/locale';
import { I18nManager } from 'react-native';
import { scaleWithMax } from '../../utils';

interface NotificationItemProps {
  title: string;
  onPress: () => void;
  NotificationItemStyles?: StyleProp<ViewStyle>;
  NotificationTextStyles?: StyleProp<TextStyle>;
  isLink?: boolean;
  isGroupImage?: any;
  icon?: React.ReactNode;
  time?: string;
  boldText?: string;
}

const NotificationItem = ({
  title,
  onPress,
  NotificationItemStyles,
  NotificationTextStyles,
  isLink,
  isGroupImage = false,
  icon,
  time,
  boldText,
}: NotificationItemProps) => {
  const { styles, theme } = useStyles();
  const { isRtl } = useLocaleStore();

  const renderTitle = () => {
    if (boldText && title.includes(boldText)) {
      const parts = title.split(boldText);
      return (
        <Text style={[styles.titleText, NotificationTextStyles]}>
          {parts[0]}
          <Text style={styles.boldText}>{boldText}</Text>
          {parts[1]}
        </Text>
      );
    }
    return (
      <Text style={[styles.titleText, NotificationTextStyles]}>{title}</Text>
    );
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.container, NotificationItemStyles]}
    >
      {time && (
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{time}</Text>
        </View>
      )}
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
        {renderTitle()}
      </View>
    </TouchableOpacity>
  );
};

const useStyles = () => {
  const theme = useTheme();
  const { isRtl } = useLocaleStore();

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
        paddingHorizontal: theme.sizes.PADDING * 0.85,
        paddingVertical: theme.sizes.HEIGHT * 0.014,
        ...theme.globalStyles.SHADOW_STYLE,
        borderRadius: theme.sizes.BORDER_RADIUS_MID,
        position: 'relative',
      },
      contentContainer: {
        flexDirection: isRtl ? 'row-reverse' : 'row',
        alignItems: 'center',
        gap: 10,
        flex: 1,
        minWidth: 0,
      },
      titleText: {
        ...theme.globalStyles.TEXT_STYLE,
        fontSize: scaleWithMax(13, 14),
        color: colors.PRIMARY_TEXT,
        flex: 1,
        textAlign: isRtl ? 'right' : 'left',
      },
      boldText: {
        ...theme.globalStyles.TEXT_STYLE_BOLD,
      },
      groupImage: {
        width: scaleWithMax(50, 55),
        height: scaleWithMax(50, 55),
        borderRadius: 999,
      },
      timeContainer: {
        position: 'absolute',
        top: theme.sizes.HEIGHT * 0.005,
        ...(isRtl
          ? { left: theme.sizes.PADDING * 0.5 }
          : { right: theme.sizes.PADDING * 0.5 }),
        zIndex: 1,
      },
      timeText: {
        ...theme.globalStyles.TEXT_STYLE,
        fontSize: theme.sizes.FONTSIZE_SMALL,
        color: colors.SECONDARY_GRAY,
      },
    });
  }, [theme, isRtl]);

  return { theme, styles };
};

export default NotificationItem;
