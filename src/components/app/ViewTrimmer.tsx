import { Platform, Text, TouchableOpacity, View } from 'react-native';
import React, { useRef, useState } from 'react';
import { trim } from 'react-native-video-trim';
import Video, { VideoRef } from 'react-native-video';
import ParentView from './ParentView';
import useTheme from '../../styles/theme';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import useTrimmer from './Timmer';

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

  const { TrimmerUIComponent, onCurrentPositionChange } = useTrimmer({
    totalDuration: duration || 0,
    onTrimChange: (start, end) => {
      setStartTime(start);
      videoRef.current?.seek(start);
      setEndTime(end);

      console.log('start', start);
      console.log('end', end);
      console.log('duration', duration);
    },
  });

  const saveVideo = async () => {
    console.log('saveVideo called with state:', {
      startTime,
      endTime,
      duration,
    });

    const inputPath =
      Platform.OS === 'ios' && !videoUrl.startsWith('file://')
        ? `file://${videoUrl}`
        : videoUrl;

    if (!duration) {
      console.log('duration is null');
      return;
    }

    // Convert seconds to milliseconds (react-native-video-trim expects ms)
    const trimStartMs = startTime * 1000;
    const trimEndMs = (endTime ?? duration) * 800;

    console.log('Trimming with (ms):', { trimStartMs, trimEndMs, inputPath });

    try {
      const trimmedVideo = await trim(inputPath, {
        startTime: trimStartMs,
        endTime: trimEndMs,
      });

      console.log('Trim result:', trimmedVideo);
      onSaveVideo(trimmedVideo.outputPath);
    } catch (error) {
      console.log('Trim error:', error);
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
          style={{ height: '100%', width: '100%', backgroundColor: 'blue' }}
          onLoad={e => {
            if (duration === null) {
              setDuration(e.duration);
              setEndTime(e.duration);
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
          style={{
            paddingVertical: 10,
            paddingHorizontal: 16,
          }}
        >
          <Text style={{ color: theme.colors.PRIMARY }}>Save</Text>
        </TouchableOpacity>
      </View>
    </ParentView>
  );
};

export default ViewTrimmer;
