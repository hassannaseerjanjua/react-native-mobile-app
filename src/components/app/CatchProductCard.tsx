import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Text } from '../../utils/elements';
import useTheme from '../../styles/theme';
import { scaleWithMax } from '../../utils';
import {
  GiftIcon,
  SvgAddOccasion,
  SvgCatchAddIcon,
  SvgRiyalIcon,
} from '../../assets/icons';

interface FavoriteProductCardProps {
  item: {
    id: string;
    title: string;
    subtitle: any;
    coverImage: any;
    category: string;
    description: string;
    price: number;
    discountedPrice: number;
    isGift: boolean;
    subTitle2: string;
  };
  onPress: (item: any) => void;
}

const CatchProductCard: React.FC<FavoriteProductCardProps> = ({
  item,
  onPress,
}) => {
  const { theme } = useStyles();
  const { styles } = useStyles();

  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress(item)}>
      <View style={styles.imageContainer}>
        <Image source={item.coverImage} style={styles.image} />
        <TouchableOpacity style={styles.AddContainer}>
          <SvgCatchAddIcon
            width={scaleWithMax(15, 16)}
            height={scaleWithMax(15, 16)}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.contentContainer}>
        <Text
          style={{
            ...styles.title,
            paddingTop: theme.sizes.PADDING * 0.4,
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
          {/* Cut price (original price with strikethrough) in same row as category */}
          {!item.isGift &&
            item.discountedPrice &&
            item.discountedPrice > 0 &&
            item.discountedPrice < item.price && (
              <View style={styles.priceContainer}>
                <SvgRiyalIcon
                  width={scaleWithMax(9, 11)}
                  height={scaleWithMax(9, 11)}
                />
                <Text style={styles.originalPrice}>{item.price}</Text>
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
          {item.subTitle2 && (
            <Text style={styles.subTitle2}>{item.subTitle2}</Text>
          )}

          {!item.isGift ? (
            <View style={styles.priceContainer}>
              <SvgRiyalIcon
                width={scaleWithMax(11, 13)}
                height={scaleWithMax(11, 13)}
              />
              <Text style={styles.discountedPrice}>
                {item.discountedPrice && item.discountedPrice > 0
                  ? item.discountedPrice
                  : item.price}
              </Text>
            </View>
          ) : (
            item.isGift && <GiftIcon />
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
        width: scaleWithMax(28, 32),
        height: scaleWithMax(28, 32),
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
      discountedPrice: {
        ...theme.globalStyles.TEXT_STYLE_BOLD,
        color: theme.colors.PRIMARY,
        fontSize: sizes.FONTSIZE_BUTTON,
      },
    }),
    theme,
  };
};

export default CatchProductCard;
