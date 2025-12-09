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
import { CatchItem } from '../../types'; // Update this import path as needed

interface GiftOneGetOneProductCardProps {
  item: CatchItem;
  onPress: (item: CatchItem) => void;
  onFavoritePress?: () => void;
  isFavorite?: boolean;
  hasFavorite?: boolean;
}

const GiftOneGetOneProductCard: React.FC<GiftOneGetOneProductCardProps> = ({
  item,
  onPress,
  isFavorite,
  onFavoritePress,
  hasFavorite,
}) => {
  const { theme } = useStyles();
  const { styles } = useStyles();

  const itemImage = item.ItemImage;
  const itemName = item.ItemNameEn;
  const categoryName = item.CategoryNameEn;
  const price = item.ItemPrice || 0;
  const discountedPrice = item.DiscountedPrice;
  const hasDiscount =
    discountedPrice && discountedPrice > 0 && discountedPrice < price;

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
        <View
          style={{
            justifyContent: 'space-between',
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Text style={styles.subtitle} numberOfLines={1}>
            {categoryName}
          </Text>
          {hasDiscount && (
            <View style={styles.priceContainer}>
              <SvgRiyalIcon
                width={scaleWithMax(9, 11)}
                height={scaleWithMax(9, 11)}
              />
              <Text style={styles.originalPrice}>{price}</Text>
            </View>
          )}
        </View>
        <View style={styles.priceContainer}>
          <SvgRiyalIcon
            width={scaleWithMax(11, 13)}
            height={scaleWithMax(11, 13)}
            style={{
              marginTop: 3.5,
            }}
          />
          <Text style={styles.price}>
            {hasDiscount ? discountedPrice : price}
          </Text>
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
      originalPrice: {
        ...theme.globalStyles.TEXT_STYLE_MEDIUM,
        textDecorationLine: 'line-through',
        color: '#A0A0A0',
        fontSize: sizes.FONTSIZE_SMALL,
      },
    }),
    theme,
  };
};

export default GiftOneGetOneProductCard;
