import { useColorScheme } from 'react-native';

const defaultColors = {
  //App Colors
  PRIMARY: '#4B2D5C',
  SECONDARY: '#F9EDFF',

  BACKGROUND: '#ffffff',
  HOME_BACKGROUND: '#fcfcfc',
  GRADIENT_COLOR: '#DCEDFD',
  PRIMARY_TEXT: '#313131',
  SECONDARY_TEXT: '#A0A0A0',
  UNDERLINE: '#C6C6C6',
  BORDER_COLOR: '#ECECEC',
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
