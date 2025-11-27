import React, { useEffect, useState } from 'react';
import { View, Image } from 'react-native';
import useStyles from './style';
import ParentView from '../../../components/app/ParentView';
import HomeHeader from '../../../components/global/HomeHeader';
import { SvgProfileCrossIcon } from '../../../assets/icons';
import { StackActions, useNavigation } from '@react-navigation/native';
import { scaleWithMax } from '../../../utils';
import { Text } from '../../../utils/elements';
import { AppStackScreen } from '../../../types/navigation.types';
import api from '../../../utils/api';
import apiEndpoints from '../../../constants/api-endpoints';
import { QrCodeApiResponse, QrCodeData } from '../../../types';

const ScanQr: React.FC<AppStackScreen<'ScanQr'>> = ({ route }) => {
  const orderId = route?.params?.OrderId ?? null;
  const { styles, theme } = useStyles();
  const navigation = useNavigation();
  const dummyImage = require('../../../assets/images/qr-product-dummy.png');
  const [qrCodeData, setQrCodeData] = useState<QrCodeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getQrCode = async () => {
    if (!orderId) {
      setError('Order ID is required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await api.post<any>(
        apiEndpoints.GENERATE_QR_CODE(orderId),
        {
          orderId: orderId,
        },
      );

      console.log('QR Code API Response:', JSON.stringify(response, null, 2));

      if (response.success && response.data) {
        // The API response structure based on user's example:
        // response.data = { Data: QrCodeData, ResponseCode, Success, ResponseMessage }
        // So response.data.Data contains the QrCodeData
        const qrData = response.data?.Data;
        if (qrData && qrData.QrCodeBase64) {
          setQrCodeData(qrData);
        } else {
          setError('QR code data not found in response');
        }
      } else {
        setError(response.error || 'Failed to generate QR code');
      }
    } catch (err: any) {
      console.error('Error fetching QR code:', err);
      setError(err?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getQrCode();
  }, [orderId]);

  return (
    <ParentView>
      <HomeHeader
        showLogo={true}
        showBackButton={false}
        rightSideIcon={<SvgProfileCrossIcon />}
        rightSideTitle={true as any}
        onBackPress={() => navigation.dispatch(StackActions.popToTop())}
        rightSideTitlePress={() => navigation.dispatch(StackActions.popToTop())}
      />
      <View
        style={{
          paddingHorizontal: theme.sizes.PADDING,
          marginTop: theme.sizes.PADDING,
        }}
      >
        <Text style={styles.TextLarge}>Claim Your Gift</Text>
        <Text
          style={{
            ...styles.TextMedium,
            marginTop: theme.sizes.PADDING * 0.6,
          }}
        >
          Scan it at the store to claim
        </Text>

        <View style={styles.QrContainer}>
          {loading ? (
            <View
              style={{
                height: scaleWithMax(270, 275),
                width: scaleWithMax(270, 275),
                backgroundColor: '#f0f0f0',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text style={{ color: theme.colors.SECONDARY_TEXT }}>
                Loading...
              </Text>
            </View>
          ) : error ? (
            <View
              style={{
                height: scaleWithMax(270, 275),
                width: scaleWithMax(270, 275),
                backgroundColor: '#f0f0f0',
                justifyContent: 'center',
                alignItems: 'center',
                padding: theme.sizes.PADDING,
              }}
            >
              <Text
                style={{
                  color: '#ff0000',
                  textAlign: 'center',
                }}
              >
                {error}
              </Text>
            </View>
          ) : qrCodeData?.QrCodeBase64 ? (
            <Image
              source={{ uri: qrCodeData.QrCodeBase64 }}
              style={{
                height: scaleWithMax(270, 275),
                width: scaleWithMax(270, 275),
              }}
              resizeMode="contain"
              onError={e => {
                console.error('Image load error:', e.nativeEvent.error);
                console.error(
                  'QR Code Base64 (first 100 chars):',
                  qrCodeData.QrCodeBase64.substring(0, 100),
                );
                setError('Failed to load QR code image');
              }}
              onLoad={() => {
                console.log('QR code image loaded successfully');
                console.log(
                  'QR Code Base64 length:',
                  qrCodeData.QrCodeBase64.length,
                );
              }}
            />
          ) : (
            <View
              style={{
                height: scaleWithMax(270, 275),
                width: scaleWithMax(270, 275),
                backgroundColor: '#f0f0f0',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text style={{ color: theme.colors.SECONDARY_TEXT }}>
                No QR code available
              </Text>
            </View>
          )}
        </View>
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            gap: theme.sizes.PADDING * 0.5,
          }}
        >
          <Text
            style={{
              ...theme.globalStyles.TEXT_STYLE_MEDIUM,
              fontSize: theme.sizes.FONTSIZE,
            }}
          >
            QR Code #
          </Text>
          <Text style={styles.QrCodeNums}>
            {qrCodeData?.UniqueCode || '---'}
          </Text>
        </View>
        <View style={styles.ProductContainer}>
          <Image style={styles.ProductImage} source={dummyImage} />

          <View
            style={{ flexDirection: 'column', gap: theme.sizes.PADDING * 0.2 }}
          >
            <Text
              style={{
                ...theme.globalStyles.TEXT_STYLE_MEDIUM,
                fontSize: theme.sizes.FONTSIZE_BUTTON,
              }}
            >
              Gucci Guilty
            </Text>
            <Text
              style={{
                fontSize: theme.sizes.FONTSIZE_MEDIUM,
                color: '#808080',
              }}
            >
              Perfume House
            </Text>
          </View>
          <View style={styles.numCircle}>
            <Text style={styles.numText}>1</Text>
          </View>
        </View>
      </View>
    </ParentView>
  );
};

export default ScanQr;
