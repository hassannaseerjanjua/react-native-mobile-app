import { Platform } from 'react-native';
import { scale } from 'react-native-size-matters';
import { DropdownOption } from '../components/global/DropdownField';

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
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
};

export const dynamicArrayItem = (item: any, condition: boolean) => {
  if (condition) {
    return [item];
  }
  return [];
};

// RTL Utilities
export * from './rtl';
