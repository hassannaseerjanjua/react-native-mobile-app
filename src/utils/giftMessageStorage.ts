import AsyncStorage from '@react-native-async-storage/async-storage';

const GIFT_MESSAGE_STORAGE_KEY = 'gift_message_data';

export interface GiftMessageData {
  ImageFilterId: number | null;
  Message: string;
  VideoFile?: {
    uri: string;
    type: string;
    name: string;
  };
}

interface GiftMessageStorage {
  [orderId: number]: GiftMessageData;
}

/**
 * Save gift message data for a specific order
 */
export const saveGiftMessageData = async (
  orderId: number,
  data: GiftMessageData,
): Promise<void> => {
  try {
    const existingData = await AsyncStorage.getItem(GIFT_MESSAGE_STORAGE_KEY);
    const storage: GiftMessageStorage = existingData
      ? JSON.parse(existingData)
      : {};

    storage[orderId] = data;
    await AsyncStorage.setItem(
      GIFT_MESSAGE_STORAGE_KEY,
      JSON.stringify(storage),
    );
  } catch (error) {
    console.error('[GiftMessageStorage] Error saving data:', error);
  }
};

/**
 * Load gift message data for a specific order
 */
export const loadGiftMessageData = async (
  orderId: number,
): Promise<GiftMessageData | null> => {
  try {
    const existingData = await AsyncStorage.getItem(GIFT_MESSAGE_STORAGE_KEY);
    if (!existingData) return null;

    const storage: GiftMessageStorage = JSON.parse(existingData);
    return storage[orderId] || null;
  } catch (error) {
    console.error('[GiftMessageStorage] Error loading data:', error);
    return null;
  }
};

/**
 * Clear gift message data for a specific order
 */
export const clearGiftMessageData = async (orderId: number): Promise<void> => {
  try {
    const existingData = await AsyncStorage.getItem(GIFT_MESSAGE_STORAGE_KEY);
    if (!existingData) return;

    const storage: GiftMessageStorage = JSON.parse(existingData);
    delete storage[orderId];
    await AsyncStorage.setItem(
      GIFT_MESSAGE_STORAGE_KEY,
      JSON.stringify(storage),
    );
  } catch (error) {
    console.error('[GiftMessageStorage] Error clearing data:', error);
  }
};

/**
 * Clear all gift message data
 */
export const clearAllGiftMessageData = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(GIFT_MESSAGE_STORAGE_KEY);
  } catch (error) {
    console.error('[GiftMessageStorage] Error clearing all data:', error);
  }
};
