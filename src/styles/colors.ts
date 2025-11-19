import { useColorScheme } from 'react-native';

const defaultColors = {
  BACKGROUND: '#ffffff',
  HOME_BACKGROUND: '#fcfcfc',
  GRADIENT_COLOR: '#DCEDFD',
  PRIMARY: '#F08080',
  PRIMARY_TEXT: '#313131',
  SECONDARY: '#FEECDC',
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
  // BACKGROUND: 'black',
  // TEXT: 'white',
  // PRIMARY_BACKGROUND: '#F6F9FE',
  // LIGHT_GRAY: '#5c5e5c',
  // GRAY: 'grey',
};

const colorsLight = {
  ...defaultColors,
  isDark: false,
  // BACKGROUND: 'white',
  // PRIMARY_BACKGROUND: '#F6F9FE',
  // TEXT: 'black',
  // LIGHT_GRAY: '#c1c7c2',
  // GRAY: 'grey',
};

export type Colors = typeof colorsDark;

export const useColors = () => {
  return colorsLight;
};
