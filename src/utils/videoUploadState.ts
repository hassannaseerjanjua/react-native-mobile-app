// Shared state for tracking video upload between gift-message and checkout screens
let videoUploadPromise: Promise<any> | null = null;

export const setVideoUploadPromise = (promise: Promise<any> | null) => {
  videoUploadPromise = promise;
};

export const getVideoUploadPromise = (): Promise<any> | null => {
  return videoUploadPromise;
};

export const clearVideoUploadPromise = () => {
  videoUploadPromise = null;
};
