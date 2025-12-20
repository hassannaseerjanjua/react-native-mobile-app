import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Text } from '../../utils/elements';
import useTheme from '../../styles/theme';
import { scaleWithMax } from '../../utils';
import {
  SvgItemFavouriteIcon,
  SvgItemFavouriteIconInActive,
  SvgRiyalIcon,
} from '../../assets/icons';
import { FaveItems, StoreProduct } from '../../types';

interface FavoriteProductCardProps {
  item: FaveItems | StoreProduct;
  onPress: (item: FaveItems | StoreProduct) => void;
  onFavoritePress?: () => void;
  isFavorite?: boolean;
  hasFavorite?: boolean;
}

const FavoriteProductCard: React.FC<FavoriteProductCardProps> = ({
  item,
  onPress,
  isFavorite,
  onFavoritePress,
  hasFavorite,
}) => {
  const { theme } = useStyles();
  const { styles } = useStyles();

  const isStoreProduct = 'ItemId' in item && 'Thumbnail' in item;
  const isFaveItems = 'FavItemId' in item && 'ItemImage' in item;

  const itemImage = isStoreProduct
    ? (item as StoreProduct).Thumbnail
    : isFaveItems
    ? (item as FaveItems).ItemImage
    : null;
  const itemName = isStoreProduct
    ? (item as StoreProduct).NameEn
    : isFaveItems
    ? (item as FaveItems).ItemNameEn
    : '';
  const categoryName = isStoreProduct
    ? (item as StoreProduct).CategoryNameEn
    : isFaveItems
    ? (item as FaveItems).CategoryNameEn
    : '';
  const price =
    (item as StoreProduct).Variants?.length > 0
      ? (item as StoreProduct).Variants.find(v => v.IsDefault)?.FinalPrice ||
        (item as StoreProduct).Price
      : (item as StoreProduct).Price || 0;

  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress(item)}>
      <View style={styles.imageContainer}>
        <Image
          source={
            itemImage && itemImage.trim()
              ? { uri: itemImage }
              : require('../../assets/images/img-placeholder.png')
          }
          style={styles.image}
        />
        {hasFavorite && (
          <TouchableOpacity
            style={styles.favoriteIcon}
            onPress={onFavoritePress}
          >
            {isFavorite ? (
              <SvgItemFavouriteIcon
                width={scaleWithMax(14, 16)}
                height={scaleWithMax(14, 16)}
              />
            ) : (
              <SvgItemFavouriteIconInActive
                width={scaleWithMax(14, 16)}
                height={scaleWithMax(14, 16)}
              />
            )}
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {itemName}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {categoryName}
        </Text>
        <View style={styles.priceContainer}>
          <SvgRiyalIcon
            width={scaleWithMax(11, 13)}
            height={scaleWithMax(11, 13)}
            style={{
              marginTop: 3.5,
            }}
          />
          <Text style={styles.price}>{price || 'N/A'}</Text>
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
        marginBottom: sizes.HEIGHT * 0.018,
        flex: 1,
        maxWidth: '48%',
      },
      imageContainer: {
        position: 'relative',
        height: sizes.HEIGHT * 0.21,
        width: '100%',
      },

      image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
        borderRadius: 12,
      },
      favoriteIcon: {
        backgroundColor: colors.WHITE,
        borderRadius: 9999,
        width: scaleWithMax(25, 30),
        height: scaleWithMax(25, 30),
        position: 'absolute',
        top: 10,
        right: 10,
        alignItems: 'center',
        justifyContent: 'center',
      },
      contentContainer: {
        padding: sizes.WIDTH * 0.004,
        paddingTop: sizes.HEIGHT * 0.006,
      },
      title: {
        ...theme.globalStyles.TEXT_STYLE_MEDIUM,
        color: '#1A1A1A',
        fontSize: scaleWithMax(12, 13),
      },
      subtitle: {
        ...theme.globalStyles.TEXT_STYLE_MEDIUM,
        color: '#A0A0A0',
        fontSize: sizes.FONTSIZE_MEDIUM,
      },

      priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
      },
      price: {
        ...theme.globalStyles.TEXT_STYLE_BOLD,
        color: theme.colors.PRIMARY_TEXT,
        fontSize: sizes.FONTSIZE_BUTTON,
      },
    }),
    theme,
  };
};

export default FavoriteProductCard;
