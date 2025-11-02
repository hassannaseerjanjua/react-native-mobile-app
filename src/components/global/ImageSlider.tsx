import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  View,
  Image,
  ScrollView,
  Dimensions,
  StyleSheet,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { Slider } from '../../types';
import useTheme from '../../styles/theme';
import { Text } from '../../utils/elements';
import { SvgPlaceholderImage } from '../../assets/icons';
import { isIOS, isIOSThen } from '../../utils';

interface ImageSliderProps {
  sliders?: Slider[] | undefined;
  loading?: boolean;
  error?: string | null;
}

const ImageSlider: React.FC<ImageSliderProps> = ({
  sliders = [],
  loading,
  error,
}) => {
  const { styles, theme } = useStyles();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const { colors } = useTheme();

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / theme.sizes.PADDED_WIDTH);
    setCurrentIndex(index);
  };

  const scrollToIndex = (index: number) => {
    if (!scrollViewRef.current) return;
    if (index >= sliders?.length) {
      index = 0;
    }
    scrollViewRef.current.scrollTo({
      x: index * theme.sizes.PADDED_WIDTH,
      y: 0,
      animated: true,
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      scrollToIndex(currentIndex + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, [currentIndex]);

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
                  index === currentIndex ? colors.PRIMARY : '#E0E0E0',
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
        <Text style={styles.stateText}>Failed to load images</Text>
      </View>
    );
  }

  if (sliders?.length === 0) {
    return (
      <View style={[styles.container, styles.stateContainer]}>
        <Text style={styles.stateText}>No images found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container]}>
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
          <View key={slider.SliderId} style={styles.slideContainer}>
            <Image
              source={{ uri: slider.ImageUrl }}
              style={[styles.image]}
              resizeMode="cover"
            />
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
          width: theme.sizes.PADDED_WIDTH,
          height: isProMax
            ? theme.sizes.HEIGHT * 0.387
            : isBaseModel
            ? theme.sizes.HEIGHT * 0.345
            : theme.sizes.HEIGHT * 0.345,
          marginTop: theme.sizes.PADDING * 0.6,
          flex: 1,
        },
        scrollView: {
          flex: 1,
        },
        slideContainer: {
          width: theme.sizes.PADDED_WIDTH,
          // height: theme.sizes.HEIGHT * 0.34,
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: theme.sizes.BORDER_RADIUS_MID,
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
          borderRadius: theme.sizes.BORDER_RADIUS_MID,
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

export default ImageSlider;
