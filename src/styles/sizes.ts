import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import { scaleWithMax } from '../utils';

const getSizes = (width: number, height: number) => ({
  WIDTH: width,
  HEIGHT: height,
  PADDING: width * 0.04,
  PADDED_WIDTH: width - width * 0.08,
  ICON: width * 0.06,
  BOTTOM_PADDING: height * 0.05,

  // Borders
  BORDER_RADIUS: 8,
  BORDER_RADIUS_MID: 12,
  BORDER_RADIUS_HIGH: 15,

  // Fonts
  FONTSIZE_BUTTON: scaleWithMax(14, 15),
  FONTSIZE: scaleWithMax(13, 14),
  FONTSIZE_HIGH: scaleWithMax(19, 21),
  FONT_SIZE_EXTRA_HIGH: scaleWithMax(22, 24),
  FONTSIZE_LESS_HIGH: scaleWithMax(16, 17),
  FONTSIZE_SMALL: scaleWithMax(9, 10),
  FONTSIZE_MEDIUM: scaleWithMax(11, 12),
  HEADER_FOOTER_SIZE: height * 0.1,
  FONTSIZE_MED_HIGH: scaleWithMax(17, 18),
  FONTSIZE_HEADING: scaleWithMax(19, 20),
  // Sizes
  APP_LOGO: width * 0.4,
});

export type Sizes = ReturnType<typeof getSizes>;

export const useSizes = () => {
  const { width, height } = useWindowDimensions();
  return useMemo(() => getSizes(width, height), [width, height]);
};
