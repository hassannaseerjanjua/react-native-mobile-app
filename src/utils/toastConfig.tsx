import React from 'react';
import { BaseToast, ErrorToast, ToastConfig } from 'react-native-toast-message';

const ERROR_COLOR = '#E53935';
/** Trailing edge (borderRight); same in LTR/RTL after inverting former LTR-only swap. */
const RTLcolor = '#FFFFFF';
/** Leading edge (borderLeft); error accent. */
const LTRcolor = ERROR_COLOR;
const leftStripe = {
  borderRightColor: RTLcolor,
  borderLeftWidth: 5,
  borderLeftColor: LTRcolor,
  borderRightWidth: 5,
};

export const toastConfig: ToastConfig = {
  success: props => <BaseToast {...props} />,
  error: props => (
    <ErrorToast
      {...props}
      style={leftStripe}
      text1Style={{ textAlign: 'left' }}
    />
  ),
};
