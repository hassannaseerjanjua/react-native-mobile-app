import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import {
  Camera,
  CameraPermissionStatus,
  RecordVideoOptions,
  useCameraDevice,
} from 'react-native-vision-camera';

export function useVisionCamera(frameProcessor?: (frame: any) => void) {
  const cameraRef = useRef<Camera>(null);
  const device = useCameraDevice('back');

  const [permission, setPermission] =
    useState<CameraPermissionStatus>('not-determined');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false); // ✅ Changed to false
  const [recordingDuration, setRecordingDuration] = useState(0);

  const [timer, setTimer] = useState(0);
  const timerRef = useRef<any>(null);

  // Request Permissions
  const requestPermission = useCallback(async () => {
    // Check current permission status
    const cameraStatus = await Camera.getCameraPermissionStatus();
    const micStatus = await Camera.getMicrophonePermissionStatus();

    // Request camera permission if not granted
    let finalCameraStatus = cameraStatus;
    if (cameraStatus !== 'granted') {
      finalCameraStatus = await Camera.requestCameraPermission();
      if (finalCameraStatus !== 'granted') {
        Alert.alert(
          'Camera Permission',
          'Camera permission is required to record videos',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Grant Permission',
              onPress: async () => {
                const newStatus = await Camera.requestCameraPermission();
                if (newStatus === 'granted') {
                  setIsCameraActive(true);
                  setPermission(newStatus);
                  setIsAuthorized(true);
                }
              },
            },
          ],
        );
        setPermission(finalCameraStatus);
        setIsAuthorized(false);
        return;
      }
    }

    // Request microphone permission if not granted
    let finalMicStatus = micStatus;
    if (micStatus !== 'granted') {
      finalMicStatus = await Camera.requestMicrophonePermission();
      if (finalMicStatus !== 'granted') {
        Alert.alert(
          'Microphone Permission',
          'Microphone permission is required for video recording with audio',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Grant Permission',
              onPress: async () => {
                const newMicStatus = await Camera.requestMicrophonePermission();
                if (newMicStatus === 'granted') {
                  setIsCameraActive(true);
                  setPermission(finalCameraStatus);
                  setIsAuthorized(true);
                } else {
                  Alert.alert(
                    'Permission Required',
                    'Microphone permission is required for video recording',
                  );
                }
              },
            },
          ],
        );
        setPermission(finalCameraStatus);
        setIsAuthorized(false);
        return;
      }
    }

    if (!device) {
      Alert.alert('Error', 'No camera device found');
      setPermission(finalCameraStatus);
      setIsAuthorized(false);
      return;
    }

    // Both permissions granted
    if (finalCameraStatus === 'granted' && finalMicStatus === 'granted') {
      setIsCameraActive(true);
      setPermission(finalCameraStatus);
      setIsAuthorized(true);
    }
  }, [device]);

  // Don't auto-request permissions on mount - let the component request when needed

  // Toggle camera
  const pauseCamera = () => {
    setIsCameraActive(false);
  };

  const resumeCamera = () => {
    setIsCameraActive(true);
  };

  // Take picture
  const takePhoto = async (options = {}) => {
    if (!cameraRef.current || !isCameraActive) {
      console.warn('Camera not ready for photo');
      return null;
    }
    try {
      return await cameraRef.current.takePhoto({
        flash: 'off',
        ...options,
      });
    } catch (err) {
      console.warn('Error taking photo:', err);
      return null;
    }
  };
  const cancelRecording = async () => {
    try {
      console.log('⏹ Cancelling recording...');

      if (cameraRef.current) {
        await cameraRef.current.stopRecording();
      }

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      setRecordingDuration(0);
      setTimer(0);
      setIsCameraActive(false);

      console.log('Recording cancelled');
    } catch (err) {
      console.warn('Error cancelling recording:', err);
    }
  };
  // Record video
  const recordVideo = async (
    options: Partial<RecordVideoOptions> = {},
    durationLimitSeconds?: number,
  ) => {
    console.log('🎥 recordVideo called');
    console.log('Camera ref exists?', !!cameraRef.current);
    console.log('Device exists?', !!device);

    if (!cameraRef.current) {
      console.error('❌ Camera ref is null!');
      return null;
    }

    if (!device) {
      console.error('❌ Device is null!');
      return null;
    }

    try {
      setRecordingDuration(0);
      console.log('🎬 Starting recording...');
      setTimer(durationLimitSeconds || 0);
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => {
          const next = prev + 1;
          console.log('timer', next);
          setTimer(prev => prev - 1);
          if (durationLimitSeconds && next >= durationLimitSeconds) {
            stopRecording();
          }
          return next;
        });
      }, 1000);

      cameraRef.current.startRecording({
        flash: 'off',
        fileType: 'mp4',
        onRecordingFinished: video => {
          console.log('✅ Recording finished:', video);
          stopRecording();
          options.onRecordingFinished?.(video);
        },
        onRecordingError: err => {
          console.error('❌ Recording error:', err);
          stopRecording();
          options.onRecordingError?.(err);
        },
      });
    } catch (e) {
      console.error('❌ Video error:', e);
      stopRecording();
    }
  };

  const stopRecording = async () => {
    try {
      if (cameraRef.current) {
        console.log('calling stop recording 2');

        await cameraRef.current.stopRecording();
        console.log('calling stop recording 3');
      }

      // clear the interval
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      setRecordingDuration(0);
    } catch (err) {
      console.warn('Error stopping recording:', err);
    }
  };

  return {
    cameraRef,
    frameProcessor,
    permission,
    isAuthorized,
    isCameraActive,
    requestPermission,
    pauseCamera,
    resumeCamera,
    takePhoto,
    recordVideo,
    timer,
    stopRecording,
    cancelRecording,
    device,
  };
}
