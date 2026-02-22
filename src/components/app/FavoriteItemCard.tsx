import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import useTheme from '../../styles/theme';
import { scaleWithMax, rtlTransform, isAndroid } from '../../utils';
import { Text } from '../../utils/elements';
import {
  SvgNextIcon,
  SvgVerifiedIcon,
  SvgSpecialPriceTag,
  SvgSpecialPricePercentage,
} from '../../assets/icons';
import { useLocaleStore } from '../../store/reducer/locale';
import { FavStores, Store } from '../../types';

type StoreItem = Store | FavStores;

interface FavoriteItemCardProps {
  item: StoreItem;
  onPress: (item: StoreItem) => void;
  style?: any;
  isFavorite?: boolean;
  onFavoritePress?: () => void;
  showFavorite?: boolean;
}

const FavoriteItemCard: React.FC<FavoriteItemCardProps> = ({
  item,
  onPress,
  style,
  isFavorite,
  onFavoritePress,
  showFavorite = false,
}) => {
  const { isRtl } = useLocaleStore();
  const { theme, styles } = useStyles();

  const isStore = 'StoreId' in item && 'NameEn' in item;
  const storeName = isStore
    ? isRtl
      ? (item as Store).NameAr
      : (item as Store).NameEn
    : isRtl
    ? (item as FavStores).StoreNameAr
    : (item as FavStores).StoreNameEn;
  const businessType = isStore
    ? isRtl
      ? (item as any).BusinessTypeNameAr || (item as Store).BusinessTypeName
      : (item as Store).BusinessTypeName
    : isRtl
    ? (item as FavStores).BusinessTypeNameAr
    : (item as FavStores).BusinessTypeNameEn;

  const placeholderImage = require('../../assets/images/img-placeholder.png');
  const backgroundImage = (item as Store | FavStores).ImageCover
    ? { uri: (item as Store | FavStores).ImageCover! }
    : placeholderImage;
  const overlayImage = (item as Store | FavStores).ImageLogo
    ? { uri: (item as Store | FavStores).ImageLogo! }
    : placeholderImage;
  return (
    <View style={[styles.shadowContainer, style]}>
      <TouchableOpacity
        style={styles.container}
        onPress={() => onPress(item)}
        activeOpacity={0.8}
      >
        <View style={styles.imageWrapper}>
          <Image source={backgroundImage} style={styles.backgroundImage} />
          {item.SpecialPriceMenuApplied && (
            <>
              <SvgSpecialPriceTag
                style={{
                  position: 'absolute',
                  top: 0,
                  right: isRtl ? -2 : 0,
                  zIndex: 10,
                  transform: [{ rotate: isRtl ? '270deg' : '0deg' }],
                }}
              />
              <SvgSpecialPricePercentage
                style={{
                  position: 'absolute',
                  top: scaleWithMax(6, 7),
                  end: scaleWithMax(4, 4),
                  zIndex: 10,
                }}
              />
            </>
          )}

          {/* {showFavorite && onFavoritePress && (
            <TouchableOpacity
              style={styles.favoriteIcon}
              onPress={e => {
                e.stopPropagation();
                onFavoritePress();
              }}
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
          )} */}
        </View>
        <View style={styles.contentOverlay}>
          <View style={styles.overlayImageContainer}>
            <Image source={overlayImage} style={styles.overlayImage} />
          </View>
          <View style={styles.textContainer}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{storeName}</Text>
              {(item as Store | FavStores).isVerified && <SvgVerifiedIcon />}
            </View>

            <Text style={styles.subtitle}>{businessType}</Text>
          </View>
          <View style={styles.iconContainer}>
            <SvgNextIcon
              width={scaleWithMax(15, 18)}
              height={scaleWithMax(15, 18)}
              color={theme.colors.PRIMARY}
              style={{ transform: rtlTransform(isRtl) }}
            />
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default FavoriteItemCard;

const useStyles = () => {
  const theme = useTheme();
  const { sizes } = theme;

  const styles = StyleSheet.create({
    shadowContainer: {
      borderRadius: theme.sizes.BORDER_RADIUS_MID,
      ...theme.globalStyles.SHADOW_STYLE_STORE_CARD,
      // Android requires a background color for elevation to work
      backgroundColor: isAndroid ? theme.colors.WHITE : undefined,
    },
    container: {
      borderRadius: theme.sizes.BORDER_RADIUS_MID,
      overflow: 'hidden',
      backgroundColor: theme.colors.WHITE,
    },
    imageWrapper: {
      position: 'relative',
      width: '100%',
    },
    backgroundImage: {
      width: '100%',
      height: scaleWithMax(115, 120),
      resizeMode: 'cover',
    },
    favoriteIcon: {
      backgroundColor: theme.colors.WHITE,
      borderRadius: 9999,
      width: scaleWithMax(25, 30),
      height: scaleWithMax(25, 30),
      position: 'absolute',
      top: 10,
      right: 10,
      alignItems: 'center',
      justifyContent: 'center',
      ...theme.globalStyles.SHADOW_STYLE,
    },
    contentOverlay: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.sizes.PADDING,
      height: sizes.HEIGHT * 0.08,
      position: 'relative',
    },
    overlayImageContainer: {
      width: scaleWithMax(55, 60),
      height: scaleWithMax(55, 60),
      borderRadius: 9999,
      overflow: 'hidden',
      position: 'absolute',
      top: scaleWithMax(-35, -46),
      start: sizes.WIDTH * 0.028,
      zIndex: 1,
    },
    overlayImage: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      resizeMode: 'stretch',
    },
    textContainer: {
      flex: 1,
    },
    title: {
      ...theme.globalStyles.TEXT_STYLE_SEMIBOLD,
      color: theme.colors.DARK_GRAY,
      fontSize: sizes.FONTSIZE_BUTTON,
      marginBottom: 1,
    },
    subtitle: {
      ...theme.globalStyles.TEXT_STYLE,
      fontSize: sizes.FONTSIZE_MEDIUM,
      color: theme.colors.GRAY,
    },
    iconContainer: {},
    titleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: scaleWithMax(5, 5),
    },
  });

  return {
    styles,
    theme,
  };
};
