import { Image, ScrollView, TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';
import ParentView from '../../../components/app/ParentView';
import HomeHeader from '../../../components/global/HomeHeader';
import useStyles from './style';
import {
  ArrowDownIcon,
  DecrementIcon,
  GiftIcon,
  IncrementIcon,
  PlusIcon,
  SvgRiyalIcon,
  SvgRiyalIconWhite,
  SvgSelectedCheck,
  VisaIcon,
} from '../../../assets/icons';
import {
  scaleWithMax,
  rtlTransform,
  rtlFlexDirection,
  rtlPosition,
} from '../../../utils';
import CheckBox from '../../../components/global/CheckBox';
import PriceWithIcon from '../../../components/global/Price';
import CustomButton from '../../../components/global/Custombutton';
import { useNavigation } from '@react-navigation/native';
import CustomFooter from '../../../components/global/CustomFooter';
import { Text } from '../../../utils/elements';
import { AppStackScreen } from '../../../types/navigation.types';
import api from '../../../utils/api';
import apiEndpoints from '../../../constants/api-endpoints';
import { useLocaleStore } from '../../../store/reducer/locale';

const CheckOut: React.FC<AppStackScreen<'CheckOut'>> = ({ route }) => {
  const { styles, theme } = useStyles();
  const { getString, isRtl } = useLocaleStore();
  const navigation = useNavigation();
  const { product, addToCartPayload } = route.params as any;

  const [quantity, setQuantity] = useState(addToCartPayload?.Quantity ?? 1);
  const [checkoutCompleted, setCheckoutCompleted] = useState(false);
  const [selectedCircle, setSelectedCircle] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleQuantityChange = (type: 'increment' | 'decrement') => {
    if (type === 'increment') {
      setQuantity((prevQuantity: number) => prevQuantity + 1);
    } else {
      if (quantity > 1) {
        setQuantity((prevQuantity: number) => prevQuantity - 1);
      }
    }
  };

  const productImage =
    product?.image || require('../../../assets/images/img-placeholder.png');
  const productTitle = product?.title;
  const productSubtitle = product?.subtitle;
  const productPrice = product?.price;
  const totalAmount = productPrice * quantity;

  const submitAddToCart = async () => {
    try {
      setSubmitting(true);
      const payload = {
        FriendId: addToCartPayload?.FriendId ?? null,
        ItemId: addToCartPayload.ItemId,
        ItemVariantId: addToCartPayload.ItemVariantId,
        Quantity: quantity ?? addToCartPayload.Quantity ?? 1,
      };
      await api.post(apiEndpoints.ADD_TO_CART, payload);
      setCheckoutCompleted(true);
    } catch (e) {
      setCheckoutCompleted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const GiftSend = require('../../../assets/images/gift-send.png');
  return !checkoutCompleted ? (
    <ParentView>
      <HomeHeader title={getString('CHECKOUT_TITLE')} showBackButton={true} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.section}>
          <Text style={styles.heading}>
            {getString('CHECKOUT_ORDER_DETAILS')}
          </Text>
          <View
            style={[
              styles.CartContainer,
              { flexDirection: rtlFlexDirection(isRtl) },
            ]}
          >
            <Image source={productImage} style={styles.CartProductImage} />
            <View style={{ flex: 1, gap: theme.sizes.HEIGHT * 0.02 }}>
              <View>
                <Text style={styles.cartTitle}>{productTitle}</Text>
                <Text style={styles.TextMedium}>{productSubtitle}</Text>
              </View>
              <View
                style={{
                  ...styles.row,
                  flexDirection: rtlFlexDirection(isRtl),
                  justifyContent: 'space-between',
                }}
              >
                <PriceWithIcon
                  Price={productPrice}
                  style={{ fontSize: theme.sizes.FONTSIZE_LESS_HIGH }}
                />
                <View
                  style={[
                    styles.quantityControls,
                    { flexDirection: rtlFlexDirection(isRtl) },
                  ]}
                >
                  <DecrementIcon
                    onPress={() => handleQuantityChange('decrement')}
                  />
                  <Text style={styles.quantityValue}>
                    {`${quantity < 10 ? '0' : ''}${quantity}`}
                  </Text>
                  <IncrementIcon
                    onPress={() => handleQuantityChange('increment')}
                  />
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>
            {getString('CHECKOUT_SEND_A_GIFT')}
          </Text>
          <View style={styles.GiftContainer}>
            <View
              style={{
                ...styles.row,
                flex: 1,
                gap: theme.sizes.WIDTH * 0.025,
                flexDirection: rtlFlexDirection(isRtl),
              }}
            >
              <Image source={productImage} style={styles.GiftContainerImage} />
              <View style={{ gap: theme.sizes.HEIGHT * 0.004 }}>
                <Text style={styles.TextMedium}>{productSubtitle}</Text>
              </View>
            </View>
            <View
              style={[
                styles.row,
                {
                  gap: theme.sizes.WIDTH * 0.025,
                  flexDirection: rtlFlexDirection(isRtl),
                },
              ]}
            >
              <GiftIcon />
              <ArrowDownIcon style={{ transform: rtlTransform(isRtl) }} />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View
            style={[
              styles.sectionHeaderRow,
              { flexDirection: rtlFlexDirection(isRtl) },
            ]}
          >
            <Text style={styles.heading}>
              {getString('CHECKOUT_PAYMENT_MANAGEMENT')}
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('AddCard' as never)}
            >
              <View
                style={[styles.row, { flexDirection: rtlFlexDirection(isRtl) }]}
              >
                <PlusIcon
                  height={scaleWithMax(15, 18)}
                  width={scaleWithMax(15, 18)}
                />
                <Text style={styles.addCardAction}>
                  {getString('CHECKOUT_ADD_CARD')}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => setSelectedCircle(!selectedCircle)}>
            <View
              style={[
                styles.GiftContainer,
                { flexDirection: rtlFlexDirection(isRtl) },
              ]}
            >
              <View
                style={{
                  ...styles.row,
                  flex: 1,
                  gap: theme.sizes.WIDTH * 0.03,
                  flexDirection: rtlFlexDirection(isRtl),
                }}
              >
                <CheckBox Selected={selectedCircle} />
                <VisaIcon
                  height={scaleWithMax(32, 35)}
                  width={scaleWithMax(32, 35)}
                />
                <View>
                  <Text style={styles.TextMedium}>424242XXXXXX4242</Text>
                  <Text style={styles.TextMedium}>Visa</Text>
                </View>
              </View>
              <SvgSelectedCheck
                width={scaleWithMax(16, 18)}
                height={scaleWithMax(16, 18)}
                style={{ opacity: selectedCircle ? 1 : 0 }}
              />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>
            {getString('CHECKOUT_ORDER_DETAILS')}
          </Text>
          <View
            style={[styles.Prices, { flexDirection: rtlFlexDirection(isRtl) }]}
          >
            <Text style={styles.TextMedium}>
              {getString('CHECKOUT_TOTAL_AMOUNT')}
            </Text>
            <PriceWithIcon Price={productPrice * quantity} />
          </View>
          {/* <View style={styles.Prices}>
            <Text style={styles.TextMedium}>Feeling Fees</Text>
            <PriceWithIcon Price={feelingFees} />
          </View> */}
          <Text style={styles.vatNote}>{getString('CHECKOUT_VAT_NOTE')}</Text>
        </View>
      </ScrollView>
      <View style={styles.footerContainer}>
        <View style={{ position: 'relative' }}>
          <CustomButton
            title={getString('CHECKOUT_PROCEED_TO_CHECKOUT')}
            onPress={submitAddToCart}
          />
          <View
            style={[
              styles.footerPriceWrapper,
              rtlPosition(isRtl, undefined, theme.sizes.WIDTH * 0.03),
            ]}
          >
            <PriceWithIcon
              Price={totalAmount}
              style={{ color: theme.colors.WHITE }}
              Icon={
                <SvgRiyalIconWhite
                  width={scaleWithMax(12, 14)}
                  height={scaleWithMax(12, 14)}
                />
              }
            />
          </View>
        </View>
      </View>
    </ParentView>
  ) : (
    <View style={styles.checkoutCompletedContainer}>
      <Image source={GiftSend} />
      <Text style={styles.TextLarge}>{getString('CHECKOUT_GIFT_SENT')}</Text>
      <CustomFooter>
        <View style={{ position: 'relative' }}>
          <CustomButton
            title={getString('CHECKOUT_HOME')}
            onPress={() => navigation.navigate('BottomTabs' as never)}
          />
        </View>
      </CustomFooter>
    </View>
  );
};

export default CheckOut;
