import React, { useMemo } from 'react';
import {
  TouchableOpacity,
  View,
  Image,
  ImageSourcePropType,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { ReactElement } from 'react';
import useTheme from '../../styles/theme';
import fonts from '../../assets/fonts';
import { Text } from '../../utils/elements';
import { isIOS, isIOSThen, scaleWithMax } from '../../utils';

interface HomeScreenTabsProps {
  icon?: ReactElement;
  image?: ImageSourcePropType;
  title: string;
  titlePrimary?: string;
  description: string;
  onPress?: () => void;
  style?: ViewStyle;
}

const HomeScreenTabs: React.FC<HomeScreenTabsProps> = ({
  icon,
  image,
  title,
  titlePrimary,
  description,
  onPress,
  style,
}) => {
  const theme = useTheme();
  const { colors, sizes } = theme;
  const isProMax = sizes.WIDTH >= 430 && isIOS;

  const cardStyles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          borderRadius: sizes.BORDER_RADIUS_MID,
          paddingHorizontal: isProMax
            ? scaleWithMax(14, 15)
            : scaleWithMax(11, 11),
          paddingVertical: isProMax
            ? scaleWithMax(16, 17)
            : scaleWithMax(11, 11),
          backgroundColor: colors.SECONDARY,
          position: 'relative',
        },
        content: {
          flex: 1,
          marginLeft: scaleWithMax(10, 12),
        },
        title: {
          fontSize: isProMax ? scaleWithMax(14, 14) : scaleWithMax(12, 13),
          fontFamily: fonts.Quicksand.bold,
          color: colors.PRIMARY_TEXT,
          flexShrink: 1,
        },
        titlePrimary: {
          color: colors.PRIMARY,
        },
        description: {
          fontSize: scaleWithMax(9, 11),
          fontFamily: fonts.Quicksand.regular,
          color: colors.BLACK,
          lineHeight: scaleWithMax(13, 14),
        },
        iconImage: {
          width: scaleWithMax(32, 36),
          height: scaleWithMax(32, 36),
          resizeMode: 'contain',
        },
        iconContainer: {
          width: scaleWithMax(32, 36),
          height: scaleWithMax(32, 36),
          justifyContent: 'center',
          alignItems: 'center',
        },
      }),
    [theme, isProMax],
  );

  return (
    <TouchableOpacity style={[cardStyles.card, style]} onPress={onPress}>
      {icon && <View style={cardStyles.iconContainer}>{icon}</View>}
      {image && <Image source={image} style={cardStyles.iconImage} />}
      <View style={cardStyles.content}>
        <Text style={cardStyles.title}>
          {title}
          {titlePrimary && (
            <Text style={cardStyles.titlePrimary}> {titlePrimary}</Text>
          )}
        </Text>
        <Text
          style={[
            cardStyles.description,
            title === 'Catch' && {
              maxWidth: '70%',
            },
          ]}
        >
          {description}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default HomeScreenTabs;
