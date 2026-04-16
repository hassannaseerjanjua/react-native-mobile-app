import { Platform } from 'react-native';
import { scale } from 'react-native-size-matters';
import ImageCompressor from 'react-native-compressor';

export const isAndroid = Platform.OS === 'android';
export const isAndroidThen = (x: any, y: any) => (isAndroid ? x : y);
export const isIOS = Platform.OS === 'ios';
export const isIOSThen = (x: any, y: any) => (isIOS ? x : y);

export const scaleWithMax = (value: number, max: number) => {
  return Math.min(scale(value), max);
};

export const compressImage = async (image: string) => {
  try {
    const compressedImage = await ImageCompressor.Image.compress(image);
    return fileUriWrapper(compressedImage);
  } catch (error) {
    console.error('Error compressing image:', error);
    return fileUriWrapper(image);
  }
};
