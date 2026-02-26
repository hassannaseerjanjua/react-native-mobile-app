import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import {
  PaymentRequest,
  PaymentMethodNameEnum,
  SupportedNetworkEnum,
  PaymentComplete,
} from '@rnw-community/react-native-payments';

const APPLE_PAY_MERCHANT_ID = 'merchant.com.giftee.app';

const createMethodData = (
  amount: number,
  currencyCode: string,
  label: string,
) => [
  {
    supportedMethods: PaymentMethodNameEnum.ApplePay as const,
    data: {
      merchantIdentifier: APPLE_PAY_MERCHANT_ID,
      supportedNetworks: [
        SupportedNetworkEnum.Visa,
        SupportedNetworkEnum.Mastercard,
        SupportedNetworkEnum.Amex,
        SupportedNetworkEnum.Mada,
      ],
      countryCode: 'SA',
      currencyCode,
      requestBillingAddress: false,
      requestPayerEmail: false,
      requestShipping: false,
    },
  },
];

const createPaymentDetails = (
  amount: number,
  currencyCode: string,
  label: string,
) => ({
  id: `order-${Date.now()}`,
  total: {
    label: label || 'Giftee Order',
    amount: {
      currency: currencyCode,
      value: amount.toFixed(2),
    },
  },
});

export function useApplePay() {
  const [isApplePayAvailable, setIsApplePayAvailable] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (Platform.OS !== 'ios') {
      setIsChecking(false);
      return;
    }

    const check = async () => {
      try {
        const methodData = createMethodData(0.01, 'SAR', 'Check');
        const paymentDetails = createPaymentDetails(0.01, 'SAR', 'Check');
        const request = new PaymentRequest(methodData, paymentDetails);
        const canPay = await request.canMakePayment();
        setIsApplePayAvailable(canPay);
      } catch {
        setIsApplePayAvailable(false);
      } finally {
        setIsChecking(false);
      }
    };

    check();
  }, []);

  const requestApplePayPayment = useCallback(
    async (
      amount: number,
      options?: { currencyCode?: string; label?: string },
    ): Promise<string | null> => {
      if (Platform.OS !== 'ios') return null;

      const currencyCode = options?.currencyCode ?? 'SAR';
      const label = options?.label ?? 'Giftee Order';

      try {
        const methodData = createMethodData(amount, currencyCode, label);
        const paymentDetails = createPaymentDetails(
          amount,
          currencyCode,
          label,
        );
        const request = new PaymentRequest(methodData, paymentDetails);

        const paymentResponse = await request.show();

        console.log(
          'paymentResponse',
          paymentResponse.details?.applePayToken?.paymentData,
        );

        const applePayToken = paymentResponse.details?.applePayToken ?? null;

        if (!applePayToken) {
          await paymentResponse.complete(PaymentComplete.FAIL);
          return null;
        }

        const tokenString = JSON.stringify(applePayToken.paymentData);
        await paymentResponse.complete(PaymentComplete.SUCCESS);
        return tokenString;
      } catch (error) {
        // NotAllowedError means user cancelled -- not an error
        if ((error as Error)?.name === 'NotAllowedError') {
          return null;
        }
        throw error;
      }
    },
    [],
  );

  return {
    isApplePayAvailable,
    isChecking,
    requestApplePayPayment,
  };
}
