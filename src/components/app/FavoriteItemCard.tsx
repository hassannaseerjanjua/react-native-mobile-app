import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import useTheme from '../../styles/theme';
import { scaleWithMax, rtlTransform, isAndroid } from '../../utils';
import { Text } from '../../utils/elements';
import {
  SvgNextIcon,
  SvgItemFavouriteIcon,
  SvgItemFavouriteIconInActive,
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
    ? (item as Store).NameEn
    : (item as FavStores).StoreNameEn;
  const businessType = isStore
    ? (item as Store).BusinessTypeName
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
            <Text style={styles.title}>{storeName}</Text>
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
      color: '#1A1A1A',
      fontSize: sizes.FONTSIZE_BUTTON,
      marginBottom: 1,
    },
    subtitle: {
      ...theme.globalStyles.TEXT_STYLE,
      fontSize: sizes.FONTSIZE_MEDIUM,
      color: '#808080',
    },
    iconContainer: {},
  });

  return {
    styles,
    theme,
  };
};
