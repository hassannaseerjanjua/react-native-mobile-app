import React, { useEffect, useMemo, useRef } from 'react';
import { View, StyleSheet, Dimensions, Image as RNImage } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
} from 'react-native-reanimated';
import useTheme from '../../styles/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const HORIZONTAL_INSET = 16;
const HANDLE_WIDTH = 16;
const BORDER_WIDTH = 3;
const TRACK_HEIGHT = 60;
const TRACK_WIDTH = SCREEN_WIDTH - HORIZONTAL_INSET * 2;
const PLAYHEAD_WIDTH = 3;
const GRIP_LINE_COUNT = 3;
const GRIP_LINE_HEIGHT = 14;
const GRIP_LINE_WIDTH = 2;
const GRIP_LINE_GAP = 2;
const MIN_HANDLE_DISTANCE = 4;

const MAX_TRIM_DURATION = 15;

interface TrimmerProps {
  totalDuration: number;
  trimStart: number;
  trimEnd: number;
  onTrimChange: (start: number, end: number) => void;
  thumbnails: string[];
}

export default function useTrimmer({
  totalDuration,
  trimStart,
  trimEnd,
  onTrimChange,
  thumbnails,
}: TrimmerProps) {
  const { styles, theme } = useStyles();

  const leftX = useSharedValue(0);
  const rightX = useSharedValue(TRACK_WIDTH);
  const playheadX = useSharedValue(0);

  const activeKnob = useSharedValue<'left' | 'right' | null>(null);
  const startLeftX = useSharedValue(0);
  const startRightX = useSharedValue(0);

  const initialized = useRef(false);

  // Only set positions on first load — after that shared values are the source of truth
  useEffect(() => {
    if (initialized.current) return;
    if (totalDuration > 0) {
      initialized.current = true;
      leftX.value = (trimStart / totalDuration) * TRACK_WIDTH;
      const maxEnd = Math.min(trimEnd, trimStart + MAX_TRIM_DURATION);
      rightX.value = (maxEnd / totalDuration) * TRACK_WIDTH;
    }
  }, [totalDuration]);

  const pan = Gesture.Pan()
    .minDistance(1)
    .onStart(e => {
      // Capture anchor positions when gesture actually activates
      startLeftX.value = leftX.value;
      startRightX.value = rightX.value;

      const touchX = e.x;
      const dl = Math.abs(touchX - leftX.value);
      const dr = Math.abs(touchX - rightX.value);
      activeKnob.value = dl <= dr ? 'left' : 'right';
    })
    .onUpdate(e => {
      const tx = e.translationX;

      if (activeKnob.value === 'left') {
        let x = startLeftX.value + tx;
        if (x < 0) x = 0;
        const maxX = rightX.value - MIN_HANDLE_DISTANCE;
        if (x > maxX) x = maxX;
        if (totalDuration > 0) {
          const minLeftX = Math.max(
            0,
            rightX.value - (MAX_TRIM_DURATION / totalDuration) * TRACK_WIDTH,
          );
          if (x < minLeftX) x = minLeftX;
        }
        leftX.value = x;
      }

      if (activeKnob.value === 'right') {
        let x = startRightX.value + tx;
        const minX = leftX.value + MIN_HANDLE_DISTANCE;
        if (x < minX) x = minX;
        if (x > TRACK_WIDTH) x = TRACK_WIDTH;
        if (totalDuration > 0) {
          const maxRightX = Math.min(
            TRACK_WIDTH,
            leftX.value + (MAX_TRIM_DURATION / totalDuration) * TRACK_WIDTH,
          );
          if (x > maxRightX) x = maxRightX;
        }
        rightX.value = x;
      }
    })
    .onEnd(() => {
      activeKnob.value = null;
      if (totalDuration > 0) {
        const start = (leftX.value / TRACK_WIDTH) * totalDuration;
        const end = (rightX.value / TRACK_WIDTH) * totalDuration;
        runOnJS(onTrimChange)(start, end);
      }
    });

  const leftDimStyle = useAnimatedStyle(() => ({
    width: leftX.value,
  }));
  const rightDimStyle = useAnimatedStyle(() => ({
    width: TRACK_WIDTH - rightX.value,
  }));
  const topBorderStyle = useAnimatedStyle(() => ({
    left: leftX.value,
    width: rightX.value - leftX.value,
  }));
  const bottomBorderStyle = useAnimatedStyle(() => ({
    left: leftX.value,
    width: rightX.value - leftX.value,
  }));
  const leftHandleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: leftX.value - HANDLE_WIDTH }],
  }));
  const rightHandleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: rightX.value }],
  }));
  const playheadAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: playheadX.value - PLAYHEAD_WIDTH / 2 }],
  }));

  const frameCount = thumbnails.length;
  const frameWidth = frameCount > 0 ? TRACK_WIDTH / frameCount : 0;

  return {
    TrimmerUIComponent: () => {
      return (
        <View style={styles.root}>
          <GestureDetector gesture={pan}>
            <View style={styles.outerTrack}>
              <View style={styles.filmstripClip}>
                {frameCount > 0 ? (
                  <View style={styles.filmstrip}>
                    {thumbnails.map((uri, i) => (
                      <RNImage
                        key={i}
                        source={{ uri }}
                        style={{ width: frameWidth, height: TRACK_HEIGHT }}
                        resizeMode="cover"
                      />
                    ))}
                  </View>
                ) : (
                  <View style={styles.filmstripPlaceholder}>
                    {Array.from({ length: 8 }).map((_, i) => (
                      <View key={i} style={styles.skeletonBar} />
                    ))}
                  </View>
                )}

                <Animated.View
                  style={[styles.dimOverlay, styles.dimLeft, leftDimStyle]}
                />
                <Animated.View
                  style={[styles.dimOverlay, styles.dimRight, rightDimStyle]}
                />
              </View>

              <Animated.View
                style={[
                  styles.selectionBorder,
                  styles.selectionBorderTop,
                  topBorderStyle,
                ]}
              />
              <Animated.View
                style={[
                  styles.selectionBorder,
                  styles.selectionBorderBottom,
                  bottomBorderStyle,
                ]}
              />

              <Animated.View style={[styles.playhead, playheadAnimStyle]} />

              <Animated.View
                style={[styles.handle, styles.handleLeft, leftHandleStyle]}
              >
                <View style={styles.gripContainer}>
                  {Array.from({ length: GRIP_LINE_COUNT }).map((_, i) => (
                    <View key={i} style={styles.gripLine} />
                  ))}
                </View>
              </Animated.View>

              <Animated.View
                style={[styles.handle, styles.handleRight, rightHandleStyle]}
              >
                <View style={styles.gripContainer}>
                  {Array.from({ length: GRIP_LINE_COUNT }).map((_, i) => (
                    <View key={i} style={styles.gripLine} />
                  ))}
                </View>
              </Animated.View>
            </View>
          </GestureDetector>
        </View>
      );
    },
    onCurrentPositionChange: (position: number) => {
      if (totalDuration > 0) {
        playheadX.value = (position / totalDuration) * TRACK_WIDTH;
      }
    },
    TRACK_WIDTH,
    TRACK_HEIGHT,
  };
}

