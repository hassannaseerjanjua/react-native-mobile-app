import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  runOnJS,
} from 'react-native-reanimated';
import { scaleWithMax } from '../../utils';
import useTheme from '../../styles/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const EDGE_SAFE_PADDING = 32; // avoids back gesture
const TRACK_PADDING = 20;
const TRACK_WIDTH = SCREEN_WIDTH - (TRACK_PADDING + EDGE_SAFE_PADDING) * 2;

const KNOB_SIZE = 16;
const TOUCH_SLOP = 2;

const TRACK_HEIGHT = scaleWithMax(4, 6);

const AnimatedLine = Animated.createAnimatedComponent(Line);

const MAX_TRIM_DURATION = 15; // Maximum trim duration in seconds

interface TrimmerProps {
  totalDuration: number;
  trimStart: number;
  trimEnd: number;
  onTrimChange: (start: number, end: number) => void;
}

export default function useTrimmer({
  totalDuration,
  trimStart,
  trimEnd,
  onTrimChange,
}: TrimmerProps) {
  const { styles, theme } = useStyles();

  const leftX = useSharedValue(0);
  const middleX = useSharedValue(0);
  const rightX = useSharedValue(TRACK_WIDTH);

  const activeKnob = useSharedValue<'left' | 'right' | null>(null);
  const lastTranslation = useSharedValue(0);
  
  // Initialize knob positions based on trim values
  useEffect(() => {
    if (totalDuration > 0) {
      leftX.value = (trimStart / totalDuration) * TRACK_WIDTH;
      // Ensure right knob respects 15-second max
      const maxEnd = Math.min(trimEnd, trimStart + MAX_TRIM_DURATION);
      rightX.value = (maxEnd / totalDuration) * TRACK_WIDTH;
    }
  }, [trimStart, trimEnd, totalDuration]);
  // ------------------ GESTURE ------------------
  const pan = Gesture.Pan()
    .activeOffsetX([-5, 5]) // ignore tiny accidental drags
    .onBegin(e => {
      lastTranslation.value = 0;
      const x = e.x;
      const dl = Math.abs(x - leftX.value);
      const dr = Math.abs(x - rightX.value);
      activeKnob.value = dl < dr ? 'left' : 'right';
    })
    .onUpdate(e => {
      const delta = e.translationX - lastTranslation.value;
      lastTranslation.value = e.translationX;

      if (Math.abs(delta) < TOUCH_SLOP) return;

      if (activeKnob.value === 'left') {
        let x = leftX.value + delta;
        if (x < 0) x = 0;
        if (x > rightX.value - KNOB_SIZE) x = rightX.value - KNOB_SIZE;
        
        // Enforce 15-second maximum trim duration
        const minLeftX = rightX.value - (MAX_TRIM_DURATION / totalDuration) * TRACK_WIDTH;
        if (x < minLeftX) x = minLeftX;
        
        leftX.value = x;
      }

      if (activeKnob.value === 'right') {
        let x = rightX.value + delta;
        if (x < leftX.value + KNOB_SIZE) x = leftX.value + KNOB_SIZE;
        if (x > TRACK_WIDTH) x = TRACK_WIDTH;
        
        // Enforce 15-second maximum trim duration
        const maxRightX = leftX.value + (MAX_TRIM_DURATION / totalDuration) * TRACK_WIDTH;
        if (x > maxRightX) x = maxRightX;
        
        rightX.value = x;
      }
    })
    .onEnd(() => {
      activeKnob.value = null;

      // Call JS safely on drag end
      ('worklet');
      const start = (leftX.value / TRACK_WIDTH) * totalDuration;
      const end = (rightX.value / TRACK_WIDTH) * totalDuration;
      runOnJS(onTrimChange)(start, end);
    });

  // ------------------ ANIMATED STYLES ------------------
  const leftStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: leftX.value - KNOB_SIZE / 2 }],
  }));

  const rightStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: rightX.value - KNOB_SIZE / 2 }],
  }));

  const middleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: middleX.value - KNOB_SIZE / 2 }],
  }));

  const lineProps = useAnimatedProps(() => ({
    x1: leftX.value,
    x2: rightX.value,
  }));

  // ------------------ RENDER ------------------
  return {
    TrimmerUIComponent: () => {
      return (
        <View style={styles.root}>
          <GestureDetector gesture={pan}>
            <View style={styles.track}>
              <View>
                <Svg width={TRACK_WIDTH} height={TRACK_HEIGHT}>
                  {/* Background track */}
                  <Line
                    x1={0}
                    y1={TRACK_HEIGHT / 2}
                    x2={TRACK_WIDTH}
                    y2={TRACK_HEIGHT / 2}
                    stroke="#000"
                    strokeLinecap="round"
                    strokeWidth={TRACK_HEIGHT}
                  // opacity={0.5}
                  //   strokeLinecap="round"
                  />
                  {/* Active range */}
                  <AnimatedLine
                    animatedProps={lineProps}
                    y1={TRACK_HEIGHT / 2}
                    y2={TRACK_HEIGHT / 2}
                    stroke={theme.colors.PRIMARY}
                    strokeWidth={TRACK_HEIGHT}
                    strokeLinecap="round"
                  // opacity={0.5}
                  />
                </Svg>
              </View>

              {/* Left & Right Knobs */}
              <Animated.View style={[styles.knob, leftStyle]} />
              <Animated.View style={[styles.knobCurrent, middleStyle]} />
              <Animated.View style={[styles.knob, rightStyle]} />
            </View>
          </GestureDetector>
        </View>
      );
    },
    onCurrentPositionChange: (position: number) => {
      middleX.value = (position / totalDuration) * TRACK_WIDTH;
    },
  };
}

const useStyles = () => {
  const theme = useTheme();
  const styles = useMemo(() => {
    return StyleSheet.create({
      root: {
        paddingHorizontal: TRACK_PADDING + EDGE_SAFE_PADDING,
      },
      track: {
        width: TRACK_WIDTH,

        justifyContent: 'center',
        height: '100%',
      },
      knob: {
        position: 'absolute',
        width: KNOB_SIZE,
        height: KNOB_SIZE,
        borderRadius: KNOB_SIZE / 2,
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: theme.colors.PRIMARY,
        justifyContent: 'center',
        alignItems: 'center',
      },
      knobCurrent: {
        position: 'absolute',
        width: TRACK_HEIGHT,
        height: TRACK_HEIGHT,
        borderRadius: TRACK_HEIGHT / 2,
        backgroundColor: theme.colors.WHITE,
      },
    });
  }, [theme]);

  return {
    styles,
    theme,
  };
};
