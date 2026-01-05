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
  iconStyles?: ViewStyle;
  descriptionStyles?: TextStyle;
}

const HomeScreenTabs: React.FC<HomeScreenTabsProps> = ({
  icon,
  image,
  title,
  titlePrimary,
  description,
  onPress,
  style,
  iconStyles,
  descriptionStyles,
}) => {
  const theme = useTheme();
  const { colors, sizes } = theme;
  const isProMax = sizes.WIDTH >= 430 && isIOS;

  const cardStyles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          flex: 1,
          flexDirection: 'row-reverse',
          alignItems: 'center',
          borderRadius: scaleWithMax(20, 20),
          paddingHorizontal: scaleWithMax(14, 15),
          paddingVertical: scaleWithMax(16, 17),
          backgroundColor: colors.WHITE,
          position: 'relative',
        },
        content: {
          flex: 1,
          // marginLeft: scaleWithMax(10, 12),
        },
        title: {
          fontSize: sizes.FONTSIZE_SMALL_HEADING,
          fontFamily: fonts.Quicksand.bold,
          color: colors.PRIMARY_TEXT,
          flexShrink: 1,
          marginBottom: scaleWithMax(2.5, 3),
        },
        titlePrimary: {
          color: colors.PRIMARY,
        },
        description: {
          fontSize: scaleWithMax(10, 10),
          fontFamily: fonts.Quicksand.regular,
          color: colors.BLACK,
          lineHeight: scaleWithMax(11.5, 12.5),
        },
        iconImage: {
          width: scaleWithMax(40, 50),
          height: scaleWithMax(40, 50),
          resizeMode: 'contain',
        },
        iconContainer: {
          width: scaleWithMax(32, 36),
          height: scaleWithMax(32, 36),
          justifyContent: 'center',
          alignItems: 'center',
          // marginRight: scaleWithMax(10, 12),
        },
      }),
    [theme, isProMax],
  );

  return (
    <TouchableOpacity style={[cardStyles.card, style]} onPress={onPress}>
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
        <Text style={[cardStyles.description, descriptionStyles]}>
          {description}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default HomeScreenTabs;
