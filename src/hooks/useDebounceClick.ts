import { useRef, useState } from 'react';

const useDebounceClick = (delay = 1000) => {
  const isDebouncing = useRef<any>({});
  const createDebouceClick = (key: string, callback: () => void) => {
    if (isDebouncing.current[key]) {
      console.log('Debouncing', key);
      return;
    }
    isDebouncing.current[key] = true;
    setTimeout(() => {
      isDebouncing.current[key] = false;
    }, delay);
    callback();
  };

  return { createDebouceClick };
};

export default useDebounceClick;
