import { I18nManager } from 'react-native';

export const isRTL = () => I18nManager.isRTL;

/** LTR isolate (U+2066…U+2069) so Latin handles like @username keep correct visual order in RTL UI. */
export const ltrIsolate = (text: string): string =>
  `\u2066${text}\u2069`;

export const rtlDirection = (isRtl: boolean) => (isRtl ? 'rtl' : 'ltr');

export const rtlTextAlign = (isRtl: boolean) => (isRtl ? 'right' : 'left');

export const rtlFlexDirection = (isRtl: boolean) =>
  isRtl ? 'row-reverse' : 'row';

export const rtlRotate = (isRtl: boolean, degree: string = '180deg') =>
  isRtl ? degree : '0deg';

export const rtlTransform = (isRtl: boolean) => [{ scaleX: isRtl ? -1 : 1 }];

export const rtlMargin = (
  isRtl: boolean,
  leftValue: number,
  rightValue: number,
) => ({
  marginLeft: isRtl ? rightValue : leftValue,
  marginRight: isRtl ? leftValue : rightValue,
});

export const rtlPadding = (
  isRtl: boolean,
  leftValue: number,
  rightValue: number,
) => ({
  paddingLeft: isRtl ? rightValue : leftValue,
  paddingRight: isRtl ? leftValue : rightValue,
});

export const rtlPosition = (
  isRtl: boolean,
  leftValue?: number,
  rightValue?: number,
) => ({
  left: isRtl ? rightValue : leftValue,
  right: isRtl ? leftValue : rightValue,
});

export const rtlAlignSelf = (isRtl: boolean) =>
  isRtl ? 'flex-end' : 'flex-start';

export const rtlAlignItems = (isRtl: boolean) =>
  isRtl ? 'flex-end' : 'flex-start';

export const rtlJustifyContent = (isRtl: boolean) =>
  isRtl ? 'flex-end' : 'flex-start';