const useStyles = () => {
  const theme = useTheme();
  const styles = useMemo(() => {
    return StyleSheet.create({
      root: {
        paddingHorizontal: HORIZONTAL_INSET,
        // Timeline + pan math are LTR; RTL app layout otherwise mirrors and misaligns knobs.
        direction: 'ltr',
      },
      outerTrack: {
        width: TRACK_WIDTH,
        height: TRACK_HEIGHT,
        position: 'relative',
        direction: 'ltr',
      },
      filmstripClip: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: TRACK_WIDTH,
        height: TRACK_HEIGHT,
        borderRadius: 6,
        overflow: 'hidden',
      },
      filmstrip: {
        flexDirection: 'row',
        width: TRACK_WIDTH,
        height: TRACK_HEIGHT,
      },
      filmstripPlaceholder: {
        width: TRACK_WIDTH,
        height: TRACK_HEIGHT,
        backgroundColor: '#2a2a2a',
        flexDirection: 'row',
        alignItems: 'center',
        overflow: 'hidden',
      },
      skeletonBar: {
        flex: 1,
        height: TRACK_HEIGHT,
        backgroundColor: '#383838',
        marginHorizontal: 1,
        borderRadius: 2,
      },
      dimOverlay: {
        position: 'absolute',
        top: 0,
        height: TRACK_HEIGHT,
        backgroundColor: 'rgba(0,0,0,0.5)',
      },
      dimLeft: {
        left: 0,
      },
      dimRight: {
        right: 0,
      },
      selectionBorder: {
        position: 'absolute',
        height: BORDER_WIDTH,
        backgroundColor: theme.colors.WHITE,
        zIndex: 4,
      },
      selectionBorderTop: {
        top: 0,
      },
      selectionBorderBottom: {
        bottom: 0,
      },
      handle: {
        position: 'absolute',
        top: 0,
        width: HANDLE_WIDTH,
        height: TRACK_HEIGHT,
        backgroundColor: theme.colors.WHITE,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.35,
        shadowRadius: 3,
        elevation: 3,
        zIndex: 10,
      },
      handleLeft: {
        borderTopLeftRadius: 5,
        borderBottomLeftRadius: 5,
      },
      handleRight: {
        borderTopRightRadius: 5,
        borderBottomRightRadius: 5,
      },
      gripContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: GRIP_LINE_GAP,
      },
      gripLine: {
        width: GRIP_LINE_WIDTH,
        height: GRIP_LINE_HEIGHT,
        borderRadius: GRIP_LINE_WIDTH / 2,
        backgroundColor: '#888',
      },
      playhead: {
        position: 'absolute',
        top: 0,
        width: PLAYHEAD_WIDTH,
        height: TRACK_HEIGHT,
        backgroundColor: theme.colors.WHITE,
        borderRadius: PLAYHEAD_WIDTH / 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 2,
        elevation: 2,
        zIndex: 5,
      },
    });
  }, [theme]);

  return { styles, theme };
};
