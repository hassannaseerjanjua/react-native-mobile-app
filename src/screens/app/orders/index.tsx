import React from 'react';
import { View, StatusBar, ScrollView, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import useStyles from './style';
import { Text } from '../../../utils/elements';
import HomeHeader from '../../../components/global/HomeHeader';
import ParentView from '../../../components/app/ParentView';
import { SvgRiyalIcon } from '../../../assets/icons';
import { scaleWithMax } from '../../../utils';

const OrdersScreen: React.FC = () => {
  const { styles, theme } = useStyles();
  const navigation = useNavigation();

  return (
    <ParentView style={styles.container}>
      <StatusBar
        backgroundColor={theme.colors.BACKGROUND}
        barStyle="dark-content"
      />

      <HomeHeader
        title="Orders"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentContainer}>
          <OrderCard />
        </View>
      </ScrollView>
    </ParentView>
  );
};

const OrderCard: React.FC = () => {
  const { styles, theme } = useStyles();

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
            <Text style={styles.orderCardTitle}>Flower bouquet</Text>
            <Text style={styles.orderCardSubtitle}>Coffematics</Text>
          </View>
        </View>

        <View style={styles.rightSection}>
          <View style={styles.statusBadge}>
            <Text style={styles.orderCardStatus}>Pending</Text>
          </View>
          <View style={styles.orderNumberBadge}>
            <Text style={styles.orderCardNumber}>Order # 4</Text>
          </View>
        </View>
      </View>

      <View style={styles.orderDetailsContainer}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Phone Number:</Text>
          <Text style={styles.detailValue}>0300-16413168</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Order Time:</Text>
          <Text style={styles.detailValue}>26-March at 08:10PM</Text>
        </View>

        <View style={styles.itemRow}>
          <Text style={styles.detailLabel}>1 x Iced Latte</Text>
          <View style={styles.itemDetails}>
            <Text style={styles.itemSize}>Regular</Text>
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
          <Text style={styles.totalLabel}>Total Amount</Text>
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
