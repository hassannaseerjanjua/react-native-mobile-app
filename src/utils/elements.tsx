import React from 'react';
import {
  Text as RNText,
  TextInput as RNTextInput,
  TextProps,
  TextInputProps,
  I18nManager,
  Platform,
  StyleSheet,
} from 'react-native';
import { useLocaleStore } from '../store/reducer/locale';
import fonts from '../assets/fonts';
import { getFontsForLanguage } from '../assets/fonts';

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

  const androidAdjustments =
    Platform.OS === 'android' && isRtl && flattenedStyle.lineHeight == null
      ? {
          // includeFontPadding: false,
          // lineHeight: Math.round(fontSize * 1.2),
        }
      : null;

  const textValue = React.Children.toArray(props.children)
    .map(child =>
      typeof child === 'string' || typeof child === 'number'
        ? String(child)
        : '',
    )
    .join('');

  const hasArabicChars =
    /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(
      textValue,
    );
  const hasLatinChars = /[A-Za-z0-9]|[@._%+\-]/.test(textValue);
  // const hasExplicitFontFamily = Boolean(flattenedStyle.fontFamily);

  const resolveFontFamily = () => {
    const fontFamilyRaw =
      typeof flattenedStyle.fontFamily === 'string'
        ? flattenedStyle.fontFamily.toLowerCase()
        : '';
    const weightRaw = flattenedStyle.fontWeight;
    const weight =
      typeof weightRaw === 'string' ? parseInt(weightRaw, 10) : weightRaw;

    const weightKeyFromFamily = (() => {
      if (fontFamilyRaw.includes('extrabold')) return 'extraBold';
      if (fontFamilyRaw.includes('black')) return 'black';
      if (fontFamilyRaw.includes('semibold')) return 'semibold';
      if (fontFamilyRaw.includes('bold')) return 'bold';
      if (fontFamilyRaw.includes('medium')) return 'medium';
      if (fontFamilyRaw.includes('extralight')) return 'extraLight';
      if (fontFamilyRaw.includes('light')) return 'light';
      if (fontFamilyRaw.includes('regular')) return 'regular';
      return undefined;
    })();

    const weightKeyFromWeight = (() => {
      if (weightRaw === 'bold' || (typeof weight === 'number' && weight >= 700))
        return 'bold';
      if (typeof weight === 'number' && weight >= 600) return 'semibold';
      if (typeof weight === 'number' && weight >= 500) return 'medium';
      return undefined;
    })();

    const pick = (
      family: typeof fonts.Quicksand | typeof fonts.Tajawal,
      key?: string,
    ) => {
      switch (key) {
        case 'extraBold':
          return (family as any).extraBold || family.bold;
        case 'black':
          return (family as any).black || family.bold;
        case 'semibold':
          return (family as any).semibold || family.bold;
        case 'bold':
          return family.bold;
        case 'medium':
          return family.medium || family.regular;
        case 'extraLight':
          return (family as any).extraLight || family.light || family.regular;
        case 'light':
          return family.light || family.regular;
        case 'regular':
          return family.regular;
        default:
          return family.regular;
      }
    };

    const weightKey = weightKeyFromFamily || weightKeyFromWeight;

    if (hasArabicChars && !hasLatinChars) return pick(fonts.Tajawal, weightKey);
    if (hasLatinChars && !hasArabicChars)
      return pick(fonts.Quicksand, weightKey);
    return undefined;
  };

  const resolvedFamily = textValue ? resolveFontFamily() : undefined;
  const scriptFontStyle = resolvedFamily
    ? { fontFamily: resolvedFamily }
    : null;
  return (
    <RNText
      {...props}
      allowFontScaling={false}
      style={[
        { writingDirection: isRtl ? 'rtl' : 'ltr' },
        arabicAdjustments,
        props.style,
        scriptFontStyle,
        androidAdjustments,
      ]}
    />
  );
};

const ARABIC_REGEX =
  /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
const LATIN_REGEX = /[A-Za-z0-9]|[@._%+\-]/;

export const TextInput = React.forwardRef<RNTextInput, TextInputProps>(
  (props, ref) => {
    const { isRtl, langCode } = useLocaleStore();
    const isArabic = langCode === 'ar';
    const flattenedStyle = StyleSheet.flatten(props.style) || {};
    const fontSize = flattenedStyle.fontSize ?? 16;

    // Detect script from actual content; fall back to app language
    const content = (() => {
      if (props.value != null) return String(props.value);
      if (props.defaultValue != null) return String(props.defaultValue);
      if (typeof props.placeholder === 'string') return props.placeholder;
      return '';
    })();
    const hasArabic = ARABIC_REGEX.test(content);
    const hasLatin = LATIN_REGEX.test(content);

    const useArabicFont =
      hasArabic && !hasLatin ? true : hasLatin && !hasArabic ? false : isArabic;

    const fontFamily = getFontsForLanguage(useArabicFont).regular;

    const platformAdjustments = (() => {
      if (Platform.OS === 'android') {
        return {
          includeFontPadding: false,
          // paddingTop: Math.round(fontSize * 0.2),
          paddingBottom: 0,
        };
      }
      if (Platform.OS === 'ios' && isRtl && flattenedStyle.lineHeight == null) {
        return {
          lineHeight: Math.round(fontSize * 1.3),
          paddingBottom: Math.max(1, Math.round(fontSize * 0.2)),
        };
      }
      return null;
    })();

    return (
      <RNTextInput
        ref={ref}
        {...props}
        allowFontScaling={false}
        style={[
          Platform.OS === 'ios'
            ? { writingDirection: isRtl ? 'rtl' : 'ltr' }
            : null,
          props.style,
          { fontFamily },
          platformAdjustments,
        ]}
      />
    );
  },
);
