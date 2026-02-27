import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  View,
  FlatList,
  Dimensions,
  StyleSheet,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { Slider } from '../../types';
import useTheme from '../../styles/theme';
import { Text, Image } from '../../utils/elements';
import { SvgPlaceholderImage } from '../../assets/icons';
import { isIOS, isIOSThen } from '../../utils';
import { useLocaleStore } from '../../store/reducer/locale';

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
  const { getString } = useLocaleStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const { colors } = useTheme();

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const slideWidth = theme.sizes.PADDED_WIDTH + theme.sizes.PADDING;
    const index = Math.round(contentOffsetX / slideWidth);
    setCurrentIndex(index);
  };

  const scrollToIndex = (index: number) => {
    if (!flatListRef.current || !sliders?.length) return;
    if (index >= sliders.length) {
      index = 0;
    }
    flatListRef.current.scrollToIndex({
      index,
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

  if (loading || error || sliders?.length === 0) {
    const placeholderImage = require('../../assets/images/img-placeholder.png');
    return (
      <View style={[styles.container, styles.stateContainer]}>
        <View style={styles.placeholderOuter}>
          <View style={styles.placeholderSlide}>
            <View style={styles.imageWrapper}>
              <Image source={placeholderImage} style={styles.image} />
            </View>
          </View>
        </View>
      </View>
    );
  }

  // if (error) {
  //   return (
  //     <View style={[styles.container, styles.stateContainer]}>
  //       <Text style={styles.stateText}>{getString('COMP_IMAGE_LOAD_FAILED')}</Text>
  //     </View>
  //   );
  // }

  // if (sliders?.length === 0) {
  //   return (
  //     <View style={[styles.container, styles.stateContainer]}>
  //       <Text style={styles.stateText}>{getString('COMP_NO_IMAGES_FOUND')}</Text>
  //     </View>
  //   );
  // }

  return (
    <View style={[styles.container]}>
      <FlatList
        ref={flatListRef}
        data={sliders}
        horizontal
        pagingEnabled={false}
        snapToInterval={theme.sizes.PADDED_WIDTH + theme.sizes.PADDING}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        keyExtractor={item => item.SliderId.toString()}
        renderItem={({ item: slider, index }) => (
          <View style={styles.slideContainer}>
            <View style={styles.imageWrapper}>
              <Image
                source={{ uri: slider.ImageUrl }}
                style={[styles.image]}
                resizeMode="cover"
              />
            </View>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        getItemLayout={(_, index) => {
          const slideWidth = theme.sizes.PADDED_WIDTH + theme.sizes.PADDING;
          return {
            length: slideWidth,
            offset: slideWidth * index,
            index,
          };
        }}
        onScrollToIndexFailed={info => {
          const wait = new Promise<void>(resolve =>
            setTimeout(() => resolve(), 500),
          );
          wait.then(() => {
            flatListRef.current?.scrollToIndex({
              index: info.index,
              animated: true,
            });
          });
        }}
      />
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
          width: theme.sizes.WIDTH,
          // height: isProMax
          //   ? theme.sizes.HEIGHT * 0.387
          //   : isBaseModel
          //   ? theme.sizes.HEIGHT * 0.345
          //   : theme.sizes.HEIGHT * 0.345,
          // marginTop: theme.sizes.PADDING * 0.6,
          flex: 1,
        },
        scrollView: {
          flex: 1,
        },
        scrollViewContent: {
          paddingHorizontal: theme.sizes.PADDING,
        },
        slideContainer: {
          width: theme.sizes.PADDED_WIDTH,
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        },
        separator: {
          width: theme.sizes.PADDING,
        },
        firstSlide: {},
        imageWrapper: {
          width: '100%',
          height: '100%',
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
          width: theme.sizes.PADDED_WIDTH,
          height: '100%',
          borderRadius: theme.sizes.BORDER_RADIUS_MID,
          overflow: 'hidden',
          alignSelf: 'center',
        },
        placeholderOuter: {
          paddingHorizontal: theme.sizes.PADDING,
          width: '100%',
          height: '100%',
        },
        placeholderSlide: {
          width: theme.sizes.PADDED_WIDTH,
          height: '100%',
          alignSelf: 'center',
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
