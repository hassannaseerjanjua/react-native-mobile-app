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
import { scaleWithMax } from '../../../utils';
import CheckBox from '../../../components/global/CheckBox';
import PriceWithIcon from '../../../components/global/Price';
import CustomButton from '../../../components/global/Custombutton';
import { useNavigation } from '@react-navigation/native';
import CustomFooter from '../../../components/global/CustomFooter';
import { Text } from '../../../utils/elements';
import { AppStackScreen } from '../../../types/navigation.types';

const CheckOut: React.FC<AppStackScreen<'CheckOut'>> = ({ route }) => {
  const { styles, theme } = useStyles();
  const navigation = useNavigation();
  const { product } = route.params;

  const [quantity, setQuantity] = useState(1);
  const [checkoutCompleted, setCheckoutCompleted] = useState(false);
  const [selectedCircle, setSelectedCircle] = useState(false);

  const handleQuantityChange = (type: 'increment' | 'decrement') => {
    if (type === 'increment') {
      setQuantity(prevQuantity => prevQuantity + 1);
    } else {
      if (quantity > 1) {
        setQuantity(prevQuantity => prevQuantity - 1);
      }
    }
  };

  // Default values if product is not provided
  const productImage = product?.image || require('../../../assets/images/dummy1.png');
  const productTitle = product?.title || 'Flower bouquet';
  const productSubtitle = product?.subtitle || 'Coffematics';
  // Product price is already the final price (discounted if applicable) from navigation
  const productPrice = product?.price || 200;
  const feelingFees = 15;
  const totalAmount = (productPrice * quantity) + feelingFees;

  const GiftSend = require('../../../assets/images/gift-send.png');
  return !checkoutCompleted ? (
    <ParentView>
      <HomeHeader title="Checkout" showBackButton={true} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.section}>
          <Text style={styles.heading}>Order Details</Text>
          <View style={styles.CartContainer}>
            <Image source={productImage} style={styles.CartProductImage} />
            <View style={{ flex: 1, gap: theme.sizes.HEIGHT * 0.02 }}>
              <View>
                <Text style={styles.cartTitle}>{productTitle}</Text>
                <Text style={styles.TextMedium}>{productSubtitle}</Text>
              </View>
              <View style={{ ...styles.row, justifyContent: 'space-between' }}>
                <PriceWithIcon
                  Price={productPrice}
                  style={{ fontSize: theme.sizes.FONTSIZE_LESS_HIGH }}
                />
                <View style={styles.quantityControls}>
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
          <Text style={styles.heading}>Send A Gift</Text>
          <View style={styles.GiftContainer}>
            <View
              style={{ ...styles.row, flex: 1, gap: theme.sizes.WIDTH * 0.025 }}
            >
              <Image source={productImage} style={styles.GiftContainerImage} />
              <View style={{ gap: theme.sizes.HEIGHT * 0.004 }}>
                <Text style={styles.TextMedium}>{productSubtitle}</Text>
              </View>
            </View>
            <View style={[styles.row, { gap: theme.sizes.WIDTH * 0.025 }]}>
              <GiftIcon />
              <ArrowDownIcon />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.heading}>Payment Management</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('AddCard' as never)}
            >
              <View style={styles.row}>
                <PlusIcon
                  height={scaleWithMax(15, 18)}
                  width={scaleWithMax(15, 18)}
                />
                <Text style={styles.addCardAction}>Add Card</Text>
              </View>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => setSelectedCircle(!selectedCircle)}>
            <View style={styles.GiftContainer}>
              <View
                style={{
                  ...styles.row,
                  flex: 1,
                  gap: theme.sizes.WIDTH * 0.03,
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
          <Text style={styles.heading}>Order Info</Text>
          <View style={styles.Prices}>
            <Text style={styles.TextMedium}>Total Amount</Text>
            <PriceWithIcon Price={productPrice * quantity} />
          </View>
          <View style={styles.Prices}>
            <Text style={styles.TextMedium}>Feeling Fees</Text>
            <PriceWithIcon Price={feelingFees} />
          </View>
          <Text style={styles.vatNote}>All prices are 15% VAT Inclusive</Text>
        </View>
      </ScrollView>
      <View style={styles.footerContainer}>
        <View style={{ position: 'relative' }}>
          <CustomButton
            title="Proceed to Checkout"
            onPress={() => setCheckoutCompleted(true)}
          />
          <View style={styles.footerPriceWrapper}>
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
      <Text style={styles.TextLarge}>Your Gift has been sent</Text>
      <CustomFooter>
        <View style={{ position: 'relative' }}>
          <CustomButton
            title="Home"
            onPress={() => navigation.navigate('BottomTabs' as never)}
          />
        </View>
      </CustomFooter>
    </View>
  );
};

export default CheckOut;
