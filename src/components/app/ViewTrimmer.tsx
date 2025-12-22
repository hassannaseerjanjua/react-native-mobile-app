import { Platform, Text, TouchableOpacity, View } from 'react-native';
import React, { useRef, useState, useEffect } from 'react';
import { trim } from 'react-native-video-trim';
import Video, { VideoRef } from 'react-native-video';
import ParentView from './ParentView';
import useTheme from '../../styles/theme';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import useTrimmer from './Timmer';
import { fileUriWrapper } from '../../utils';

const MAX_VIDEO_DURATION = 15; // Maximum trim duration in seconds

interface ViewTrimmerProps {
  videoUrl: string;
  onSaveVideo: (trimmedVideo: string) => void;
  onCancel?: () => void;
}

const ViewTrimmer = ({
  videoUrl,
  onSaveVideo,
  onCancel = () => {},
}: ViewTrimmerProps) => {
  const theme = useTheme();
  const videoRef = useRef<VideoRef | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState<null | number>(null);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState<null | number>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { TrimmerUIComponent, onCurrentPositionChange } = useTrimmer({
    totalDuration: duration || 0,
    trimStart: startTime,
    trimEnd: endTime || duration || 0,
    onTrimChange: (start, end) => {
      // Enforce 15-second maximum trim duration
      const maxEnd = start + MAX_VIDEO_DURATION;
      const actualEnd = Math.min(end, maxEnd, duration || Infinity);

      setStartTime(start);
      videoRef.current?.seek(start);
      setEndTime(actualEnd);

      console.log('start', start);
      console.log('end', actualEnd);
      console.log('duration', duration);
      console.log('max allowed', MAX_VIDEO_DURATION);
    },
  });

  // Initialize endTime to max 15 seconds when duration is loaded
  useEffect(() => {
    if (duration !== null) {
      const initialEnd = Math.min(duration, startTime + MAX_VIDEO_DURATION);
      setEndTime(initialEnd);
    }
  }, [duration]);

  const saveVideo = async () => {
    if (isSaving) return;

    console.log('saveVideo called with state:', {
      startTime,
      endTime,
      duration,
    });

    // Handle path formatting for different platforms
    let inputPath = videoUrl;
    if (Platform.OS === 'ios') {
      // On iOS, react-native-video-trim needs the path with file:// prefix
      // Ensure file:// prefix is present
      if (!inputPath.startsWith('file://')) {
        inputPath = 'file://' + inputPath;
      }
    } else {
      // Use fileUriWrapper for Android (keeps file:// prefix)
      inputPath = fileUriWrapper(videoUrl);
    }

    if (!duration) {
      console.log('duration is null');
      return;
    }

    // Ensure trimmed duration doesn't exceed 15 seconds
    const finalEndTime = endTime ?? duration;
    const maxAllowedEnd = startTime + MAX_VIDEO_DURATION;
    const actualEndTime = Math.min(finalEndTime, maxAllowedEnd, duration);

    const trimStartMs = startTime * 1000;
    const trimEndMs = actualEndTime * 1000;

    console.log('Trimming with (ms):', { trimStartMs, trimEndMs, inputPath });
    console.log('Trim duration:', actualEndTime - startTime, 'seconds');

    setIsSaving(true);
    try {
      const trimmedVideo = await trim(inputPath, {
        startTime: trimStartMs,
        endTime: trimEndMs,
      });

      console.log('Trim result:', trimmedVideo);

      if (trimmedVideo?.outputPath) {
        onSaveVideo(fileUriWrapper(trimmedVideo.outputPath));
      } else {
        console.error('Trim result missing outputPath:', trimmedVideo);
      }
    } catch (error) {
      console.error('Trim error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ParentView style={{ flex: 1 }} edges={['top', 'left', 'right', 'bottom']}>
      <View
        style={{
          flex: 1,
          position: 'relative',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Video
          ref={videoRef}
          source={{ uri: videoUrl }}
          style={{ height: '100%', width: theme.sizes.WIDTH }}
          onLoad={e => {
            if (duration === null) {
              const videoDuration = e.duration;
              setDuration(videoDuration);
              // Set initial endTime to max 15 seconds from start
              const initialEnd = Math.min(
                videoDuration,
                startTime + MAX_VIDEO_DURATION,
              );
              setEndTime(initialEnd);
            }
          }}
          onProgress={data => {
            onCurrentPositionChange(data.currentTime);
            if (data.currentTime >= (endTime || duration || 0)) {
              videoRef.current?.seek(startTime);
            }
          }}
          paused={!isPlaying}
        />
      </View>
      <View
        style={{
          height: 80,
          width: '100%',
        }}
      >
        {duration !== null && (
          <GestureHandlerRootView>
            <TrimmerUIComponent />
          </GestureHandlerRootView>
        )}
      </View>
      <View
        style={{
          width: '100%',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 8,
          marginBottom: 16,
          paddingHorizontal: 16,
        }}
      >
        <TouchableOpacity
          onPress={onCancel}
          style={{
            paddingVertical: 10,
            paddingHorizontal: 16,
          }}
        >
          <Text style={{ color: theme.colors.SECONDARY_TEXT }}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setIsPlaying(prev => !prev)}
          style={{
            paddingVertical: 10,
            paddingHorizontal: 24,
            borderRadius: 999,
            backgroundColor: theme.colors.PRIMARY,
          }}
        >
          <Text style={{ color: '#fff' }}>{isPlaying ? 'Pause' : 'Play'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={saveVideo}
          disabled={isSaving}
          style={{
            paddingVertical: 10,
            paddingHorizontal: 16,
            opacity: isSaving ? 0.5 : 1,
          }}
        >
          <Text style={{ color: theme.colors.PRIMARY }}>
            {isSaving ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>
    </ParentView>
  );
};

export default ViewTrimmer;
