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
import QRCode from 'react-native-qrcode-svg';

interface QrCodeData {
  OrderId: number;
  UniqueCode: string;
}

const ScanQr: React.FC<AppStackScreen<'ScanQr'>> = ({ route }) => {
  const orderId = route?.params?.OrderId ?? null;
  const uniqueCode = route?.params?.UniqueCode ?? null;
  const productImage = route?.params?.productImage;
  const storeName = route?.params?.storeName;
  const quantity = route?.params?.quantity ?? 1;
  const productName = route?.params?.productName;
  const { styles, theme } = useStyles();
  const navigation = useNavigation();
  const defaultImage = require('../../../assets/images/qr-product-dummy.png');
  const [qrCodeData, setQrCodeData] = useState<QrCodeData | null>(null);

  useEffect(() => {
    if (orderId && uniqueCode) {
      setQrCodeData({
        OrderId: orderId,
        UniqueCode: uniqueCode,
      });
    }
  }, [orderId, uniqueCode]);

  return (
    <ParentView>
      <HomeHeader
        showLogo={true}
        showBackButton={false}
        rightSideIcon={<SvgProfileCrossIcon />}
        rightSideTitle={true as any}
        onBackPress={() => navigation.goBack()}
        rightSideTitlePress={() => navigation.goBack()}
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
          {qrCodeData?.OrderId && qrCodeData?.UniqueCode ? (
            <QRCode
              value={`${qrCodeData.OrderId}:${qrCodeData.UniqueCode}`}
              size={scaleWithMax(270, 275)}
              color={theme.colors.PRIMARY}
              backgroundColor={theme.colors.WHITE}
              logo={undefined}
              quietZone={0}
              ecl="Q"
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
          <Image
            style={styles.ProductImage}
            source={productImage || defaultImage}
          />

          <View
            style={{ flexDirection: 'column', gap: theme.sizes.PADDING * 0.25 }}
          >
            <Text
              style={{
                ...theme.globalStyles.TEXT_STYLE_MEDIUM,
                fontSize: theme.sizes.FONTSIZE_BUTTON,
              }}
            >
              {productName || 'Product Name'}
            </Text>
            <Text
              style={{
                fontSize: theme.sizes.FONTSIZE_MEDIUM,
                color: '#808080',
              }}
            >
              {storeName || 'Store Name'}
            </Text>
          </View>
          {quantity > 0 && (
            <View style={styles.numCircle}>
              <Text style={styles.numText}>{quantity}</Text>
            </View>
          )}
        </View>
      </View>
    </ParentView>
  );
};

export default ScanQr;
