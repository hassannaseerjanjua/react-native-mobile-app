import React, { useState, useRef } from 'react';
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
  height?: number;
  borderRadius?: number;
}

const { width: screenWidth } = Dimensions.get('window');

const ImageSlider: React.FC<ImageSliderProps> = ({
  sliders,
  height = 400,
  borderRadius = 12,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const { colors } = useTheme();

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / screenWidth);
    setCurrentIndex(index);
  };

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
    <View style={[styles.container, { height }]}>
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
              style={[
                styles.image,
                {
                  height,
                  borderRadius,
                },
              ]}
              resizeMode="cover"
            />
          </View>
        ))}
      </ScrollView>
      {renderDots()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginVertical: 8,
  },
  scrollView: {
    flex: 1,
  },
  slideContainer: {
    width: screenWidth - 32, // Account for padding
    paddingHorizontal: 16,
  },
  image: {
    width: '100%',
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
});

export default ImageSlider;
