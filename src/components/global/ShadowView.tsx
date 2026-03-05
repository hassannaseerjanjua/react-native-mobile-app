import React from 'react';
import { Shadow } from 'react-native-shadow-2';
import {
  SHADOW_PRESETS,
  type ShadowPresetName,
} from '../../styles/global-styles';

interface ShadowViewProps {
  preset?: ShadowPresetName;
  children: React.ReactNode;
  style?: any;
  containerStyle?: any;
  stretch?: boolean;
  disabled?: boolean;
}

/**
 * Wraps children with rn-shadow-2 Shadow using a preset.
 * Replaces the old style-based shadow approach.
 */
const ShadowView: React.FC<ShadowViewProps> = ({
  preset = 'default',
  children,
  style,
  containerStyle,
  stretch = true,
  disabled = false,
}) => {
  const presetProps = SHADOW_PRESETS[preset];
  return (
    <Shadow
      {...presetProps}
      style={style}
      containerStyle={containerStyle}
      stretch={stretch}
      disabled={disabled}
    >
      {children}
    </Shadow>
  );
};

export default ShadowView;
