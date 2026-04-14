import React, { useMemo } from 'react';
import {
  StyleSheet,
  View,
  type ViewStyle,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';

interface ShadowLayoutProps {
  preset: ShadowLayoutPreset;
  /** Overlay-only mode (recommended for navigators to avoid re-mounting/wrapping). */
  overlayOnly?: boolean;
  children?: React.ReactNode;
  /** Container style for the wrapper that holds children + overlay (wrap mode). */
  style?: ViewStyle | ViewStyle[];
  /** Overlay style for the gradient itself (overlay-only mode). */
  overlayStyle?: ViewStyle | ViewStyle[];
  /** Gradient "shadow" color (alpha recommended). */
  shadowColor?: string;
}

const DEFAULT_SHADOW_COLOR = 'rgba(0,0,0,0.12)';
const FAVORITES_GRADIENT = {
  angle: 230.94,
  colors: ['rgba(255, 247, 241, 0.55)', 'rgba(255, 255, 255, 0.55)'],
  //   colors: ['rgb(255, 111, 0)', 'rgb(255, 0, 0)'],
  locations: [0.2472, 0.7617] as number[],
} as const;

const OCCASIONS_GRADIENT = {
  angle: 0,
  // 3 stops + transparency for a smoother fade-out.
  colors: [
    'rgba(255, 247, 241, 0.7)',
    'rgba(255, 255, 255, 0.28)',
    'rgba(255, 255, 255, 0)',
  ],
  //   colors: ['rgb(255, 111, 0)', 'rgb(255, 0, 0)'],
  // Figma stop goes past 100% (121.72%). RN locations should be within [0..1].
  // Kept for reference; `gradientProps` overrides locations for a smoother tail.
  locations: [0.05, 0.55, 0.92] as number[],
} as const;

// Figma measurements appear based on a 375x812 artboard.
const FIGMA_BASE = { width: 375, height: 812 } as const;

export type ShadowLayoutPreset =
  | 'towardsLeft'
  | 'towardsRight'
  | 'towardsBottom';

const ShadowLayout: React.FC<ShadowLayoutProps> = ({
  preset,
  overlayOnly = false,
  children,
  style,
  overlayStyle,
  shadowColor = DEFAULT_SHADOW_COLOR,
}) => {
  const { width, height } = useWindowDimensions();

  const computedOverlayStyle = useMemo(() => {
    switch (preset) {
      case 'towardsLeft': {
        // Same blob as towardsRight, but anchored to the left side.
        const figmaW = 314.99999254988643;
        const figmaH = 335.99999205321217;
        const figmaTop = -97;
        const figmaLeft = 71;
        // Mirror horizontally: use the same "overhang" value as towardsRight,
        // but apply it to the left side so the blob bleeds off the left edge.
        const figmaRight = FIGMA_BASE.width - (figmaLeft + figmaW);

        const w = (figmaW / FIGMA_BASE.width) * width;
        const h = (figmaH / FIGMA_BASE.height) * height;
        const t = (figmaTop / FIGMA_BASE.height) * height;
        const l = (figmaRight / FIGMA_BASE.width) * width;
        return [
          styles.overlayBase,
          {
            width: Math.round(w),
            height: Math.round(h),
            top: Math.round(t),
            left: Math.round(l),
          },
        ] as const;
      }
      case 'towardsRight': {
        const figmaW = 314.99999254988643;
        const figmaH = 335.99999205321217;
        const figmaTop = -97;
        const figmaLeft = 71;
        // Mirror horizontally: compute "right" from Figma's left+width.
        // Note: in your Figma numbers, this becomes negative (extends past the edge),
        // which is expected for a soft blob.
        const figmaRight = FIGMA_BASE.width - (figmaLeft + figmaW);

        const w = (figmaW / FIGMA_BASE.width) * width;
        const h = (figmaH / FIGMA_BASE.height) * height;
        const t = (figmaTop / FIGMA_BASE.height) * height;
        const r = (figmaRight / FIGMA_BASE.width) * width;
        return [
          styles.overlayBase,
          {
            width: Math.round(w),
            height: Math.round(h),
            top: Math.round(t),
            right: Math.round(r),
          },
        ] as const;
      }
      case 'towardsBottom': {
        const figmaH = 150;
        const figmaTop = -20;
        const h = (figmaH / FIGMA_BASE.height) * height;
        const t = (figmaTop / FIGMA_BASE.height) * height;

        return [
          styles.overlayBase,
          {
            height: Math.round(h),
            top: Math.round(t),
            left: 0,
            right: 0,
          },
        ] as const;
      }
    }
  }, [preset, width, height]);

  const gradientProps = useMemo(() => {
    switch (preset) {
      case 'towardsLeft':
        return {
          // Mirror of towardsRight (flip the gradient direction).
          useAngle: true,
          angle: (360 - (FAVORITES_GRADIENT.angle % 360)) % 360,
          angleCenter: { x: 0.5, y: 0.5 },
          colors: [...FAVORITES_GRADIENT.colors],
          locations: [...FAVORITES_GRADIENT.locations],
        };
      case 'towardsRight':
        return {
          // Match Figma: linear-gradient(230.94deg, ...)
          useAngle: true,
          angle: FAVORITES_GRADIENT.angle,
          angleCenter: { x: 0.5, y: 0.5 },
          colors: [...FAVORITES_GRADIENT.colors],
          locations: [...FAVORITES_GRADIENT.locations],
        };
      case 'towardsBottom':
        return {
          // Force a true top→bottom fade to avoid a hard seam at the bottom edge.
          useAngle: false,
          start: { x: 0.5, y: 0 },
          end: { x: 0.5, y: 1 },
          colors: [...OCCASIONS_GRADIENT.colors],
          // Reach full transparency slightly before the bottom for a smoother blend.
          locations: [0.05, 0.55, 0.92] as number[],
        };
    }
  }, [preset, shadowColor]);

  const gradient = (
    <LinearGradient
      pointerEvents="none"
      {...gradientProps}
      style={[computedOverlayStyle as any, overlayStyle as any]}
    />
  );

  if (overlayOnly) return gradient;

  return (
    <View style={[styles.container, style]}>
      {children}
      {gradient}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  overlayBase: {
    position: 'absolute',
  },
});

export default ShadowLayout;
