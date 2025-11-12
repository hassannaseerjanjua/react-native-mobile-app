import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Text } from '../../utils/elements';
import useTheme from '../../styles/theme';
import { scaleWithMax } from '../../utils';
import {
  GiftIcon,
  PlusIcon,
  SvgItemFavouriteIcon,
  SvgItemFavouriteIconInActive,
  SvgRiyalIcon,
} from '../../assets/icons';
import PriceWithIcon from '../global/Price';

interface FavoriteProductCardProps {
  item: {
    id: string;
    title: string;
    subtitle?: string;
    coverImage: any;
    price: number;
    isFavorite: boolean;
    discountedPrice?: number;
    isGift?: boolean;
    subTitle2?: string;
  };
  isCatch?: boolean;
  onPress: (item: any) => void;
}

const FavoriteProductCard: React.FC<FavoriteProductCardProps> = ({
  item,
  onPress,
  isCatch,
}) => {
  const { theme } = useStyles();
  const { styles } = useStyles();

  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress(item)}>
      <View style={styles.imageContainer}>
        <Image source={item.coverImage} style={styles.image} />
        <View style={styles.favoriteIcon}>
          {item.isFavorite ? (
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
        </View>
        {isCatch && (
          <View style={styles.AddContainer}>
            <PlusIcon />
          </View>
        )}
      </View>

      <View style={styles.contentContainer}>
        <Text
          style={{
            ...styles.title,
            paddingTop: isCatch ? theme.sizes.PADDING * 0.4 : 0,
          }}
          numberOfLines={1}
        >
          {item.title}
        </Text>
        <View
          style={{
            justifyContent: 'space-between',
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          {item.subtitle && (
            <Text style={styles.subtitle} numberOfLines={1}>
              {item.subtitle}
            </Text>
          )}
          {!item.isGift && item.discountedPrice && (
            <View style={{ ...styles.priceContainer }}>
              <SvgRiyalIcon
                width={scaleWithMax(11, 13)}
                height={scaleWithMax(11, 13)}
                style={{
                  marginTop: 3.5,
                }}
              />
              <Text style={styles.discountedPrice}>
                {item.discountedPrice || 100}
              </Text>
            </View>
          )}
        </View>

        <View
          style={{
            justifyContent: 'space-between',
            flexDirection: 'row',
            alignItems: 'center',
            // backgroundColor: theme.colors.RED,
          }}
        >
          {item.subTitle2 && (
            <Text style={styles.subTitle2}>{item.subTitle2}</Text>
          )}

          {!item.isGift && item.discountedPrice ? (
            <View style={{ ...styles.priceContainer, position: 'relative' }}>
              <SvgRiyalIcon
                width={scaleWithMax(7, 8)}
                height={scaleWithMax(7, 8)}
                opacity={0.4}
                style={{
                  marginTop: 3.5,
                }}
              />
              <Text style={styles.originalPrice}>{item.discountedPrice}</Text>
              <View
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  // top: 8,
                  // opacity: 0.4,

                  height: 0.3,
                  backgroundColor: theme.colors.UNDERLINE,
                }}
              />
            </View>
          ) : isCatch && !item.isGift ? (
            <View style={{ ...styles.priceContainer }}>
              <SvgRiyalIcon
                width={scaleWithMax(11, 13)}
                height={scaleWithMax(11, 13)}
                style={{
                  marginTop: 3.5,
                }}
              />
              <Text style={styles.price}>{item.discountedPrice}</Text>
            </View>
          ) : (
            item.isGift && <GiftIcon />
          )}
        </View>
        {!item.isGift && !item.discountedPrice && (
          <View style={{ ...styles.priceContainer }}>
            <SvgRiyalIcon
              width={scaleWithMax(11, 13)}
              height={scaleWithMax(11, 13)}
              style={{
                marginTop: 3.5,
              }}
            />
            <Text style={styles.price}>{item.discountedPrice || 100}</Text>
          </View>
        )}
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
        // marginHorizontal: 4,
      },
      imageContainer: {
        position: 'relative',
        height: sizes.HEIGHT * 0.21,
        width: '100%',
      },
      AddContainer: {
        ...theme.globalStyles.SHADOW_STYLE,
        backgroundColor: colors.WHITE,
        borderRadius: 9999,
        width: scaleWithMax(25, 30),
        height: scaleWithMax(25, 30),
        position: 'absolute',
        bottom: -10,
        right: 0,
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
        ...theme.globalStyles.TEXT_STYLE_BOLD,
        color: '#1A1A1A',
        fontSize: sizes.FONTSIZE_MEDIUM,
      },
      subtitle: {
        ...theme.globalStyles.TEXT_STYLE_SEMIBOLD,
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
        // backgroundColor: 'red',
      },
      price: {
        ...theme.globalStyles.TEXT_STYLE_BOLD,
        color: theme.colors.PRIMARY_TEXT,
        fontSize: sizes.FONTSIZE_BUTTON,
      },
      originalPrice: {
        ...theme.globalStyles.TEXT_STYLE_MEDIUM,
        textDecorationLine: 'line-through',
        color: theme.colors.UNDERLINE,
        fontSize: sizes.FONTSIZE_SMALL,
      },
      discountedPrice: {
        ...theme.globalStyles.TEXT_STYLE_MEDIUM,

        color: theme.colors.PRIMARY,
        fontSize: sizes.FONTSIZE,
      },
    }),
    theme,
  };
};

export default FavoriteProductCard;
