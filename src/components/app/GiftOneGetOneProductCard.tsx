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
} from '../../assets/icons';
import { CatchItem } from '../../types';
import { useLocaleStore } from '../../store/reducer/locale';

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
  const { isRtl } = useLocaleStore();

  const itemImage = item.ItemImage;
  const itemName = isRtl ? item.ItemNameAr : item.ItemNameEn;
  const storeName = isRtl ? item.StoreNameAr : item.StoreNameEn;
  const categoryName = isRtl ? item.CategoryNameAr : item.CategoryNameEn;
  const price = item.ItemPrice || 0;
  const discountedPrice = item.FinalPrice;
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
        <View
          style={{
            justifyContent: 'space-between',
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Text style={styles.title} numberOfLines={1}>
            {itemName}
          </Text>
        </View>

        <View
          style={{
            justifyContent: 'space-between',
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Text style={styles.subtitle} numberOfLines={1}>
            {storeName}
          </Text>
          {hasDiscount && (
            <View style={styles.priceContainer}>
              <SvgRiyalIconPrimary
                width={scaleWithMax(11, 12)}
                height={scaleWithMax(11, 12)}
                style={{
                  marginTop: theme.sizes.HEIGHT * 0.003,
                }}
              />
              <Text style={styles.price}>{discountedPrice}</Text>
            </View>
          )}
        </View>

        <View
          style={{
            justifyContent: 'space-between',
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          {categoryName && (
            <Text style={styles.subTitle2} numberOfLines={1}>
              {categoryName}
            </Text>
          )}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
            <SvgRiyalIcon
              opacity={0.5}
              width={scaleWithMax(10, 12)}
              height={scaleWithMax(10, 12)}
            />
            <Text style={hasDiscount ? styles.originalPrice : styles.price}>
              {price}
            </Text>
          </View>
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
        marginVertical: sizes.HEIGHT * 0.0016,
      },
      subtitle: {
        ...theme.globalStyles.TEXT_STYLE_MEDIUM,
        color: '#A0A0A0',
        fontSize: sizes.FONTSIZE_MEDIUM,
      },
      subTitle2: {
        ...theme.globalStyles.TEXT_STYLE_MEDIUM,
        color: '#A0A0A0',
        fontSize: sizes.FONTSIZE_SMALL,
      },
      priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
      },
      price: {
        ...theme.globalStyles.TEXT_STYLE_BOLD,
        color: theme.colors.PRIMARY,
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
