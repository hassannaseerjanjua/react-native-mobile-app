import {
  Text as RNText,
  TextProps,
  I18nManager,
  Platform,
  StyleSheet,
} from 'react-native';
import { useLocaleStore } from '../store/reducer/locale';

export const Text = (props: TextProps) => {
  const { isRtl } = useLocaleStore();
  const flattenedStyle = StyleSheet.flatten(props.style) || {};
  const fontSize = flattenedStyle.fontSize ?? 14;
  const shouldAdjustArabic =
    isRtl && Platform.OS === 'ios' && flattenedStyle.lineHeight == null;
  const arabicAdjustments = shouldAdjustArabic
    ? {
        lineHeight: Math.round(fontSize * 1.43),
        marginBottom: -Math.max(1, Math.round(fontSize * 0.2)),
      }
    : null;

  return (
    <RNText
      {...props}
      allowFontScaling={false}
      style={[
        { writingDirection: isRtl ? 'rtl' : 'ltr' },
        arabicAdjustments,
        props.style,
      ]}
    />
  );
};
