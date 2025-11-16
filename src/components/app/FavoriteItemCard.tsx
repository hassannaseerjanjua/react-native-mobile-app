import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import useTheme from '../../styles/theme';
import { scaleWithMax, rtlTransform } from '../../utils';
import { Text } from '../../utils/elements';
import { SvgNextIcon } from '../../assets/icons';
import { useSizes } from '../../styles/sizes';
import { useLocaleStore } from '../../store/reducer/locale';
import { FavStores, Store } from '../../types';

interface MockStoreItem {
  id: string;
  title: string;
  subtitle: string;
  backgroundImage: any;
  overlayImage: any;
  category?: string;
}

type StoreItem = Store | FavStores | MockStoreItem;

interface FavoriteItemCardProps {
  item: StoreItem;
  onPress: (item: StoreItem) => void;
  style?: any;
}

const FavoriteItemCard: React.FC<FavoriteItemCardProps> = ({
  item,
  onPress,
  style,
}) => {
  const { isRtl } = useLocaleStore();
  const { theme, styles } = useStyles();

  // Check item type
  const isStore = 'StoreId' in item && 'NameEn' in item && 'Documents' in item;
  const isFavStores = 'StoreNameEn' in item && !isStore;
  const isMockItem = 'id' in item && !isStore && !isFavStores;

  // Get values based on type
  let storeName: string;
  let businessType: string;
  let backgroundImage: any;
  let overlayImage: any;

  if (isStore) {
    const store = item as Store;
    const brandLogo = store.Documents.find(
      doc => doc.DocumentType === 'BrandLogo',
    )?.FileUrl;
    const brandLogoAttachment = store.Documents.find(
      doc => doc.DocumentType === 'BrandLogoAttachment',
    )?.FileUrl;

    storeName = store.NameEn;
    businessType = store.BusinessTypeName;
    backgroundImage =
      brandLogoAttachment || brandLogo
        ? { uri: brandLogoAttachment || brandLogo }
        : require('../../assets/images/img-placeholder.png');
    overlayImage = brandLogo
      ? { uri: brandLogo }
      : require('../../assets/images/perfumeHouse.png');
  } else if (isFavStores) {
    const favStore = item as FavStores;
    storeName = favStore.StoreNameEn;
    businessType = favStore.BusinessTypeNameEn;
    backgroundImage = favStore.ImageLogo
      ? { uri: favStore.ImageLogo }
      : require('../../assets/images/img-placeholder.png');
    overlayImage = favStore.ImageCover
      ? { uri: favStore.ImageCover }
      : require('../../assets/images/img-placeholder.png');
  } else {
    const mockItem = item as MockStoreItem;
    storeName = mockItem.title;
    businessType = mockItem.subtitle;
    backgroundImage = mockItem.backgroundImage;
    overlayImage = mockItem.overlayImage;
  }

  return (
    <View style={styles.shadowContainer}>
      <TouchableOpacity
        style={[styles.container, style]}
        onPress={() => onPress(item)}
        activeOpacity={0.8}
      >
        {/* Background Image */}
        <Image source={backgroundImage} style={styles.backgroundImage} />

        {/* Content Overlay */}
        <View style={styles.contentOverlay}>
          {/* Circular Overlay Image */}
          <View style={styles.overlayImageContainer}>
            <Image source={overlayImage} style={styles.overlayImage} />
          </View>

          {/* Text Content */}
          <View style={styles.textContainer}>
            <Text style={styles.title}>{storeName}</Text>
            <Text style={styles.subtitle}>{businessType}</Text>
          </View>

          {/* Navigation Icon */}
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
      ...theme.globalStyles.SHADOW_STYLE,
    },
    container: {
      // marginHorizontal: theme.sizes.PADDING,
      // marginVertical: theme.sizes.PADDING / 2,
      borderRadius: theme.sizes.BORDER_RADIUS_MID,
      overflow: 'hidden',
      backgroundColor: theme.colors.WHITE,
    },
    backgroundImage: {
      width: '100%',
      height: scaleWithMax(115, 120),
      resizeMode: 'cover',
    },
    contentOverlay: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.sizes.PADDING,
      // backgroundColor: theme.colors.RED,
      height: sizes.HEIGHT * 0.08,
      position: 'relative',
    },
    overlayImageContainer: {
      width: scaleWithMax(55, 60),
      height: scaleWithMax(55, 60),
      borderRadius: 9999,
      overflow: 'hidden',
      position: 'absolute',
      top: -sizes.HEIGHT * 0.056,
      start: sizes.WIDTH * 0.028,
      bottom: -sizes.HEIGHT * 0.005,
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
