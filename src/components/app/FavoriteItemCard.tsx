import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import useTheme from '../../styles/theme';
import { scaleWithMax, rtlTransform } from '../../utils';
import { Text } from '../../utils/elements';
import { SvgNextIcon } from '../../assets/icons';
import { useSizes } from '../../styles/sizes';
import { useLocaleStore } from '../../store/reducer/locale';
import { FavStores } from '../../types';

interface MockStoreItem {
  id: string;
  title: string;
  subtitle: string;
  backgroundImage: any;
  overlayImage: any;
  category?: string;
}

type StoreItem = FavStores | MockStoreItem;

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

  // Check if item is FavStores (API) or MockStoreItem
  const isFavStores = 'StoreNameEn' in item;
  
  // Get values based on type
  const storeName = isFavStores ? item.StoreNameEn : item.title;
  const businessType = isFavStores ? item.BusinessTypeNameEn : item.subtitle;
  const backgroundImage = isFavStores 
    ? (item.ImageLogo ? { uri: item.ImageLogo } : require('../../assets/images/perfumeHouseCover.png'))
    : item.backgroundImage;
  const overlayImage = isFavStores
    ? (item.ImageCover ? { uri: item.ImageCover } : require('../../assets/images/perfumeHouse.png'))
    : item.overlayImage;

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={() => onPress(item)}
      activeOpacity={0.8}
    >
      {/* Background Image */}
      <Image
        source={backgroundImage}
        style={styles.backgroundImage}
      />

      {/* Content Overlay */}
      <View style={styles.contentOverlay}>
        {/* Circular Overlay Image */}
        <View style={styles.overlayImageContainer}>
          <Image
            source={overlayImage}
            style={styles.overlayImage}
          />
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
  );
};

export default FavoriteItemCard;

const useStyles = () => {
  const theme = useTheme();
  const { sizes } = theme;

  const styles = StyleSheet.create({
    container: {
      // marginHorizontal: theme.sizes.PADDING,
      // marginVertical: theme.sizes.PADDING / 2,
      borderRadius: theme.sizes.BORDER_RADIUS_MID,
      overflow: 'hidden',
      backgroundColor: theme.colors.WHITE,
      shadowColor: 'lightgray',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
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
