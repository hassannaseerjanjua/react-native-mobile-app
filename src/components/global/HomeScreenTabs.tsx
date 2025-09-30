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
  flex?: number;
  style?: any;
}

const HomeScreenTabs: React.FC<HomeScreenTabsProps> = ({
  icon,
  image,
  title,
  titlePrimary,
  description,
  onPress,
  flex = 1,
  style,
}) => {
  const { colors, sizes } = useTheme();

  const cardStyles = StyleSheet.create({
    card: {
      flex,
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 12,
      padding: sizes.PADDING,
      minHeight: sizes.HEIGHT * 0.1, // Dynamic minimum height (10% of screen height)
      marginBottom: sizes.PADDING,
      marginHorizontal: 4,
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 5,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
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
