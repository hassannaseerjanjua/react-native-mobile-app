import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  View,
  ScrollView,
  Dimensions,
  StyleSheet,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ImageSourcePropType,
  ViewStyle,
} from 'react-native';
import { Slider } from '../../types';
import useTheme from '../../styles/theme';
import { Text, Image } from '../../utils/elements';
import { SvgPlaceholderImage } from '../../assets/icons';
import { isIOS, isIOSThen } from '../../utils';
import { useLocaleStore } from '../../store/reducer/locale';

interface ImageSliderProps {
  sliders?: ImageSourcePropType[] | undefined;
  loading?: boolean;
  error?: string | null;
  contentContainerStyle?: ViewStyle;
}

const ProductImageSlider: React.FC<ImageSliderProps> = ({
  sliders = [],
  loading,
  error,
  contentContainerStyle,
}) => {
  const { styles, theme } = useStyles();
  const { getString } = useLocaleStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const { colors } = useTheme();

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / theme.sizes.PADDED_WIDTH);
    setCurrentIndex(index);
  };

  const renderDots = () => {
    if (sliders?.length <= 1) return null;

    return (
      <View style={styles.dotsContainer}>
        {sliders?.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor:
                  index === currentIndex ? colors.BACKGROUND : '#E0E0E0',
              },
            ]}
          />
        ))}
      </View>
    );
  };

  if (loading) {
    const placeholderImage = require('../../assets/images/img-placeholder.png');
    return (
      <View style={[styles.container, styles.stateContainer]}>
        <Image source={placeholderImage} style={styles.image} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.stateContainer]}>
        <Text style={styles.stateText}>{getString('COMP_IMAGE_LOAD_FAILED')}</Text>
      </View>
    );
  }

  if (sliders?.length === 0) {
    return (
      <View style={[styles.container, styles.stateContainer]}>
        <Text style={styles.stateText}>{getString('COMP_NO_IMAGES_FOUND')}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, contentContainerStyle]}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {sliders?.map((slider, index) => (
          <View key={index} style={styles.slideContainer}>
            <Image source={slider} style={styles.image} resizeMode="cover" />
          </View>
        ))}
      </ScrollView>
      {renderDots()}
    </View>
  );
};

const useStyles = () => {
  const theme = useTheme();
  const isProMax = theme.sizes.WIDTH > 430 && isIOS;
  const isBaseModel = theme.sizes.WIDTH < 430 && isIOS;
  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          position: 'relative',
          height: isProMax
            ? theme.sizes.HEIGHT * 0.42
            : isBaseModel
            ? theme.sizes.HEIGHT * 0.45
            : theme.sizes.HEIGHT * 0.45,
        },
        scrollView: {
          flex: 1,
        },
        slideContainer: {
          width: theme.sizes.WIDTH,
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          borderBottomEndRadius: theme.sizes.BORDER_RADIUS_HIGH,
          borderBottomStartRadius: theme.sizes.BORDER_RADIUS_HIGH,
          overflow: 'hidden',
        },
        image: {
          width: '100%',
          height: '100%',
        },
        dotsContainer: {
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'absolute',
          bottom: 12,
          left: 0,
          right: 0,
        },
        dot: {
          width: 8,
          height: 8,
          borderRadius: 99999,
          marginHorizontal: 3,
        },
        stateContainer: {
          backgroundColor: '#f0f0f0',
          justifyContent: 'center',
          alignItems: 'center',
          borderBottomEndRadius: theme.sizes.BORDER_RADIUS_MID,
          overflow: 'hidden',
        },
        stateText: {
          color: '#666',
        },
      }),
    [theme],
  );

  return {
    styles,
    theme,
  };
};

export default ProductImageSlider;
