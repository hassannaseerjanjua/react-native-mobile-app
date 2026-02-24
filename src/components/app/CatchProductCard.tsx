import React from 'react';
import {
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Text } from '../../utils/elements';
import useTheme from '../../styles/theme';
import { scaleWithMax } from '../../utils';
import {
  GiftIcon,
  SvgAddOccasion,
  SvgCatchAddIcon,
  SvgGiftClaimIcon,
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
    catchItem?: any;
  };
  onPress: (item: any) => void;
  onCatchPress?: (item: any) => void;
  loading?: boolean;
}

const CatchProductCard: React.FC<FavoriteProductCardProps> = ({
  item,
  onPress,
  onCatchPress,
  loading,
}) => {
  const { theme } = useStyles();
  const { styles } = useStyles();

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={() => onPress(item)}
      style={styles.container}
    >
      <View style={styles.imageContainer}>
        <Image source={item.coverImage} style={styles.image} />
        <TouchableOpacity
          style={styles.AddContainer}
          onPress={e => {
            e.stopPropagation();
            if (onCatchPress) {
              onCatchPress(item);
            }
          }}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={theme.colors.PRIMARY} />
          ) : (
            <SvgCatchAddIcon
              width={scaleWithMax(14, 16)}
              height={scaleWithMax(14, 16)}
            />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.title} numberOfLines={1}>
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
        </View>

        <View
          style={{
            justifyContent: 'space-between',
            flexDirection: 'row',
            alignItems: 'center',
            position: 'relative',
          }}
        >
          {item.subTitle2 && (
            <Text style={styles.subTitle2}>{item.subTitle2}</Text>
          )}

          <View
            style={{
              position: 'absolute',
              end: 0,
              top: -scaleWithMax(7, 8),
            }}
          >
            <SvgGiftClaimIcon />
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
        ...theme.globalStyles.SHADOW_STYLE_INPUT,
      },
      AddContainer: {
        ...theme.globalStyles.SHADOW_STYLE_SEARCH_BAR,
        overflow: 'visible',
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
        ...theme.globalStyles.TEXT_STYLE_MEDIUM,
        color: theme.colors.DARK_GRAY,
        fontSize: scaleWithMax(12, 13),
      },
      subtitle: {
        ...theme.globalStyles.TEXT_STYLE_MEDIUM,
        color: theme.colors.GRAY,
        fontSize: sizes.FONTSIZE_MEDIUM,
      },
      subTitle2: {
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

export default CatchProductCard;
