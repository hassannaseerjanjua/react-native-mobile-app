import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text, Image } from '../../utils/elements';
import useTheme from '../../styles/theme';
import { scaleWithMax } from '../../utils';
import {
  SvgItemFavouriteIcon,
  SvgItemFavouriteIconInActive,
  SvgRiyalIcon,
  SvgRiyalIconPrimary,
  SvgCatchAddIcon,
} from '../../assets/icons';
import PriceWithIcon from '../global/Price';
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
    <View style={styles.container}>
        <View style={styles.imageContainer}>
          <Image
            source={
              itemImage && itemImage.trim()
                ? { uri: itemImage }
                : require('../../assets/images/img-placeholder.png')
            }
            style={styles.image}
          />
          <TouchableOpacity
            style={styles.addContainer}
            onPress={e => {
              e.stopPropagation();
              onPress(item);
            }}
          >
            <SvgCatchAddIcon
              width={scaleWithMax(14, 16)}
              height={scaleWithMax(14, 16)}
            />
          </TouchableOpacity>
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
              <PriceWithIcon
                amount={discountedPrice}
                variant="discounted"
                bold
                icon={
                  <SvgRiyalIconPrimary
                    width={scaleWithMax(11, 13)}
                    height={scaleWithMax(11, 13)}
                  />
                }
                textStyle={styles.discountedPrice}
              />
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
            <PriceWithIcon
              amount={price}
              variant={hasDiscount ? 'cut' : 'default'}
              bold
              icon={
                <SvgRiyalIcon
                  width={
                    hasDiscount ? scaleWithMax(9, 10) : scaleWithMax(11, 13)
                  }
                  height={
                    hasDiscount ? scaleWithMax(9, 10) : scaleWithMax(11, 13)
                  }
                />
              }
              iconOpacity={hasDiscount ? 0.32 : 1}
              textStyle={hasDiscount ? styles.originalPrice : styles.price}
            />
        </View>
      </View>
    </View>
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
        overflow: 'visible',
      },
      imageContainer: {
        position: 'relative',
        height: sizes.HEIGHT * 0.21,
        width: '100%',
        overflow: 'visible',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 2,
      },
      addContainer: {
        overflow: 'visible',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        backgroundColor: colors.WHITE,
        borderRadius: 9999,
        width: scaleWithMax(30, 32),
        height: scaleWithMax(30, 32),
        position: 'absolute',
        bottom: -scaleWithMax(14, 14),
        end: 0,
        alignItems: 'center',
        justifyContent: 'center',
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
        ...theme.globalStyles.TEXT_STYLE_SEMIBOLD,
        color: theme.colors.DARK_GRAY,
        fontSize: scaleWithMax(13, 13),
      },
      subtitle: {
        ...theme.globalStyles.TEXT_STYLE_MEDIUM,
        color: theme.colors.GRAY,
        fontSize: sizes.FONTSIZE_MEDIUM,
        flex: 1,
        minWidth: 0,
        marginEnd: sizes.PADDING * 0.4,
      },
      subTitle2: {
        ...theme.globalStyles.TEXT_STYLE_MEDIUM,
        color: theme.colors.GRAY,
        fontSize: sizes.FONTSIZE_MEDIUM,
        flex: 1,
        minWidth: 0,
        marginEnd: sizes.PADDING * 0.4,
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
      discountedPrice: {
        ...theme.globalStyles.TEXT_STYLE_BOLD,
        color: theme.colors.PRIMARY,
        fontSize: sizes.FONTSIZE_SMALL_HEADING,
        marginEnd: scaleWithMax(1, 2),
      },
      originalPrice: {
        ...theme.globalStyles.TEXT_STYLE_MEDIUM,
        color: '#C6C6C6',
        fontSize: sizes.FONTSIZE_MEDIUM,
        textDecorationLine: 'line-through',
      },
    }),
    theme,
  };
};

export default GiftOneGetOneProductCard;
