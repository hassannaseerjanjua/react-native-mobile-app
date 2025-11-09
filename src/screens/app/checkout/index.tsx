import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
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

const CheckOut: React.FC = () => {
  const { styles, theme } = useStyles();
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
  const navigation = useNavigation();
  const Product = require('../../../assets/images/dummy1.png');
  const GiftSend = require('../../../assets/images/gift-send.png');
  return !checkoutCompleted ? (
    <ParentView>
      <HomeHeader title="Checkout" showBackButton={true} />
      <View style={{ paddingHorizontal: theme.sizes.PADDING }}>
        <View style={{ paddingVertical: theme.sizes.PADDING * 0.2 }}>
          <Text style={styles.heading}>Order Details</Text>
          <View style={styles.CartContainer}>
            <Image source={Product} style={styles.CartProductImage} />
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  ...theme.globalStyles.TEXT_STYLE_SEMIBOLD,
                  fontSize: theme.sizes.FONTSIZE_BUTTON,
                }}
              >
                Flower bouquet
              </Text>
              <Text style={styles.TextMedium}>Coffematics</Text>

              <View
                style={{
                  ...styles.row,
                  flex: 1,
                  alignItems: 'flex-end',
                  justifyContent: 'space-between',
                }}
              >
                <View style={styles.row}>
                  <PriceWithIcon Price={200} />
                </View>
                <View
                  style={{
                    ...styles.row,

                    gap: theme.sizes.WIDTH * 0.02,
                  }}
                >
                  <DecrementIcon
                    onPress={() => handleQuantityChange('decrement')}
                  />
                  <Text
                    style={{
                      ...theme.globalStyles.TEXT_STYLE_BOLD,
                      fontSize: theme.sizes.FONTSIZE_BUTTON,
                    }}
                  >
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
        <Text style={styles.heading}>Send A Gift</Text>
        <View style={styles.GiftContainer}>
          <View style={{ ...styles.row, gap: theme.sizes.WIDTH * 0.03 }}>
            <Image source={Product} style={styles.GiftContainerImage} />
            <View style={styles.row}>
              <Text style={styles.TextSmall}>My Employee</Text>
              <Text style={styles.TextMedium}>3x</Text>
            </View>
          </View>
          <View style={{ ...styles.row, gap: theme.sizes.WIDTH * 0.03 }}>
            <GiftIcon />
            <ArrowDownIcon />
          </View>
        </View>
        <View style={{ ...styles.row, justifyContent: 'space-between' }}>
          <Text style={styles.heading}>Payment Management</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('AddCard' as never)}
          >
            <View style={styles.row}>
              <PlusIcon
                height={scaleWithMax(15, 18)}
                width={scaleWithMax(15, 18)}
              />
              <Text
                style={{ ...styles.TextSmall, color: theme.colors.PRIMARY }}
              >
                Add Card
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => setSelectedCircle(!selectedCircle)}>
          <View style={styles.GiftContainer}>
            <View style={{ ...styles.row, gap: theme.sizes.WIDTH * 0.04 }}>
              <CheckBox Selected={selectedCircle} />
              <VisaIcon
                height={scaleWithMax(35, 38)}
                width={scaleWithMax(35, 38)}
              />
              <View>
                <Text>424242XXXXXX4242</Text>
                <Text>Visa</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
        <Text
          style={{
            ...styles.heading,
            paddingBottom: theme.sizes.PADDING * 0.3,
          }}
        >
          Info order
        </Text>
        <View style={styles.Prices}>
          <Text style={styles.TextSmall}>Total Amount</Text>
          <PriceWithIcon Price={200} />
        </View>
        <View style={styles.Prices}>
          <Text style={styles.TextSmall}>Feeling Fees</Text>
          <PriceWithIcon Price={15} />
        </View>
        <Text
          style={{
            textAlign: 'center',
            paddingVertical: theme.sizes.PADDING,
            fontSize: theme.sizes.FONTSIZE_MEDIUM,
          }}
        >
          All prices are 15% VAT Inclusive
        </Text>
      </View>
      <View
        style={{
          position: 'absolute',
          bottom: 25,
          left: 0,
          right: 0,
          paddingHorizontal: theme.sizes.PADDING,
        }}
      >
        <View style={{ position: 'relative' }}>
          <CustomButton
            title="Proceed to Checkout"
            onPress={() => setCheckoutCompleted(true)}
          />
          <View
            style={{
              position: 'absolute',
              top: theme.sizes.HEIGHT * 0.016,
              right: theme.sizes.WIDTH * 0.03,
            }}
          >
            <PriceWithIcon
              Price={215}
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

const styles = StyleSheet.create({});
