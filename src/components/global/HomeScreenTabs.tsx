import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  Image,
  ImageSourcePropType,
  StyleSheet,
} from 'react-native';
import { ReactElement } from 'react';
import useTheme from '../../styles/theme';
import fonts from '../../assets/fonts';

interface HomeScreenTabsProps {
  icon?: ReactElement;
  image?: ImageSourcePropType;
  title: string;
  titlePrimary?: string;
  description: string;
  onPress?: () => void;
  style?: any;
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
  const { colors, sizes } = useTheme();

  const cardStyles = StyleSheet.create({
    card: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 12,
      padding: 8,
      minHeight: sizes.HEIGHT * 0.1,
      marginBottom: sizes.PADDING,
      marginHorizontal: 4,
      backgroundColor: '#DBEDFD',
    },
    content: {
      flex: 1,
      marginLeft: 10,
    },
    title: {
      fontSize: sizes.FONTSIZE_MEDIUM,
      fontFamily: fonts.Quicksand.bold,
      color: colors.PRIMARY_TEXT,
      marginBottom: 4,
    },
    titlePrimary: {
      color: colors.PRIMARY,
    },
    description: {
      fontSize: 9,
      color: colors.BLACK,
    },
  });

  return (
    <TouchableOpacity style={[cardStyles.card, style]} onPress={onPress}>
      {icon && icon}
      {image && (
        <Image
          source={image}
          style={{ width: 32, height: 32, resizeMode: 'contain' }}
        />
      )}
      <View style={cardStyles.content}>
        <Text style={cardStyles.title}>
          {title}
          {titlePrimary && (
            <Text style={cardStyles.titlePrimary}> {titlePrimary}</Text>
          )}
        </Text>
        <Text style={cardStyles.description}>{description}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default HomeScreenTabs;
