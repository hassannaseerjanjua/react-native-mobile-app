import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

const getSizes = (width: number, height: number) => ({
  WIDTH: width,
  HEIGHT: height,
  PADDING: width * 0.04,
  PADDED_WIDTH: width - width * 0.06,
  ICON: width * 0.06,
  BOTTOM_PADDING: height * 0.05,

  // Borders
  BORDER_RADIUS: 8,
  BORDER_RADIUS_HIGH: 15,

  // Fonts
  FONTSIZE_BUTTON: 15,
  FONTSIZE: 14,
  FONTSIZE_HIGH: 18,
  FONTSIZE_SMALL: 10,
  HEADER_FOOTER_SIZE: height * 0.1,
  FONTSIZE_HEADING: 20,
  // Sizes
  APP_LOGO: width * 0.4,
});

export type Sizes = ReturnType<typeof getSizes>;

export const useSizes = () => {
  const { width, height } = useWindowDimensions();
  return useMemo(() => getSizes(width, height), [width, height]);
};
