import { useColorScheme } from 'react-native';

const defaultColors = {
  //App Colors
  PRIMARY: '#2E7CF6',
  SECONDARY: '#E9F1FE',

  BACKGROUND: '#F5F7FA',
  HOME_BACKGROUND: '#F5F7FA',
  GRADIENT_COLOR: '#2E7CF6',
  PRIMARY_TEXT: '#1A1A1A',
  SECONDARY_TEXT: '#718096',
  UNDERLINE: '#CBD5E0',
  BORDER_COLOR: '#E2E8F0',
  RED: '#FF0000',
  BLACK: 'black',
  WHITE: 'white',
  LIGHT_GRAY: '#F9F9F9',
  LIGHT_GRAY_2: '#F8F8F8',
  GRAY: '#808080',
  SECONDARY_GRAY: '#D9D9D9',
  STATUS_BAR_BACKGROUND: 'rgba(255, 255, 255, 0.75)',
  DIVIDER_COLOR: '#F1F1F1',
  DARK_GRAY: '#1A1A1A',
};

const colorsDark = {
  ...defaultColors,
  isDark: true,
};

const colorsLight = {
  ...defaultColors,
  isDark: false,
};

export type Colors = typeof colorsDark;

export const useColors = () => {
  return colorsLight;
};
