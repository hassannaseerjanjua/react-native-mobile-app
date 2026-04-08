import React, { useMemo } from 'react';
import {
  TouchableOpacity,
  View,
  Image,
  ImageSourcePropType,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { ReactElement } from 'react';
import useTheme from '../../styles/theme';
import { Text } from '../../utils/elements';
import { isAndroid, isIOS, isIOSThen, scaleWithMax } from '../../utils';

interface HomeScreenTabsProps {
  icon?: ReactElement;
  image?: ImageSourcePropType;
  title: string;
  titlePrimary?: string;
  description: string;
  shrinkDescription?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  iconStyles?: ViewStyle;
  descriptionStyles?: TextStyle;
}

const HomeScreenTabs: React.FC<HomeScreenTabsProps> = ({
  icon,
  image,
  title,
  titlePrimary,
  description,
  shrinkDescription = false,
  onPress,
  style,
  iconStyles,
  descriptionStyles,
}) => {
  const theme = useTheme();
  const { colors, sizes, fonts } = theme;
  const isProMax = sizes.WIDTH >= 430 && isIOS;
  const isLargeAndroid = isAndroid && sizes.HEIGHT > 800;

  const cardStyles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          flex: 1,
          flexDirection: 'row-reverse',
          alignItems: 'center',
          borderRadius: scaleWithMax(20, 20),
          paddingHorizontal: scaleWithMax(14, 15),
          paddingVertical: isProMax
            ? scaleWithMax(18, 20)
            : isLargeAndroid
            ? scaleWithMax(19, 18)
            : isAndroid
            ? scaleWithMax(18, 17)
            : scaleWithMax(16, 17),
          backgroundColor: '#FFF7F1',
          position: 'relative',
        },
        content: {
          flex: 1,
          // marginLeft: scaleWithMax(10, 12),
        },
        title: {
          fontSize: isProMax
            ? sizes.FONTSIZE_SMALL_HEADING * 1.05
            : isLargeAndroid
            ? sizes.FONTSIZE_SMALL_HEADING * 1.02
            : sizes.FONTSIZE_SMALL_HEADING,
          fontFamily: fonts.bold,
          color: colors.PRIMARY_TEXT,
          flexShrink: 1,
          marginBottom: scaleWithMax(2.5, 3),
        },
        titlePrimary: {
          color: colors.PRIMARY,
        },
        description: {
          // fontSize: isProMax
          //   ? scaleWithMax(10.25, 10.75)
          //   : isLargeAndroid
          //   ? scaleWithMax(10.1, 10.2)
          //   : scaleWithMax(10, 10),
          fontSize: scaleWithMax(10.3, 10.3),
          fontFamily: fonts.regular,
          color: colors.BLACK,
          lineHeight: isProMax
            ? scaleWithMax(12.25, 13.25)
            : isLargeAndroid
            ? scaleWithMax(11.75, 12.75)
            : scaleWithMax(11.5, 12.5),
        },
        iconImage: {
          width: isProMax
            ? scaleWithMax(42, 54)
            : isLargeAndroid
            ? scaleWithMax(41, 52)
            : scaleWithMax(40, 50),
          height: isProMax
            ? scaleWithMax(42, 54)
            : isLargeAndroid
            ? scaleWithMax(41, 52)
            : scaleWithMax(40, 50),
          resizeMode: 'contain',
        },
        iconContainer: {
          width: isProMax
            ? scaleWithMax(34, 39)
            : isLargeAndroid
            ? scaleWithMax(33, 37)
            : scaleWithMax(32, 36),
          height: isProMax
            ? scaleWithMax(34, 39)
            : isLargeAndroid
            ? scaleWithMax(33, 37)
            : scaleWithMax(32, 36),
          justifyContent: 'center',
          alignItems: 'center',
          // marginRight: scaleWithMax(10, 12),
        },
      }),
    [theme, isProMax, isLargeAndroid],
  );

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      style={[cardStyles.card, style]}
      onPress={onPress}
    >
      {icon && (
        <View style={[cardStyles.iconContainer, iconStyles]}>{icon}</View>
      )}
      {image && <Image source={image} style={cardStyles.iconImage} />}
      <View style={cardStyles.content}>
        <Text style={cardStyles.title}>
          {title}
          {titlePrimary && (
            <Text style={cardStyles.titlePrimary}> {titlePrimary}</Text>
          )}
        </Text>
        <Text
          numberOfLines={shrinkDescription ? 2 : undefined}
          adjustsFontSizeToFit={shrinkDescription}
          minimumFontScale={shrinkDescription ? 0.9 : undefined}
          style={[cardStyles.description, descriptionStyles]}
        >
          {description}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default HomeScreenTabs;
