import {
  StyleProp,
  StyleSheet,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import React, { useMemo } from 'react';
import fonts from '../../assets/fonts';
import { SvgRiyalIcon } from '../../assets/icons';
import { useSizes } from '../../styles/sizes';
import useTheme from '../../styles/theme';
import { formatNumericValueForDisplay, scaleWithMax } from '../../utils';
import { Text } from '../../utils/elements';
import { useLocaleStore } from '../../store/reducer/locale';

type PriceVariant = 'default' | 'discounted' | 'cut';

const PriceWithIcon = ({
  amount,
  textStyle,
  containerStyle,
  icon = (
    <SvgRiyalIcon width={scaleWithMax(12, 14)} height={scaleWithMax(12, 14)} />
  ),
  showIcon = true,
  iconOpacity = 1,
  iconSize = scaleWithMax(12, 14),
  iconPosition = 'start',
  variant = 'default',
  gap,
  /** In RTL, render icon on left of price (fixes Android Arabic) */
  iconOnLeftInRtl = false,
}: {
  amount: number | string;
  textStyle?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  icon?: React.ReactNode;
  showIcon?: boolean;
  iconOpacity?: number;
  iconSize?: number;
  iconPosition?: 'start' | 'end';
  variant?: PriceVariant;
  gap?: number;
  iconOnLeftInRtl?: boolean;
}) => {
  const { styles, theme, rowGap } = useStyles();
  const { isRtl } = useLocaleStore();

  const displayAmount = useMemo(
    () => formatNumericValueForDisplay(amount),
    [amount],
  );

  const swapOrder = iconOnLeftInRtl && isRtl;
  const rowDirection = swapOrder
    ? 'row'
    : iconPosition === 'start'
    ? isRtl
      ? 'row-reverse'
      : 'row'
    : isRtl
    ? 'row'
    : 'row-reverse';

  /** Colors/sizes only — Gilroy semibold locked last so parent `textStyle` cannot replace weight (e.g. wallet, orders). */
  const variantTextStyle = (() => {
    switch (variant) {
      case 'discounted':
        return {
          color: theme.colors.PRIMARY,
          fontSize: theme.sizes.FONTSIZE_SMALL_HEADING,
        };
      case 'cut':
        return {
          color: '#C6C6C6',
          fontSize: theme.sizes.FONTSIZE_MEDIUM,
          textDecorationLine: 'line-through' as const,
        };
      default:
        return {
          color: theme.colors.PRIMARY_TEXT,
          fontSize: theme.sizes.FONTSIZE_BUTTON,
        };
    }
  })();

  const priceTypefaceLock: TextStyle = {
    fontFamily:
      variant === 'cut' ? fonts.Gilroy.medium : fonts.Gilroy.semibold,
    fontWeight: 'normal',
  };

  const resolvedIcon =
    showIcon && icon && React.isValidElement<any>(icon)
      ? React.cloneElement(icon as React.ReactElement<any>, {
          width: iconSize,
          height: iconSize,
        })
      : icon;

  const iconEl =
    showIcon && resolvedIcon ? (
      <View style={{ opacity: iconOpacity }}>{resolvedIcon}</View>
    ) : null;
  const textEl = (
    <Text style={[variantTextStyle, textStyle, priceTypefaceLock]}>
      {displayAmount}
    </Text>
  );

  return (
    <View
      style={[
        styles.row,
        { flexDirection: rowDirection, gap: gap ?? rowGap },
        containerStyle,
      ]}
    >
      {swapOrder ? (
        <>
          {textEl}
          {iconEl}
        </>
      ) : (
        <>
          {iconEl}
          {textEl}
        </>
      )}
    </View>
  );
};

export default PriceWithIcon;

const useStyles = () => {
  const sizes = useSizes();
  const theme = useTheme();

  const rowGap = sizes.WIDTH * 0.008;
  const styles = useMemo(
    () =>
      StyleSheet.create({
        selectionCircle: {
          width: 20,
          height: 20,
          borderRadius: 10,
          borderWidth: 2,
          borderColor: theme.colors.SECONDARY_GRAY,
          backgroundColor: 'transparent',
          position: 'relative',
        },
        selectedCircle: {
          backgroundColor: theme.colors.PRIMARY,
          borderColor: theme.colors.PRIMARY,
        },
        row: {
          alignItems: 'center',
        },
        iconWrapper: {
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          alignItems: 'center',
          justifyContent: 'center',
        },
      }),
    [sizes],
  );

  return {
    styles,
    sizes,
    rowGap,
    theme,
  };
};
