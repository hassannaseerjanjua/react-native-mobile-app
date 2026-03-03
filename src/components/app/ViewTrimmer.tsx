import {
  ActivityIndicator,
  Animated,
  Platform,
  Pressable,
  TouchableOpacity,
  View,
  StyleSheet,
  InteractionManager,
  StatusBar,
} from 'react-native';
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { trim } from 'react-native-video-trim';
import Video, { VideoRef } from 'react-native-video';
import { createThumbnail } from 'react-native-create-thumbnail';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Text } from '../../utils/elements';

import useTrimmer from './Timmer';
import { fileUriWrapper } from '../../utils';
import { SvgSelectedCheck } from '../../assets/icons';
import Svg, { Path, Circle } from 'react-native-svg';

const MAX_VIDEO_DURATION = 15;
const FRAME_COUNT = 10;

const formatTime = (secs: number): string => {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

interface ViewTrimmerProps {
  videoUrl: string;
  onSaveVideo: (trimmedVideo: string) => void;
  onCancel?: () => void;
}

const PlayIcon = ({ size = 52 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 52 52" fill="none">
    <Circle cx="26" cy="26" r="26" fill="rgba(0,0,0,0.45)" />
    <Path
      d="M21 17.5L37 26L21 34.5V17.5Z"
      fill="white"
    />
  </Svg>
);

const PauseIcon = ({ size = 52 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 52 52" fill="none">
    <Circle cx="26" cy="26" r="26" fill="rgba(0,0,0,0.45)" />
    <Path d="M20 17H24V35H20V17Z" fill="white" />
    <Path d="M28 17H32V35H28V17Z" fill="white" />
  </Svg>
);

const CloseIcon = ({ size = 16 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 9 9" fill="none">
    <Path
      d="M1.70005 7.99976L1.00005 7.29976L3.80005 4.49976L1.00005 1.69976L1.70005 0.999756L4.50005 3.79976L7.30005 0.999756L8.00005 1.69976L5.20005 4.49976L8.00005 7.29976L7.30005 7.99976L4.50005 5.19976L1.70005 7.99976Z"
      fill="white"
    />
  </Svg>
);

const ViewTrimmer = ({
  videoUrl,
  onSaveVideo,
  onCancel = () => {},
}: ViewTrimmerProps) => {
  const insets = useSafeAreaInsets();
  const videoRef = useRef<VideoRef | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState<null | number>(null);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState<null | number>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [thumbnails, setThumbnails] = useState<string[]>([]);

  const isSavingRef = useRef(false);
  const thumbnailsGeneratedRef = useRef(false);

  // Play/pause icon overlay animation
  const iconOpacity = useRef(new Animated.Value(0)).current;
  const iconFadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showPlayPauseIcon = (playing: boolean) => {
    if (iconFadeTimer.current) clearTimeout(iconFadeTimer.current);
    Animated.timing(iconOpacity, {
      toValue: 1,
      duration: 80,
      useNativeDriver: true,
    }).start(() => {
      iconFadeTimer.current = setTimeout(() => {
        Animated.timing(iconOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }, 600);
    });
  };

  const togglePlay = () => {
    setIsPlaying(prev => {
      showPlayPauseIcon(!prev);
      return !prev;
    });
  };

  const {
    TrimmerUIComponent,
    onCurrentPositionChange,
  } = useTrimmer({
    totalDuration: duration || 0,
    trimStart: startTime,
    trimEnd: endTime || duration || 0,
    onTrimChange: (start, end) => {
      const maxEnd = start + MAX_VIDEO_DURATION;
      const actualEnd = Math.min(end, maxEnd, duration || Infinity);
      setStartTime(start);
      setEndTime(actualEnd);
      videoRef.current?.seek(start);
    },
    thumbnails,
  });

  const generateThumbnails = useCallback(
    async (videoDuration: number) => {
      if (thumbnailsGeneratedRef.current) return;
      thumbnailsGeneratedRef.current = true;

      const rawPath = videoUrl.replace('file://', '');
      const nativeUrl =
        Platform.OS === 'ios'
          ? rawPath
          : videoUrl.startsWith('file://')
            ? videoUrl
            : 'file://' + videoUrl;

      const collected: string[] = [];
      let lastGoodPath: string | null = null;

      const extractFrame = async (ts: number): Promise<string | null> => {
        try {
          const result = await createThumbnail({
            url: nativeUrl,
            timeStamp: ts,
            format: 'jpeg',
            timeToleranceMs: 10000,
          });
          const p = result.path.startsWith('file://')
            ? result.path
            : 'file://' + result.path;
          return p;
        } catch {
          return null;
        }
      };

      for (let i = 0; i < FRAME_COUNT; i++) {
        const timeStamp = Math.floor(
          (i / FRAME_COUNT) * videoDuration * 1000,
        );
        let path = await extractFrame(timeStamp);
        if (!path && timeStamp > 0) {
          path = await extractFrame(0);
        }

        if (path) {
          collected.push(path);
          lastGoodPath = path;
        } else if (lastGoodPath) {
          collected.push(lastGoodPath);
        }

        if (
          collected.length > 0 &&
          (i % 2 === 1 || i === FRAME_COUNT - 1)
        ) {
          setThumbnails([...collected]);
        }
      }
    },
    [videoUrl],
  );

  useEffect(() => {
    if (duration !== null) {
      const initialEnd = Math.min(duration, startTime + MAX_VIDEO_DURATION);
      setEndTime(initialEnd);
      generateThumbnails(duration);
    }
  }, [duration]);

  const saveVideo = async () => {
    if (isSaving) return;

    let inputPath = videoUrl;
    if (Platform.OS === 'ios') {
      if (!inputPath.startsWith('file://')) {
        inputPath = 'file://' + inputPath;
      }
    } else {
      inputPath = fileUriWrapper(videoUrl);
    }

    if (!duration) return;

    const finalEndTime = endTime ?? duration;
    const maxAllowedEnd = startTime + MAX_VIDEO_DURATION;
    const actualEndTime = Math.min(finalEndTime, maxAllowedEnd, duration);

    const trimStartMs = startTime * 1000;
    const trimEndMs = actualEndTime * 1000;

    isSavingRef.current = true;
    setIsPlaying(false);
    setIsSaving(true);

    InteractionManager.runAfterInteractions(async () => {
      try {
        const trimmedVideo = await trim(inputPath, {
          startTime: trimStartMs,
          endTime: trimEndMs,
        });

        if (trimmedVideo?.outputPath) {
          onSaveVideo(fileUriWrapper(trimmedVideo.outputPath));
        } else {
          console.error('Trim result missing outputPath:', trimmedVideo);
        }
      } catch (error) {
        console.error('Trim error:', error);
      } finally {
        isSavingRef.current = false;
        setIsSaving(false);
      }
    });
  };

  return (
    <View style={styles.root}>
      <StatusBar hidden />

      {/* Video area — tappable */}
      <View style={styles.videoArea}>
        <Video
          ref={videoRef}
          source={{ uri: videoUrl }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
          resizeMode="contain"
          onLoad={e => {
            if (duration === null) {
              const videoDuration = e.duration;
              setDuration(videoDuration);
            }
          }}
          onProgress={data => {
            if (isSavingRef.current) return;
            onCurrentPositionChange(data.currentTime);
            if (data.currentTime >= (endTime || duration || 0)) {
              videoRef.current?.seek(startTime);
            }
          }}
          paused={!isPlaying || isSaving}
        />

        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={togglePlay}
          android_disableSound
        />

        {/* Play/pause overlay icon */}
        <Animated.View
          style={[styles.playIconOverlay, { opacity: iconOpacity }]}
          pointerEvents="none"
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </Animated.View>
      </View>

      {/* Trim strip overlaid at bottom of video */}
      <View style={styles.trimOverlay}>
        <GestureHandlerRootView style={styles.trimGestureRoot}>
          <TrimmerUIComponent />
        </GestureHandlerRootView>
      </View>

      {/* Top bar */}
      <View
        style={[
          styles.topBar,
          { paddingTop: insets.top + 8 },
        ]}
        pointerEvents="box-none"
      >
        <TouchableOpacity
          onPress={onCancel}
          style={styles.topBarBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <View style={[styles.topBarBtnCircle, styles.doneBtn]}>
            <CloseIcon size={16} />
          </View>
        </TouchableOpacity>

        <View style={styles.topBarCenter}>
          <Text style={styles.durationText}>
            {formatTime((endTime ?? 0) - startTime)}{' '}
            <Text style={styles.durationSub}>/ {formatTime(duration ?? 0)}</Text>
          </Text>
        </View>

        <TouchableOpacity
          onPress={saveVideo}
          disabled={isSaving}
          style={styles.topBarBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <View style={[styles.topBarBtnCircle, styles.doneBtn]}>
            {isSaving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <SvgSelectedCheck width={18} height={18} color="#fff" />
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* Full-screen saving overlay */}
      {isSaving && (
        <View style={styles.savingOverlay} pointerEvents="box-only">
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoArea: {
    flex: 1,
    position: 'relative',
  },
  playIconOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trimOverlay: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  trimGestureRoot: {
    width: '100%',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  topBarBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBarBtnCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(40,40,40,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  doneBtn: {
    backgroundColor: 'rgba(40,40,40,0.85)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  topBarCenter: {
    flex: 1,
    alignItems: 'center',
  },
  durationText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  durationSub: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  savingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
});

export default ViewTrimmer;
