import { Alert, Linking, PermissionsAndroid, Platform } from 'react-native';
import { Camera } from 'react-native-vision-camera';
import type { GetStringFunctionType } from '../store/reducer/locale';

type GetStringFn = GetStringFunctionType;

const showCameraPermissionDeniedAlert = (getString: GetStringFn) => {
  Alert.alert(
    getString('GIFT_MESSAGE_PERMISSION_DENIED_TITLE'),
    getString('GIFT_MESSAGE_CAMERA_PERMISSION_DENIED_OPEN_SETTINGS'),
    [
      { text: getString('NG_CANCEL'), style: 'cancel' },
      {
        text: getString('GIFT_MESSAGE_OPEN_SETTINGS'),
        onPress: () => Linking.openSettings(),
      },
    ],
  );
};

export const showGalleryPermissionDeniedAlert = (getString: GetStringFn) => {
  Alert.alert(
    getString('GIFT_MESSAGE_GALLERY_PERMISSION_DENIED_TITLE'),
    getString('GIFT_MESSAGE_GALLERY_PERMISSION_DENIED_OPEN_SETTINGS'),
    [
      { text: getString('NG_CANCEL'), style: 'cancel' },
      {
        text: getString('GIFT_MESSAGE_OPEN_SETTINGS'),
        onPress: () => Linking.openSettings(),
      },
    ],
  );
};

/**
 * Request camera permission for photo capture (e.g. profile photo).
 * Returns true if granted, false if denied.
 */
export async function requestCameraPermissionForPhoto(
  getString: GetStringFn,
): Promise<boolean> {
  let cameraStatus = await Camera.getCameraPermissionStatus();

  // On iOS: if already denied, show open settings
  if (
    Platform.OS === 'ios' &&
    (cameraStatus === 'denied' || cameraStatus === 'restricted')
  ) {
    showCameraPermissionDeniedAlert(getString);
    return false;
  }

  // Request camera permission if not granted
  if (cameraStatus !== 'granted') {
    const requestWithTimeout = <T>(
      promise: Promise<T>,
      timeoutMs: number,
    ): Promise<T | 'timeout'> =>
      Promise.race([
        promise,
        new Promise<'timeout'>(resolve =>
          setTimeout(() => resolve('timeout'), timeoutMs),
        ),
      ]);

    const result = await requestWithTimeout(
      Camera.requestCameraPermission(),
      Platform.OS === 'android' ? 500 : 5000,
    );
    cameraStatus = result === 'timeout' ? 'denied' : result;

    if (cameraStatus !== 'granted') {
      setTimeout(() => showCameraPermissionDeniedAlert(getString), 300);
      return false;
    }
  }

  return true;
}

/**
 * Request gallery/photo library permission for selecting images.
 * Android: Requests READ_MEDIA_IMAGES (API 33+) or READ_EXTERNAL_STORAGE.
 * iOS: System prompt is shown when the picker opens; if access was denied earlier,
 * handle failure via onPermissionDenied on selectAndCropImage.
 */
export async function requestGalleryPermission(
  getString: GetStringFn,
): Promise<boolean> {
  if (Platform.OS === 'android') {
    const sdk =
      typeof Platform.Version === 'number' ? Platform.Version : 0;
    const permission =
      sdk >= 33
        ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
        : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;

    try {
      const alreadyGranted = await PermissionsAndroid.check(permission);
      if (alreadyGranted) {
        return true;
      }

      const result = await PermissionsAndroid.request(permission);
      if (result === PermissionsAndroid.RESULTS.GRANTED) {
        return true;
      }

      showGalleryPermissionDeniedAlert(getString);
      return false;
    } catch {
      showGalleryPermissionDeniedAlert(getString);
      return false;
    }
  }

  return true;
}
