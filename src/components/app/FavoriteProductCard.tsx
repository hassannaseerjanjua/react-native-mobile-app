import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Text } from '../../utils/elements';
import useTheme from '../../styles/theme';
import { scaleWithMax } from '../../utils';
import { SvgFavouriteActive, SvgRiyalIcon } from '../../assets/icons';

interface FavoriteProductCardProps {
  item: {
    id: string;
    title: string;
    subtitle: string;
    coverImage: any;
    price: number;
    isFavorite: boolean;
  };
  onPress: (item: any) => void;
}

const FavoriteProductCard: React.FC<FavoriteProductCardProps> = ({
  item,
  onPress,
}) => {
  const { theme } = useStyles();
  const { styles } = useStyles();

  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress(item)}>
      <View style={styles.imageContainer}>
        <Image source={item.coverImage} style={styles.image} />
        <View style={styles.favoriteIcon}>
          <SvgFavouriteActive width={20} height={20} />
        </View>
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {item.subtitle}
        </Text>
        <View style={styles.priceContainer}>
          <SvgRiyalIcon width={12} height={12} />
          <Text style={styles.price}>{item.price}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const useStyles = () => {
  const theme = useTheme();
  const { colors, sizes } = theme;

  return {
    styles: StyleSheet.create({
      container: {
        backgroundColor: colors.WHITE,
        borderRadius: 12,
        marginBottom: sizes.HEIGHT * 0.015,
        flex: 1,
        marginHorizontal: 4,
      },
      imageContainer: {
        position: 'relative',
        height: sizes.HEIGHT * 0.2,
        width: '100%',
      },
      image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
        borderRadius: 12,
      },
      favoriteIcon: {
        position: 'absolute',
        top: 10,
        right: 10,
        alignItems: 'center',
        justifyContent: 'center',
      },
      contentContainer: {
        padding: sizes.WIDTH * 0.01,
        paddingTop: sizes.HEIGHT * 0.006,
      },
      title: {
        ...theme.globalStyles.TEXT_STYLE_MEDIUM,
        color: '#1A1A1A',
        fontSize: sizes.FONTSIZE_MEDIUM,
      },
      subtitle: {
        ...theme.globalStyles.TEXT_STYLE_MEDIUM,
        color: '#A0A0A0',
        fontSize: sizes.FONTSIZE_MEDIUM,
      },
      priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
      },
      price: {
        ...theme.globalStyles.TEXT_STYLE_BOLD,
        color: theme.colors.PRIMARY_TEXT,
        fontSize: sizes.FONTSIZE_MEDIUM,
      },
    }),
    theme,
  };
};

export default FavoriteProductCard;
