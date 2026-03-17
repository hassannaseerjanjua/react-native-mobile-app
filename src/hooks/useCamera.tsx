import { useCallback, useRef, useState } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import {
  Camera,
  CameraPermissionStatus,
  RecordVideoOptions,
  useCameraDevice,
} from 'react-native-vision-camera';
import { useLocaleStore } from '../store/reducer/locale';

export function useVisionCamera(frameProcessor?: (frame: any) => void) {
  const { getString } = useLocaleStore();
  const cameraRef = useRef<Camera>(null);
  const [cameraPosition, setCameraPosition] = useState<'front' | 'back'>(
    'front',
  );
  const frontDevice = useCameraDevice('front');
  const backDevice = useCameraDevice('back');
  const device = cameraPosition === 'front' ? frontDevice : backDevice;

  const [permission, setPermission] =
    useState<CameraPermissionStatus>('not-determined');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false); // ✅ Changed to false
  const [recordingDuration, setRecordingDuration] = useState(0);

  const [timer, setTimer] = useState(0);
  const timerRef = useRef<any>(null);

  // Toggle camera between front and back
  const toggleCamera = useCallback(() => {
    setCameraPosition(prev => (prev === 'front' ? 'back' : 'front'));
  }, []);

  // Request Permissions - returns true if granted, false if denied
  const requestPermission = useCallback(async (): Promise<boolean> => {
    // Check current permission status first
    let cameraStatus = await Camera.getCameraPermissionStatus();
    let micStatus = await Camera.getMicrophonePermissionStatus();

    // If camera already denied (user retrying) - show open settings
    if (cameraStatus === 'denied' || cameraStatus === 'restricted') {
      Alert.alert(
        getString('GIFT_MESSAGE_PERMISSION_DENIED_TITLE'),
        getString('GIFT_MESSAGE_CAMERA_PERMISSION_DENIED_OPEN_SETTINGS'),
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: getString('GIFT_MESSAGE_OPEN_SETTINGS'),
            onPress: () => Linking.openSettings(),
          },
        ],
      );
      return false;
    }

    // If microphone already denied (user retrying) - show open settings
    if (micStatus === 'denied' || micStatus === 'restricted') {
      Alert.alert(
        getString('GIFT_MESSAGE_MIC_PERMISSION_DENIED_TITLE'),
        getString('GIFT_MESSAGE_MIC_PERMISSION_DENIED_OPEN_SETTINGS'),
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: getString('GIFT_MESSAGE_OPEN_SETTINGS'),
            onPress: () => Linking.openSettings(),
          },
        ],
      );
      return false;
    }

    // Request camera permission if not granted
    if (cameraStatus !== 'granted') {
      cameraStatus = await Camera.requestCameraPermission();
      if (cameraStatus !== 'granted') {
        Alert.alert(
          getString('GIFT_MESSAGE_PERMISSION_DENIED_TITLE'),
          getString('GIFT_MESSAGE_CAMERA_PERMISSION_DENIED'),
          [{ text: 'OK' }],
        );
        setPermission(cameraStatus);
        setIsAuthorized(false);
        return false;
      }
    }

    // Request microphone permission if not granted
    if (micStatus !== 'granted') {
      micStatus = await Camera.requestMicrophonePermission();
      if (micStatus !== 'granted') {
        Alert.alert(
          getString('GIFT_MESSAGE_MIC_PERMISSION_DENIED_TITLE'),
          getString('GIFT_MESSAGE_MIC_PERMISSION_DENIED'),
          [{ text: 'OK' }],
        );
        setPermission(cameraStatus);
        setIsAuthorized(false);
        return false;
      }
    }

    const currentDevice =
      cameraPosition === 'front' ? frontDevice : backDevice;
    if (!currentDevice) {
      Alert.alert('Error', 'No camera device found');
      setPermission(cameraStatus);
      setIsAuthorized(false);
      return false;
    }

    // Both permissions granted
    setIsCameraActive(true);
    setPermission(cameraStatus);
    setIsAuthorized(true);
    return true;
  }, [frontDevice, backDevice, cameraPosition, getString]);

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

      // Clear the timer interval first to stop console logging
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      setRecordingDuration(0);
      setTimer(0);

      if (cameraRef.current) {
        await cameraRef.current.stopRecording();
      }

      setIsCameraActive(false);

      console.log('Recording cancelled');
    } catch (err) {
      console.warn('Error cancelling recording:', err);
      // Ensure timer is cleared even on error
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
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
      // Start timer only when recording is actually started
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => {
          const next = prev + 1;
          // Removed console.log to reduce noise
          setTimer(prev => prev - 1);
          if (durationLimitSeconds && next >= durationLimitSeconds) {
            stopRecording();
          }
          return next;
        });
      }, 1000);

      const recordingOptions: RecordVideoOptions = {
        flash: 'off',
        fileType: 'mp4',
        ...(Platform.OS === 'android' && {
          videoCodec: 'h264',
          videoBitRate: 5000000, // 5 Mbps for better compatibility
        }),
        ...options,
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
      };

      cameraRef.current.startRecording(recordingOptions);
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
    toggleCamera,
    cameraPosition,
  };
}
