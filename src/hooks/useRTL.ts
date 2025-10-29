import { useLocaleStore } from '../store/reducer/locale';
import {
  rtlDirection,
  rtlTextAlign,
  rtlFlexDirection,
  rtlRotate,
  rtlTransform,
  rtlMargin,
  rtlPadding,
  rtlPosition,
  rtlAlignSelf,
  rtlAlignItems,
  rtlJustifyContent,
} from '../utils/rtl';

export const useRTL = () => {
  const { isRtl } = useLocaleStore();

  return {
    isRtl,
    direction: rtlDirection(isRtl),
    textAlign: rtlTextAlign(isRtl),
    flexDirection: rtlFlexDirection(isRtl),
    rotate: (degree?: string) => rtlRotate(isRtl, degree),
    transform: rtlTransform(isRtl),
    margin: (leftValue: number, rightValue: number) =>
      rtlMargin(isRtl, leftValue, rightValue),
    padding: (leftValue: number, rightValue: number) =>
      rtlPadding(isRtl, leftValue, rightValue),
    position: (leftValue?: number, rightValue?: number) =>
      rtlPosition(isRtl, leftValue, rightValue),
    alignSelf: rtlAlignSelf(isRtl),
    alignItems: rtlAlignItems(isRtl),
    justifyContent: rtlJustifyContent(isRtl),
  };
};
