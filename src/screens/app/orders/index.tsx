import React, { useState, useEffect } from 'react';
import {
  View,
  StatusBar,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import useStyles from './style';
import { Text } from '../../../utils/elements';
import HomeHeader from '../../../components/global/HomeHeader';
import ParentView from '../../../components/app/ParentView';
import SkeletonLoader from '../../../components/SkeletonLoader';
import { SvgRiyalIcon } from '../../../assets/icons';
import { scaleWithMax } from '../../../utils';
import { useLocaleStore } from '../../../store/reducer/locale';

const OrdersScreen: React.FC = () => {
  const { styles, theme } = useStyles();
  const navigation = useNavigation();
  const { getString } = useLocaleStore();
  const [isLoading, setIsLoading] = useState(true);

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ParentView style={styles.container}>
      <StatusBar
        backgroundColor={theme.colors.BACKGROUND}
        barStyle="dark-content"
      />

      <HomeHeader
        title={getString('O_ORDERS')}
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentContainer}>
          {isLoading ? (
            <SkeletonLoader screenType="orderListing" />
          ) : (
            <OrderCard />
          )}
        </View>
      </ScrollView>
    </ParentView>
  );
};

const OrderCard: React.FC = () => {
  const { styles, theme } = useStyles();
  const { getString } = useLocaleStore();

  const openWhatsApp = (phoneNumber: string) => {
    // Remove any non-numeric characters and add country code if needed
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    const whatsappNumber = cleanNumber.startsWith('92')
      ? cleanNumber
      : `92${cleanNumber}`;
    const whatsappUrl = `whatsapp://send?phone=${whatsappNumber}`;

    Linking.canOpenURL(whatsappUrl)
      .then(supported => {
        if (supported) {
          Linking.openURL(whatsappUrl);
        } else {
          Alert.alert(
            getString('O_WHATSAPP_NOT_INSTALLED'),
            getString('O_WHATSAPP_NOT_INSTALLED_MESSAGE'),
            [{ text: getString('O_OK') }],
          );
        }
      })
      .catch(err => {
        console.error('Error opening WhatsApp:', err);
        Alert.alert(
          getString('O_ERROR'),
          getString('O_UNABLE_TO_OPEN_WHATSAPP'),
        );
      });
  };

  return (
    <View style={styles.orderCard}>
      <View style={styles.rowContainer}>
        <View style={styles.leftSection}>
          <View style={styles.imageContainer}>
            <Image
              source={require('../../../assets/images/flowers.png')}
              style={styles.orderCardImage}
            />
          </View>
          <View style={styles.productInfo}>
            <Text style={styles.orderCardTitle}>
              {getString('O_FLOWER_BOUQUET')}
            </Text>
            <Text style={styles.orderCardSubtitle}>
              {getString('O_COFFEEMATICS')}
            </Text>
          </View>
        </View>

        <View style={styles.rightSection}>
          <View style={styles.statusBadge}>
            <Text style={styles.orderCardStatus}>{getString('O_PENDING')}</Text>
          </View>
          <View style={styles.orderNumberBadge}>
            <Text style={styles.orderCardNumber}>
              {getString('O_ORDER_NUMBER')} 4
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.orderDetailsContainer}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>{getString('O_PHONE_NUMBER')}</Text>
          <TouchableOpacity onPress={() => openWhatsApp('0300-16413168')}>
            <Text style={[styles.detailValue]}>0300-16413168</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>{getString('O_ORDER_TIME')}:</Text>
          <Text style={styles.detailValue}>26-March at 08:10PM</Text>
        </View>

        <View style={styles.itemRow}>
          <Text style={styles.detailLabel}>{getString('O_1X_ICED_LATTE')}</Text>
          <View style={styles.itemDetails}>
            <Text style={styles.itemSize}>{getString('O_REGULAR')}</Text>
            <View style={styles.priceContainer}>
              <SvgRiyalIcon
                width={scaleWithMax(12, 14)}
                height={scaleWithMax(12, 14)}
              />
              <Text style={styles.itemPrice}>8.0</Text>
            </View>
          </View>
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>{getString('O_TOTAL_AMOUNT')}</Text>
          <View style={styles.priceContainer}>
            <SvgRiyalIcon
              width={scaleWithMax(12, 14)}
              height={scaleWithMax(12, 14)}
            />
            <Text style={styles.totalValue}>8.0</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default OrdersScreen;
