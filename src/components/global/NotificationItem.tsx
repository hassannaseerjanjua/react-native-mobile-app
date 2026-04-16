import {
  StyleSheet,
  View,
  StyleProp,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
} from 'react-native';
import React, { useMemo } from 'react';
import { SvgGiftLink, SvglmsNotifyIcon } from '../../assets/icons';
import useTheme from '../../styles/theme';
import { Text, Image } from '../../utils/elements';
import { useLocaleStore } from '../../store/reducer/locale';
import { I18nManager } from 'react-native';
import { rtlFlexDirection, rtlTransform, scaleWithMax } from '../../utils';
import ShadowView from './ShadowView';

interface NotificationItemProps {
  title: string;
  NotificationItemStyles?: StyleProp<ViewStyle>;
  NotificationTextStyles?: StyleProp<TextStyle>;
  isLink?: boolean;
  isGroupImage?: any;
  icon?: React.ReactNode;
  time?: string | null;
  boldText?: string;
  isSeen?: boolean;
  onPress?: () => void;
}

const NotificationItem = ({
  title,
  NotificationItemStyles,
  NotificationTextStyles,
  isLink,
  isGroupImage = false,
  icon,
  time,
  boldText,
  isSeen = true,
  onPress,
}: NotificationItemProps) => {
  const { styles, theme } = useStyles();
  const { isRtl, langCode } = useLocaleStore();

  const renderTitle = () => {
    if (boldText && title.includes(boldText)) {
      const parts = title.split(boldText);
      return (
        <Text
          style={[styles.titleText, NotificationTextStyles]}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {parts[0]}
          <Text style={styles.boldText}>{boldText}</Text>
          {parts[1]}
        </Text>
      );
    }
    return (
      <Text
        style={[styles.titleText, NotificationTextStyles]}
        numberOfLines={2}
        ellipsizeMode="tail"
      >
        {title}
      </Text>
    );
  };

  const content = (
    <>
      {time && (
        <View style={[styles.timeContainer]}>
          <Text style={[styles.timeText]}>{time}</Text>
        </View>
      )}
      <View style={styles.contentContainer}>
        <View style={{ position: 'relative' }}>
          <View style={styles.avatarContainer}>
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
              <View style={styles.placeholderContainer}>
                <SvglmsNotifyIcon
                  width={scaleWithMax(50, 55)}
                  height={scaleWithMax(50, 55)}
                />
              </View>
            )}
          </View>
          {!isSeen && <View style={styles.unreadDot} />}
        </View>
        {isLink && <SvgGiftLink />}
        {icon && icon}
        {renderTitle()}
      </View>
    </>
  );

  const Wrapper = onPress ? TouchableOpacity : View;
  const wrapperProps = onPress ? { onPress, activeOpacity: 0.7 } : {};

  return (
    <ShadowView preset="listItem">
      <Wrapper
        style={[styles.container, NotificationItemStyles]}
        {...wrapperProps}
      >
        {content}
      </Wrapper>
    </ShadowView>
  );
};

const useStyles = () => {
  const theme = useTheme();
  const { isRtl, langCode } = useLocaleStore();

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
        borderRadius: theme.sizes.BORDER_RADIUS_MID,
        position: 'relative',
      },
      contentContainer: {
        flexDirection: 'row',
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
        textAlign: 'left',
      },
      boldText: {
        ...theme.globalStyles.TEXT_STYLE_BOLD,
      },
      avatarContainer: {
        width: scaleWithMax(50, 55),
        height: scaleWithMax(50, 55),
        borderRadius: 999,
        overflow: 'hidden',
        backgroundColor: colors.BACKGROUND ?? colors.WHITE,
        justifyContent: 'center',
        alignItems: 'center',
      },
      groupImage: {
        width: '100%',
        height: '100%',
      },
      placeholderContainer: {
        justifyContent: 'center',
        alignItems: 'center',
      },
      timeContainer: {
        position: 'absolute',
        top: theme.sizes.HEIGHT * 0.005,
        // ...(langCode === 'ar'
        //   ? { left: theme.sizes.PADDING * 0.5 }
        //   : { right: theme.sizes.PADDING * 0.5 }),
        zIndex: 1,
        end: theme.sizes.PADDING * 0.5,
      },
      timeText: {
        ...theme.globalStyles.TEXT_STYLE,
        fontSize: theme.sizes.FONTSIZE_SMALL,
        color: '#A0A0A0',
      },
      unreadDot: {
        width: scaleWithMax(11, 13),
        height: scaleWithMax(11, 13),
        borderRadius: 999,
        backgroundColor: colors.PRIMARY,
        position: 'absolute',
        top: scaleWithMax(1, 2),
        right: scaleWithMax(1, 2),
        borderWidth: 1.5,
        borderColor: colors.WHITE,
        zIndex: 2,
      },
    });
  }, [theme, isRtl]);

  return { theme, styles };
};

export default NotificationItem;
