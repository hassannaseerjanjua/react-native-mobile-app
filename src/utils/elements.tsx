import { Text as RNText, TextProps, I18nManager } from 'react-native';

export const Text = (props: TextProps) => {
  const isRTL = I18nManager.isRTL;

  return (
    <RNText
      {...props}
      allowFontScaling={false}
      style={[{ writingDirection: isRTL ? 'rtl' : 'ltr' }, props.style]}
    />
  );
};
