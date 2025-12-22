import { Platform } from 'react-native';
import { scale } from 'react-native-size-matters';
import { DropdownOption } from '../components/global/DropdownField';
import ImageCompressor from 'react-native-compressor';

export const isAndroid = Platform.OS === 'android';
export const isAndroidThen = (x: any, y: any) => (isAndroid ? x : y);
export const isIOS = Platform.OS === 'ios';
export const isIOSThen = (x: any, y: any) => (isIOS ? x : y);

export const scaleWithMax = (value: number, max: number) => {
  return Math.min(scale(value), max);
};

export const toOption = <T>(
  data: T[],
  label: keyof T,
  value: keyof T,
): DropdownOption[] => {
  return data.map(item => ({
    label: item[label] as string,
    value: item[value] as any,
  }));
};

export const getQueryFromObject = (obj: Record<string, any>) => {
  return Object.entries(obj)
    .filter(([_, value]) => value !== null && value !== undefined)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
};

export const dynamicArrayItem = (item: any, condition: boolean) => {
  if (condition) {
    return [item];
  }
  return [];
};

export * from './rtl';

export const fileUriWrapper = (uri: string) => {
  if (isIOS) {
    return uri.replace('file://', '');
  }

  if (uri.startsWith('file://')) {
    return uri;
  }
  return `file://${uri}`;
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
