import { useEffect, useRef } from 'react';
import { Linking } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import api from '../utils/api';
import apiEndpoints from '../constants/api-endpoints';
import { navigationRef } from '../../App';
import { AppStackParamList } from '../types/navigation.types';

/**
 * Hook to handle redeem-gift deep links
 * Extracts gifttoken from URL and calls GET_GIFT_DETAILS API
 */
const useDeepLinkHandler = () => {
  const initialUrlProcessedRef = useRef(false);

  useEffect(() => {
    const handleRedeemGiftUrl = async (url: string) => {
      try {
        console.log('='.repeat(60));
        console.log('REDEEM GIFT DEEP LINK DETECTED');
        console.log('='.repeat(60));
        console.log('URL:', url);

        // Parse URL to extract query parameters
        // Extract everything after gifttoken= directly (including URL-encoded characters)
        let giftToken: string | null = null;
        const gifttokenIndex = url.indexOf('gifttoken=');

        if (gifttokenIndex !== -1) {
          // Get everything after 'gifttoken='
          const tokenStart = gifttokenIndex + 'gifttoken='.length;
          const remainingUrl = url.substring(tokenStart);
          // Remove any additional query parameters (everything after &)
          const tokenEnd = remainingUrl.indexOf('&');
          giftToken =
            tokenEnd !== -1
              ? remainingUrl.substring(0, tokenEnd)
              : remainingUrl;
        }

        if (!giftToken) {
          console.log('❌ No gifttoken parameter found in URL');
          console.log('='.repeat(60));
          return;
        }

        console.log('Extracted gifttoken:', giftToken);
        console.log('Calling GET_GIFT_DETAILS API...');

        // Call the API with the gift token
        const response = await api.get(
          apiEndpoints.GET_GIFT_DETAILS(giftToken),
        );

        console.log('='.repeat(60));
        console.log('GET_GIFT_DETAILS API RESPONSE:');
        console.log('='.repeat(60));
        console.log('Success:', response.success);
        console.log('Failed:', response.failed);
        if (response.data) {
          console.log('Response Data:', JSON.stringify(response.data, null, 2));
        }
        if (response.error) {
          console.log('Error:', response.error);
        }
        console.log('='.repeat(60));

        // Navigate to ScanQr screen if API call was successful
        if (response.success && response.data) {
          const responseData = response.data as any;
          const giftData = responseData?.Data?.data;

          if (!giftData) {
            console.log('No gift data found in response');
            return;
          }

          // Map API response to ScanQr screen params
          const defaultItemImage = require('../assets/images/img-placeholder.png');
          const selectedItems =
            giftData.Items?.map((item: any) => ({
              OrderItemId: item.OrderItemId,
              ItemName: item.ItemName,
              ItemImage: item.ItemImage
                ? { uri: item.ItemImage }
                : defaultItemImage,
              Quantity: item.Quantity,
            })) || [];

          // Navigate to ScanQr screen
          if (navigationRef.current) {
            navigationRef.current.dispatch(
              CommonActions.navigate('ScanQr', {
                OrderId: giftData.OrderId,
                UniqueCode: giftData.QRUniqueCode,
                storeName: giftData.StoreName,
                selectedItems: selectedItems,
                // For single item fallback
                productImage: selectedItems[0]?.ItemImage,
                productName: selectedItems[0]?.ItemName,
                quantity: selectedItems[0]?.Quantity || 1,
              } as AppStackParamList['ScanQr']),
            );
          }
        }
      } catch (error) {
        console.error('Error handling redeem-gift deep link:', error);
      }
    };

    // Handle initial URL when app opens from closed state
    if (!initialUrlProcessedRef.current) {
      initialUrlProcessedRef.current = true;
      Linking.getInitialURL().then(url => {
        if (url && url.includes('/giftee/redeem-gift')) {
          handleRedeemGiftUrl(url);
        }
      });
    }

    // Handle URL events (foreground + background to foreground)
    const subscription = Linking.addEventListener('url', ({ url }) => {
      if (url && url.includes('/giftee/redeem-gift')) {
        handleRedeemGiftUrl(url);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);
};

export default useDeepLinkHandler;
