import Toast from 'react-native-toast-message';

const notify = {
  error: (message: string) => {
    Toast.show({
      type: 'error',
      text1: message,
      // text2: message,
      position: 'bottom',
    });
  },
  success: (message: string) => {
    Toast.show({
      type: 'success',
      text1: message,
      // text2: message,
      position: 'bottom',
    });
  },
};

export default notify;
