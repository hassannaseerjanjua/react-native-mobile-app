import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Text } from '../../utils/elements';
import useTheme from '../../styles/theme';
import { scaleWithMax } from '../../utils';
import {
  SvgItemFavouriteIcon,
  SvgItemFavouriteIconInActive,
  SvgRiyalIcon,
  SvgRiyalIconPrimary,
  SvgRiyalPink,
} from '../../assets/icons';
import { FaveItems, StoreProduct } from '../../types';
import { useLocaleStore } from '../../store/reducer/locale';

interface FavoriteProductCardProps {
  item: FaveItems | StoreProduct;
  onPress: (item: FaveItems | StoreProduct) => void;
  onFavoritePress?: () => void;
  isFavorite?: boolean;
  hasFavorite?: boolean;
  isFavoriteTab?: boolean;
}

const FavoriteProductCard: React.FC<FavoriteProductCardProps> = ({
  item,
  onPress,
  isFavorite,
  onFavoritePress,
  hasFavorite,
  isFavoriteTab,
}) => {
  const { theme } = useStyles();
  const { styles } = useStyles();
  const { isRtl } = useLocaleStore();
  const isStoreProduct = 'ItemId' in item && 'Thumbnail' in item;
  const isFaveItems = 'FavItemId' in item && 'ItemImage' in item;

  const itemImage = isStoreProduct
    ? (item as StoreProduct).Thumbnail
    : isFaveItems
      ? (item as FaveItems).ItemImage
      : null;
  const itemName = isStoreProduct
    ? isRtl
      ? (item as StoreProduct).NameAr
      : (item as StoreProduct).NameEn
    : isFaveItems
      ? isRtl
        ? (item as FaveItems).ItemNameAr
        : (item as FaveItems).ItemNameEn
      : '';
  const categoryName = isStoreProduct
    ? isRtl
      ? (item as StoreProduct).CategoryNameAr
      : (item as StoreProduct).CategoryNameEn
    : isFaveItems
      ? isRtl
        ? (item as FaveItems).CategoryNameAr
        : (item as FaveItems).CategoryNameEn
      : '';
  const price =
    (item as StoreProduct).Variants?.length > 0
      ? (item as StoreProduct).Variants.find(v => v.IsDefault)?.FinalPrice ||
      (item as StoreProduct).Price
      : 0;


  const defaultVariant = (item as StoreProduct).Variants?.find(
    v => v.IsDefault,
  );
  const cutPrice =
    (item as StoreProduct).Variants?.length > 0 && defaultVariant
      ? (defaultVariant.FinalPrice ?? 0) - (defaultVariant.DiscountedPrice ?? 0) ||
      (item as StoreProduct).Price
      : 0;

  const isSpecialPrice = item.Campaign !== null;
  // console.log(defaultVariant)
  // console.log(cutPrice)
  // console.log(price)

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
          {isSpecialPrice && (
            <>
              <SvgRiyalPink
                width={scaleWithMax(11, 13)}
                height={scaleWithMax(11, 13)}
                style={{
                  marginTop: 3.5,
                }}
              />
              <Text style={styles.discountedPrice}>{cutPrice}</Text>
            </>
          )}

          {!isFavoriteTab && (
            <>
              <SvgRiyalIcon
                width={isSpecialPrice ? scaleWithMax(9, 10) : scaleWithMax(11, 13)}
                height={isSpecialPrice ? scaleWithMax(9, 10) : scaleWithMax(11, 13)}
                opacity={isSpecialPrice ? 0.32 : 1}
              />
            </>
          )}
          {!isFavoriteTab && (
            <Text style={isSpecialPrice ? styles.cutPrice : styles.price}>{(isFavoriteTab ? cutPrice : price) || 'N/A'}</Text>
          )}

          {isFavoriteTab && (
            <>
              <View style={styles.priceContainer}>

                <SvgRiyalPink
                  width={scaleWithMax(11, 13)}
                  height={scaleWithMax(11, 13)}
                  style={{
                    marginTop: 3.5,
                  }}
                />
                <Text style={styles.discountedPrice}>{cutPrice}</Text>
                <Text style={styles.cutPrice}>{price}</Text>

              </View>
            </>
          )}
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
        color: theme.colors.DARK_GRAY,
        fontSize: scaleWithMax(12, 13),
      },
      subtitle: {
        ...theme.globalStyles.TEXT_STYLE_MEDIUM,
        color: theme.colors.GRAY,
        fontSize: sizes.FONTSIZE_MEDIUM,
      },

      priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scaleWithMax(2, 3),
      },
      price: {
        ...theme.globalStyles.TEXT_STYLE_BOLD,
        color: theme.colors.PRIMARY_TEXT,
        fontSize: sizes.FONTSIZE_BUTTON,
      },
      cutPrice: {
        ...theme.globalStyles.TEXT_STYLE_MEDIUM,
        color: '#C6C6C6',
        fontSize: sizes.FONTSIZE_MEDIUM,
        textDecorationLine: 'line-through',
      },
      discountedPrice: {
        ...theme.globalStyles.TEXT_STYLE_BOLD,
        color: theme.colors.PRIMARY,
        fontSize: sizes.FONTSIZE_SMALL_HEADING,
        marginEnd: scaleWithMax(1, 2),
      },
    }),
    theme,
  };
};

export default FavoriteProductCard;
