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

interface ImageSliderProps {
  sliders: Slider[];
}

const ImageSlider: React.FC<ImageSliderProps> = ({ sliders }) => {
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
    if (index >= sliders.length) {
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
    if (sliders.length <= 1) return null;

    return (
      <View style={styles.dotsContainer}>
        {sliders.map((_, index) => (
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

  if (sliders.length === 0) {
    return null;
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
        {sliders.map((slider, index) => (
          <View key={slider.SliderId} style={styles.slideContainer}>
            <Image
              source={{ uri: slider.ImageUrl }}
              style={[styles.image]}
              resizeMode="contain"
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
  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          position: 'relative',
          width: theme.sizes.PADDED_WIDTH,
          aspectRatio: 5 / 4,
          marginTop: theme.sizes.PADDING * 0.6,
        },
        scrollView: {
          flex: 1,
        },
        slideContainer: {
          width: theme.sizes.PADDED_WIDTH,
          aspectRatio: 5 / 4,
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: theme.sizes.BORDER_RADIUS_MID,

          overflow: 'hidden',
        },
        image: {
          width: '100%',
          height: '100%',
          objectFit: 'cover',
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
      }),
    [theme],
  );

  return {
    styles,
    theme,
  };
};

export default ImageSlider;
