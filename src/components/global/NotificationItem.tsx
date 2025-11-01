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
import {
  SvgGiftLink,
  SvgGroup,
} from '../../assets/icons';
import useTheme from '../../styles/theme';
import { Text } from '../../utils/elements';
import { useLocaleStore } from '../../store/reducer/locale';
import { I18nManager } from 'react-native';

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
      <Text style={[styles.titleText, NotificationTextStyles]}>
        {title}
      </Text>
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
        shadowColor: '#000',
        shadowOpacity: 0.02,
        shadowRadius: 2,
        shadowOffset: { width: 0, height: 1 },
        elevation: Platform.OS === 'android' ? 2 : 1,
        borderRadius: 12,
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
        fontFamily: 'Quicksand-Medium',
        fontSize: theme.sizes.FONTSIZE,
        color: colors.PRIMARY_TEXT,
        flex: 1,
        textAlign: isRtl ? 'right' : 'left',
      },
      boldText: {
        fontFamily: 'Quicksand-Bold',
        fontWeight: 'bold',
      },
      groupImage: {
        width: 56,
        height: 56,
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
        fontFamily: 'Quicksand-Regular',
        fontSize: theme.sizes.FONTSIZE_SMALL,
        color: colors.SECONDARY_GRAY,
      },
    });
  }, [theme, isRtl]);

  return { theme, styles };
};

export default NotificationItem;

