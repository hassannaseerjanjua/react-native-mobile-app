import { useColorScheme } from 'react-native';

const defaultColors = {
  //App Colors
  PRIMARY: '#F72E50',
  SECONDARY: '#FFDDE3',

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
  SECONDARY_GRAY: '#D9D9D9',
  STATUS_BAR_BACKGROUND: 'rgba(255, 255, 255, 0.75)',
  DIVIDER_COLOR: '#F1F1F1',
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
