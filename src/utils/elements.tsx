import React, { useState, useRef, useEffect } from 'react';
import {
  Text as RNText,
  TextInput as RNTextInput,
  Image as RNImage,
  Animated,
  TextProps,
  TextInputProps,
  ImageProps,
  I18nManager,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

const placeholder = require('../assets/images/img-placeholder.png');

// ---------------------------------------------------------------------------
// Persistent image URI cache
// ---------------------------------------------------------------------------
// In-memory Set for instant lookups this session.
// Backed by AsyncStorage so it survives app restarts.
// A URI stays cached until it fails to load (e.g. URL removed/changed).
// ---------------------------------------------------------------------------

const CACHE_STORAGE_KEY = '@image_uri_cache';
const MAX_CACHE_SIZE = 500; // cap to avoid unbounded growth

const loadedUriCache = new Set<string>();
let persistDebounceTimer: ReturnType<typeof setTimeout> | null = null;

// Resolves once the persisted cache has been loaded from AsyncStorage.
// handleLoad awaits this before checking wasCached, so images that fire
// onLoad before AsyncStorage finishes still get the correct behaviour.
const cacheReadyPromise = AsyncStorage.getItem(CACHE_STORAGE_KEY)
  .then(raw => {
    if (!raw) return;
    const uris: string[] = JSON.parse(raw);
    uris.forEach(uri => loadedUriCache.add(uri));
  })
  .catch(() => {});

const persistCache = () => {
  if (persistDebounceTimer) clearTimeout(persistDebounceTimer);
  persistDebounceTimer = setTimeout(() => {
    const uris = Array.from(loadedUriCache).slice(-MAX_CACHE_SIZE);
    AsyncStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(uris)).catch(
      () => {},
    );
  }, 1000);
};

const addToCache = (uri: string) => {
  loadedUriCache.add(uri);
  persistCache();
};

const removeFromCache = (uri: string) => {
  if (!loadedUriCache.has(uri)) return;
  loadedUriCache.delete(uri);
  persistCache();
};

interface AppImageProps extends ImageProps {
  placeholderSource?: ImageProps['source'];
}

export const Image = ({
  placeholderSource,
  style,
  source,
  onLoad,
  onError,
  ...rest
}: AppImageProps) => {
  const isLocalSource = typeof source === 'number';
  const sourceKey = Array.isArray(source)
    ? source.map(item => (item as any)?.uri || '').join('|')
    : typeof source === 'number'
    ? String(source)
    : (source as any)?.uri || '';

  // Always start with placeholder visible. For cached URIs the native layer
  // still needs a moment to paint — we snap opacity to 1 the instant onLoad
  // fires (no fade animation), which is near-instant from the native cache.
  const [loaded, setLoaded] = useState(isLocalSource);
  const opacity = useRef(new Animated.Value(isLocalSource ? 1 : 0)).current;

  // Separate layout-safe styles (valid on View) from image-only styles
  const flatStyle = (StyleSheet.flatten(style) || {}) as any;
  const {
    resizeMode: styleResizeMode,
    objectFit,
    tintColor,
    ...viewStyle
  } = flatStyle;
  const resizeMode =
    styleResizeMode ?? (objectFit ? objectFit : undefined) ?? 'cover';

  useEffect(() => {
    if (isLocalSource) {
      setLoaded(true);
      opacity.setValue(1);
      return;
    }
    setLoaded(false);
    opacity.setValue(0);
  }, [sourceKey, isLocalSource, opacity]);

  const handleLoad = async (e: any) => {
    // Wait for the persisted cache to finish loading from AsyncStorage.
    // After the first resolution this is a no-op (resolved microtask).
    await cacheReadyPromise;

    const wasCached = Boolean(sourceKey) && loadedUriCache.has(sourceKey);
    if (sourceKey) addToCache(sourceKey);

    if (wasCached) {
      // Already in cache: snap immediately, no fade animation
      opacity.setValue(1);
    } else {
      Animated.timing(opacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
    setLoaded(true);
    onLoad?.(e);
  };

  const handleError = (e: any) => {
    removeFromCache(sourceKey);
    setLoaded(false);
    opacity.setValue(0);
    onError?.(e);
  };

  if (isLocalSource) {
    return (
      <RNImage
        {...rest}
        source={source}
        resizeMode={resizeMode}
        onError={handleError}
        style={[style as any, { tintColor }]}
      />
    );
  }

  return (
    <View
      style={[
        viewStyle,
        { overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
      ]}
    >
      {!loaded && (
        <RNImage
          source={placeholderSource ?? placeholder}
          style={[{ width: '100%', height: '100%' }, { resizeMode }]}
        />
      )}
      <Animated.Image
        {...rest}
        source={source}
        resizeMode={resizeMode}
        onLoad={handleLoad}
        onError={handleError}
        style={[StyleSheet.absoluteFill, { opacity, tintColor }]}
      />
    </View>
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
          paddingTop: Math.round(fontSize * 0.2),
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
