import React from 'react';
import { I18nManager } from 'react-native';
import { BaseToast, ErrorToast, ToastConfig } from 'react-native-toast-message';

const ERROR_COLOR = '#E53935';
const RTLcolor = I18nManager.isRTL ? ERROR_COLOR : '#FFFFFF';
const LTRcolor = I18nManager.isRTL ? '#FFFFFF' : ERROR_COLOR;
const leftStripe = {
  borderRightColor: RTLcolor,
  borderLeftWidth: 5,
  borderLeftColor: LTRcolor,
  borderRightWidth: 5,
};

export const toastConfig: ToastConfig = {
  success: props => <BaseToast {...props} />,
  error: props => <ErrorToast {...props} style={leftStripe} />,
};
