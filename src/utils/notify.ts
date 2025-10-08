import { ToastAndroid } from 'react-native';

const notify = {
  error: (message: string) => {
    ToastAndroid.show(message, ToastAndroid.LONG);
  },
  success: (message: string) => {
    ToastAndroid.show(message, ToastAndroid.LONG);
  },
};

export default notify;
