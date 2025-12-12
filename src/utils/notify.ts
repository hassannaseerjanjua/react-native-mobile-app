import Toast from 'react-native-toast-message';

const notify = {
  error: (message: string, position: 'top' | 'bottom' = 'bottom') => {
    Toast.show({
      type: 'error',
      text1: message,
      // text2: message,
      position,
    });
  },
  success: (message: string, position: 'top' | 'bottom' = 'bottom') => {
    Toast.show({
      type: 'success',
      text1: message,
      // text2: message,
      position,
    });
  },
};

export default notify;
