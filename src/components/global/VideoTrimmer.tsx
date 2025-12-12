import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Animated,
  PanResponder,
} from 'react-native';
import { Text } from '../../utils/elements';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TRIMMER_WIDTH = SCREEN_WIDTH - 70;
const HANDLE_WIDTH = 20;
const MIN_TRIM_DURATION = 1;

interface VideoTrimmerProps {
  videoDuration: number; // in seconds
  onTrimChange: (start: number, end: number) => void;
  isRecording?: boolean;
  currentProgress?: Animated.Value;
}

const VideoTrimmer: React.FC<VideoTrimmerProps> = ({
  videoDuration,
  onTrimChange,
  currentProgress,
  isRecording = false,
}) => {
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(videoDuration);

  // Use plain numbers instead of Animated.Value for more control
  const leftHandlePosition = useRef(0);
  const rightHandlePosition = useRef(TRIMMER_WIDTH - HANDLE_WIDTH);
  const progressAnim = useRef(new Animated.Value(0)).current;

  const leftHandleX = useRef(new Animated.Value(0)).current;
  const rightHandleX = useRef(
    new Animated.Value(TRIMMER_WIDTH - HANDLE_WIDTH),
  ).current;

  // Store videoDuration in a ref to avoid stale closures in PanResponders
  const videoDurationRef = useRef(videoDuration);
  useEffect(() => {
    videoDurationRef.current = videoDuration;
  }, [videoDuration]);

  // Store callbacks in refs to avoid stale closures
  const onTrimChangeRef = useRef(onTrimChange);
  useEffect(() => {
    onTrimChangeRef.current = onTrimChange;
  }, [onTrimChange]);

  // Conversion functions that use refs (for use in PanResponders)
  const secondsToPixelsRef = useCallback(
    (seconds: number) => {
      const duration = videoDurationRef.current;
      if (!duration || TRIMMER_WIDTH - HANDLE_WIDTH === 0) return 0;
      return (seconds / duration) * (TRIMMER_WIDTH - HANDLE_WIDTH);
    },
    [],
  );

  const pixelsToSecondsRef = useCallback(
    (pixels: number) => {
      const duration = videoDurationRef.current;
      console.log('pixels', pixels, duration);
      if (duration === 0) return 0;
      return (pixels / (TRIMMER_WIDTH - HANDLE_WIDTH)) * duration;
    },
    [],
  );

  // Update trimEnd when videoDuration changes
  useEffect(() => {
    if (videoDuration > 0) {
      setTrimEnd(videoDuration);
      const newRightPos = TRIMMER_WIDTH - HANDLE_WIDTH;
      rightHandlePosition.current = newRightPos;
      rightHandleX.setValue(newRightPos);
      // Also reset left handle to start
      leftHandlePosition.current = 0;
      leftHandleX.setValue(0);
      setTrimStart(0);
    }
  }, [videoDuration, leftHandleX, rightHandleX]);

  // Convert seconds to pixels
  const secondsToPixels = useCallback(
    (seconds: number) => {
      if (!videoDuration || TRIMMER_WIDTH - HANDLE_WIDTH === 0) return 0;
      return (seconds / videoDuration) * (TRIMMER_WIDTH - HANDLE_WIDTH);
    },
    [videoDuration],
  );

  // Convert pixels to seconds
  const pixelsToSeconds = useCallback(
    (pixels: number) => {
      console.log('pixels', pixels, videoDuration);
      if (videoDuration === 0) return 0;
      return (pixels / (TRIMMER_WIDTH - HANDLE_WIDTH)) * videoDuration;
    },
    [videoDuration],
  );

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const updateProgress = (currentTime: number) => {
    if (videoDuration === 0) return;

    // Calculate progress relative to selected trim area
    const selectedStart = trimStart;
    const selectedEnd = trimEnd;
    const selectedDuration = selectedEnd - selectedStart;

    const clampedTime = Math.min(
      Math.max(currentTime, selectedStart),
      selectedEnd,
    );

    const relativeProgress = (clampedTime - selectedStart) / selectedDuration;

    progressAnim.setValue(relativeProgress);
  };

  // Left Handle Pan Responder - FIXED with refs to avoid stale closures
  const leftPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        // Store the starting position
        leftHandleX.stopAnimation(value => {
          leftHandlePosition.current = value;
        });
      },
      onPanResponderMove: (_, gestureState) => {
        // Calculate new position
        let newPosition = leftHandlePosition.current + gestureState.dx;

        // Constrain to bounds
        newPosition = Math.max(0, newPosition);
        const maxPosition =
          rightHandlePosition.current - secondsToPixelsRef(MIN_TRIM_DURATION);
        newPosition = Math.min(newPosition, maxPosition);

        // Update animated value
        leftHandleX.setValue(newPosition);
      },
      onPanResponderRelease: (_, gestureState) => {
        // Calculate final position
        let newPosition = leftHandlePosition.current + gestureState.dx;

        // Constrain to bounds
        newPosition = Math.max(0, newPosition);
        const maxPosition =
          rightHandlePosition.current - secondsToPixelsRef(MIN_TRIM_DURATION);
        newPosition = Math.min(newPosition, maxPosition);

        // Update state
        leftHandlePosition.current = newPosition;
        leftHandleX.setValue(newPosition);

        const newStartTime = pixelsToSecondsRef(newPosition);
        setTrimStart(newStartTime);
        console.log(
          'left ',
          pixelsToSecondsRef(leftHandlePosition.current),
          pixelsToSecondsRef(rightHandlePosition.current),
        );
        onTrimChangeRef.current(
          pixelsToSecondsRef(leftHandlePosition.current),
          pixelsToSecondsRef(rightHandlePosition.current),
        );
      },
    }),
  ).current;
  console.log(
    'refs ==>',
    pixelsToSeconds(leftHandlePosition.current),
    rightHandlePosition.current,
  );
  // Right Handle Pan Responder - FIXED with refs to avoid stale closures
  const rightPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        // Store the starting position
        rightHandleX.stopAnimation(value => {
          rightHandlePosition.current = value;
        });
      },
      onPanResponderMove: (_, gestureState) => {
        // Calculate new position
        let newPosition = rightHandlePosition.current + gestureState.dx;

        // Constrain to bounds
        const minPosition =
          leftHandlePosition.current + secondsToPixelsRef(MIN_TRIM_DURATION);
        newPosition = Math.max(minPosition, newPosition);
        newPosition = Math.min(TRIMMER_WIDTH - HANDLE_WIDTH, newPosition);

        // Update animated value
        rightHandleX.setValue(newPosition);
      },
      onPanResponderRelease: (_, gestureState) => {
        // Calculate final position
        let newPosition = rightHandlePosition.current + gestureState.dx;

        // Constrain to bounds
        const minPosition =
          leftHandlePosition.current + secondsToPixelsRef(MIN_TRIM_DURATION);
        newPosition = Math.max(minPosition, newPosition);
        newPosition = Math.min(TRIMMER_WIDTH - HANDLE_WIDTH, newPosition);

        // Update state
        rightHandlePosition.current = newPosition;
        rightHandleX.setValue(newPosition);

        const newEndTime = pixelsToSecondsRef(newPosition);
        setTrimEnd(newEndTime);
        console.log(
          'right ',
          pixelsToSecondsRef(leftHandlePosition.current),
          pixelsToSecondsRef(rightHandlePosition.current),
        );
        onTrimChangeRef.current(
          pixelsToSecondsRef(leftHandlePosition.current),
          pixelsToSecondsRef(rightHandlePosition.current),
        );
      },
    }),
  ).current;

  // Calculate width for selected area
  const selectedWidth = Animated.subtract(rightHandleX, leftHandleX);

  if (!isRecording || videoDuration === 0) {
    return null;
  }

  return (
    <View style={styles.container} pointerEvents="box-none">
      <View style={styles.contentContainer} pointerEvents="box-none">
        {/* Timestamp Display */}
        <View style={styles.timestampContainer}>
          <Text style={styles.timestamp}>{formatTime(trimStart)}</Text>
          <Text style={styles.durationText}>
            {formatTime(trimEnd - trimStart)} selected
          </Text>
          <Text style={styles.timestamp}>{formatTime(trimEnd)}</Text>
        </View>

        {/* Timeline Container */}
        <View style={styles.timelineWrapper} pointerEvents="box-none">
          <View style={styles.timelineContainer} pointerEvents="box-none">
            {/* Background Timeline */}
            <View style={styles.timeline} pointerEvents="none">
              {/* Time markers */}
              {Array.from({ length: Math.ceil(videoDuration) + 1 }).map(
                (_, index) => {
                  const markerPosition = secondsToPixels(index);
                  if (markerPosition > TRIMMER_WIDTH - HANDLE_WIDTH)
                    return null;

                  return (
                    <View
                      key={index}
                      style={[styles.timeMarker, { left: markerPosition }]}
                    >
                      {index % 5 === 0 && (
                        <Text style={styles.timeMarkerText}>{index}s</Text>
                      )}
                    </View>
                  );
                },
              )}
            </View>

            {/* Trim Region Overlay */}
            <View style={styles.trimOverlay} pointerEvents="none">
              {/* Left darkened area */}
              <Animated.View
                style={[
                  styles.dimmedArea,
                  {
                    width: leftHandleX,
                  },
                ]}
              />

              {/* Selected area (transparent) */}
              <Animated.View
                style={[
                  styles.selectedArea,
                  {
                    left: leftHandleX,
                    width: selectedWidth,
                  },
                ]}
              >
                <View style={styles.selectedBorder} />
              </Animated.View>

              {/* Right darkened area */}
              <Animated.View
                style={[
                  styles.dimmedArea,
                  {
                    left: Animated.add(rightHandleX, HANDLE_WIDTH),
                    right: 0,
                  },
                ]}
              />
            </View>

            {/* Left Handle */}
            <Animated.View
              {...leftPanResponder.panHandlers}
              style={[
                styles.handle,
                styles.leftHandle,
                {
                  transform: [{ translateX: leftHandleX }],
                },
              ]}
              pointerEvents="box-only"
            >
              <View style={styles.handleBar} />
              <View style={styles.handleGrip} />
              <View style={styles.handleBar} />
            </Animated.View>
            {currentProgress && (
              <Animated.View
                style={[
                  styles.currentTimeIndicator,
                  {
                    transform: [
                      {
                        translateX: Animated.multiply(
                          currentProgress,
                          selectedWidth,
                        ),
                      },
                    ],
                  },
                ]}
              />
            )}
            {/* Right Handle */}
            <Animated.View
              {...rightPanResponder.panHandlers}
              style={[
                styles.handle,
                styles.rightHandle,
                {
                  transform: [{ translateX: rightHandleX }],
                },
              ]}
              pointerEvents="box-only"
            >
              <View style={styles.handleBar} />
              <View style={styles.handleGrip} />
              <View style={styles.handleBar} />
            </Animated.View>
          </View>
        </View>

        {/* Instructions */}
        <Text style={styles.instructions}>
          Drag handles to trim • {formatTime(trimStart)} - {formatTime(trimEnd)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 20,
  },
  contentContainer: {
    marginHorizontal: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  timestampContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  timestamp: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  durationText: {
    color: '#4CAF50',
    fontSize: 13,
    fontWeight: '600',
  },
  timelineWrapper: {
    paddingVertical: 8,
  },
  timelineContainer: {
    height: 60,
    width: TRIMMER_WIDTH,
    position: 'relative',
  },
  timeline: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 6,
    position: 'relative',
  },
  timeMarker: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  timeMarkerText: {
    position: 'absolute',
    bottom: -20,
    left: -10,
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 10,
    fontWeight: '500',
  },
  trimOverlay: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
  },
  dimmedArea: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    height: '100%',
  },
  selectedArea: {
    position: 'absolute',
    height: '100%',
    borderTopWidth: 3,
    borderBottomWidth: 3,
    borderColor: '#4CAF50',
  },
  selectedBorder: {
    flex: 1,
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderColor: '#4CAF50',
  },
  handle: {
    position: 'absolute',
    width: HANDLE_WIDTH,
    height: 60,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  leftHandle: {
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 6,
    borderRightWidth: 3,
    borderRightColor: '#FFFFFF',
  },
  rightHandle: {
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#FFFFFF',
  },
  handleBar: {
    width: 2,
    height: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
    marginVertical: 1,
  },
  handleGrip: {
    width: 4,
    height: 25,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
    marginVertical: 2,
  },
  instructions: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 12,
    fontWeight: '500',
  },
  currentTimeIndicator: {
    position: 'absolute',
    top: 0,
    width: 2,
    height: '100%',
    backgroundColor: '#FFFF',
    zIndex: 200,
  },
});

export default VideoTrimmer;
