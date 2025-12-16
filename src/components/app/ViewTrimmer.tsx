import { Text, TouchableOpacity, View } from 'react-native';
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
}

const ViewTrimmer = ({ videoUrl, onSaveVideo }: ViewTrimmerProps) => {
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
    },
  });

  const saveVideo = async () => {
    const trimmedVideo = await trim(videoUrl, {
      startTime: startTime,
      endTime: endTime || duration || 0,
    });
    onSaveVideo(trimmedVideo.outputPath);
  };

  return (
    <ParentView style={{}}>
      <View
        style={{
          height: theme.sizes.HEIGHT * 0.8,
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
        <TouchableOpacity
          onPress={() => setIsPlaying(!isPlaying)}
          style={{
            backgroundColor: 'red',
            position: 'absolute',
            height: 50,
            width: 50,
            zIndex: 1000,
          }}
        >
          <Text>{isPlaying ? 'Pause' : 'Play'}</Text>
        </TouchableOpacity>
      </View>
      <View
        style={{
          height: theme.sizes.HEIGHT * 0.1,
          width: '100%',
        }}
      >
        {duration !== null && (
          <GestureHandlerRootView>
            <TrimmerUIComponent />
          </GestureHandlerRootView>
        )}
      </View>
    </ParentView>
  );
};

export default ViewTrimmer;
