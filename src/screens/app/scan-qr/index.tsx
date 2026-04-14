import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  ScrollView,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import useStyles from './style';
import ParentView from '../../../components/app/ParentView';
import HomeHeader from '../../../components/global/HomeHeader';
import ShadowView from '../../../components/global/ShadowView';
import { SvgProfileCrossIcon } from '../../../assets/icons';
import { StackActions, useNavigation } from '@react-navigation/native';
import { formatGroupedInteger, scaleWithMax } from '../../../utils';
import { Text, Image } from '../../../utils/elements';
import { AppStackScreen } from '../../../types/navigation.types';
import QRCode from 'react-native-qrcode-svg';
import { useLocaleStore } from '../../../store/reducer/locale';

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
  const selectedItems = route?.params?.selectedItems;
  const giftLink = route?.params?.GiftLink ?? null;
  const { styles, theme } = useStyles();
  const navigation = useNavigation();
  const { getString } = useLocaleStore();
  const defaultImage = require('../../../assets/images/qr-product-dummy.png');
  const [qrCodeData, setQrCodeData] = useState<QrCodeData | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const hasMultipleItems = selectedItems && selectedItems.length > 1;
  const currentItem = hasMultipleItems
    ? selectedItems[currentIndex]
    : selectedItems?.[0] || {
        ItemImage: productImage,
        ItemName: productName,
        Quantity: quantity,
      };

  useEffect(() => {
    if (orderId && uniqueCode) {
      setQrCodeData({
        OrderId: orderId,
        UniqueCode: uniqueCode,
      });
    }
  }, [orderId, uniqueCode]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    // Account for screen padding - items fill available width
    const itemWidth = theme.sizes.WIDTH - theme.sizes.PADDING * 2;
    const gap = theme.sizes.PADDING * 0.8;
    const totalItemWidth = itemWidth + gap;
    const index = Math.round(scrollPosition / totalItemWidth);
    setCurrentIndex(
      Math.max(0, Math.min(index, (selectedItems?.length || 1) - 1)),
    );
  };

  return (
    <ParentView shadowPreset="towardsBottom">
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
        <Text
          style={[
            styles.TextLarge,
            {
              marginTop: theme.sizes.HEIGHT * 0.01,
            },
          ]}
        >
          {getString('QR_CLAIM_YOUR_GIFT')}
        </Text>
        <Text
          style={{
            ...styles.TextMedium,
            marginTop: theme.sizes.PADDING * 0.8,
          }}
        >
          {getString('QR_SCAN_IT_AT_STORE')}
        </Text>

        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            gap: theme.sizes.PADDING * 0.5,
            marginTop: theme.sizes.HEIGHT * 0.03,
            // marginBottom: theme.sizes.HEIGHT * 0.02,
          }}
        >
          <Text
            style={{
              ...theme.globalStyles.TEXT_STYLE_MEDIUM,
              fontSize: theme.sizes.FONTSIZE,
            }}
          >
            {getString('QR_CODE_NUMBER')}
          </Text>
          <Text style={styles.QrCodeNums}>
            {qrCodeData?.UniqueCode || '---'}
          </Text>
        </View>

        <ShadowView
          preset="qrContainer"
          containerStyle={{ marginVertical: theme.sizes.PADDING }}
        >
          <View style={styles.QrContainer}>
            {qrCodeData?.OrderId && qrCodeData?.UniqueCode ? (
              <QRCode
                value={`${qrCodeData.OrderId}:${qrCodeData.UniqueCode}`}
                size={scaleWithMax(270, 275)}
                color={theme.colors.PRIMARY}
                backgroundColor={theme.colors.WHITE}
                logo={undefined}
                quietZone={0}
                ecl="H"
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
                  {getString('QR_NO_CODE_AVAILABLE')}
                </Text>
              </View>
            )}
          </View>
        </ShadowView>

        {hasMultipleItems ? (
          <View>
            <ScrollView
              ref={scrollViewRef}
              horizontal
              pagingEnabled={false}
              showsHorizontalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              decelerationRate="fast"
              snapToInterval={
                theme.sizes.WIDTH -
                theme.sizes.PADDING * 2 +
                theme.sizes.PADDING * 0.8
              }
              snapToAlignment="start"
              contentContainerStyle={{
                paddingRight: theme.sizes.PADDING * 0.8,
              }}
            >
              {selectedItems.map((item, index) => (
                <ShadowView key={item.OrderItemId} preset="qrItemContainer">
                  <View
                    style={[
                      styles.ProductContainer,
                      {
                        width: theme.sizes.WIDTH - theme.sizes.PADDING * 2,
                        marginRight:
                          index < selectedItems.length - 1
                            ? theme.sizes.PADDING * 0.8
                            : 0,
                      },
                    ]}
                  >
                    <Image
                      style={styles.ProductImage}
                      source={item.ItemImage || defaultImage}
                    />
                    <View
                      style={{
                        flexDirection: 'column',
                        gap: theme.sizes.PADDING * 0.25,
                        maxWidth: '65%',
                      }}
                    >
                      <Text
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        style={{
                          ...theme.globalStyles.TEXT_STYLE_MEDIUM,
                          fontSize: theme.sizes.FONTSIZE_BUTTON,
                        }}
                      >
                        {item.ItemName || getString('QR_PRODUCT_NAME')}
                      </Text>
                      <Text
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        style={{
                          fontSize: theme.sizes.FONTSIZE_MEDIUM,
                          color: theme.colors.GRAY,
                        }}
                      >
                        {storeName || getString('QR_STORE_NAME')}
                      </Text>
                    </View>
                    {item.Quantity > 0 && (
                      <View style={styles.numCircle}>
                        <Text style={styles.numText}>
                          {formatGroupedInteger(item.Quantity)}
                        </Text>
                      </View>
                    )}
                  </View>
                </ShadowView>
              ))}
            </ScrollView>
            {selectedItems.length > 1 && (
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: theme.sizes.PADDING * 0.8,
                  gap: theme.sizes.WIDTH * 0.02,
                }}
              >
                {selectedItems.map((_, index) => (
                  <View
                    key={index}
                    style={{
                      width: scaleWithMax(8, 8),
                      height: scaleWithMax(8, 8),
                      borderRadius:
                        index === currentIndex ? scaleWithMax(4, 4) : 100,
                      backgroundColor:
                        index === currentIndex
                          ? theme.colors.PRIMARY
                          : '#E0E0E0',
                      opacity: index === currentIndex ? 1 : 0.5,
                    }}
                  />
                ))}
              </View>
            )}
          </View>
        ) : (
          <ShadowView preset="qrItemContainer">
            <View style={styles.ProductContainer}>
              <Image
                style={styles.ProductImage}
                source={currentItem.ItemImage || productImage || defaultImage}
              />
              <View
                style={{
                  flexDirection: 'column',
                  gap: theme.sizes.PADDING * 0.25,
                  maxWidth: '65%',
                }}
              >
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={{
                    ...theme.globalStyles.TEXT_STYLE_MEDIUM,
                    fontSize: theme.sizes.FONTSIZE_BUTTON,
                  }}
                >
                  {currentItem.ItemName ||
                    productName ||
                    getString('QR_PRODUCT_NAME')}
                </Text>
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={{
                    fontSize: theme.sizes.FONTSIZE_MEDIUM,
                    color: theme.colors.GRAY,
                  }}
                >
                  {storeName || getString('QR_STORE_NAME')}
                </Text>
              </View>
              {currentItem.Quantity > 0 && (
                <View style={styles.numCircle}>
                  <Text style={styles.numText}>
                    {formatGroupedInteger(currentItem.Quantity)}
                  </Text>
                </View>
              )}
            </View>
          </ShadowView>
        )}
      </View>
    </ParentView>
  );
};

export default ScanQr;
