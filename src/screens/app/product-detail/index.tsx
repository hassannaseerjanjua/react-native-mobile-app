import {
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useState } from 'react';
import useStyles from './style';
import HomeHeader from '../../../components/global/HomeHeader';
import { useLocaleStore } from '../../../store/reducer/locale';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  MinusIcon,
  PlusIcon,
  SvgBackIcon,
  SvgItemFavouriteIcon,
  SvgItemFavouriteIconInActive,
  SvgRiyalIcon,
} from '../../../assets/icons';
import { scaleWithMax } from '../../../utils';
import useTheme from '../../../styles/theme';
import ProductImageSlider from '../../../components/global/ProductImageSlider';
import { GroupTabs } from '../../../components/send-a-gift';
import CustomButton from '../../../components/global/Custombutton';
import SkeletonLoader from '../../../components/SkeletonLoader';

const ProductDetails: React.FC = () => {
  const { styles, theme } = useStyles();
  const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

  const { getString } = useLocaleStore();
  const { sizes } = useTheme();
  const [selectedFilter, setSelectedFilter] = useState<string>('large');
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const dummyImage = require('../../../assets/images/bouquet.png');
  const navigation = useNavigation();
  const filterOptions = [
    { id: 'large', title: 'Large' },
    { id: 'medium', title: 'Medium' },
    { id: 'small', title: 'Small' },
  ];
  const handleQuantityChange = (type: 'increment' | 'decrement') => {
    if (type === 'increment') {
      setQuantity(prevQuantity => prevQuantity + 1);
    } else {
      if (quantity > 1) {
        setQuantity(prevQuantity => prevQuantity - 1);
      }
    }
  };
  return (
    <View style={{ flex: 1 }}>
      <StatusBar
        backgroundColor={theme.colors.BACKGROUND}
        barStyle="light-content"
      />
      <ProductImageSlider
        loading={loading}
        sliders={[dummyImage, dummyImage, dummyImage]}
      />
      <View
        style={{
          ...styles.spaceBetween,
          position: 'absolute',
          paddingHorizontal: sizes.PADDING,
          top: 40,
          zIndex: 10,
          width: '100%',
        }}
      >
        <TouchableOpacity
          onPress={navigation.goBack}
          style={styles.rounded_white_background}
        >
          <SvgBackIcon
            style={{
              width: scaleWithMax(20, 25),
              height: scaleWithMax(20, 25),
            }}
          />
        </TouchableOpacity>
        <View style={styles.rounded_white_background}>
          <SvgItemFavouriteIconInActive
            width={scaleWithMax(14, 16)}
            height={scaleWithMax(14, 16)}
          />
        </View>
      </View>
      {loading ? (
        <View style={{}}>
          <ScrollView
            contentContainerStyle={{
              paddingHorizontal: sizes.PADDING,
              // paddingTop: sizes.HEIGHT * 0.02,
              paddingBottom: sizes.HEIGHT * 0.15,
            }}
          >
            <View>
              <SkeletonLoader screenType="productDetails" />
            </View>
          </ScrollView>
        </View>
      ) : (
        <ScrollView
          style={{ ...styles.container, marginBottom: sizes.HEIGHT * 0.025 }}
        >
          <View style={styles.LowerContainer}>
            <View style={styles.ProductTitleContainer}>
              <View style={styles.spaceBetween}>
                <View>
                  <Text style={styles.ProductTitle}>Flower Bouquet</Text>
                </View>
                <View style={styles.priceContainer}>
                  <SvgRiyalIcon
                    width={scaleWithMax(15, 18)}
                    height={scaleWithMax(15, 18)}
                    style={{
                      marginTop: 3.5,
                    }}
                  />
                  <Text style={styles.price}>499</Text>
                </View>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.TaxIncludeText}>All Price Include tax</Text>
              </View>
            </View>

            <View style={styles.ProductDescriptionContainer}>
              <Text style={styles.Heading}>Description</Text>
              <Text style={styles.Description}>
                is simply dummy text of the printing and typesetting industry.
                Lorem Ipsum has been the industry's standard dummy text ever
                since the 1500s, when an unknown printer took a galley of type
                and scrambled it to make a type specimen book.
              </Text>
            </View>
            <Text style={styles.Heading}>Varients</Text>
          </View>
          <View style={styles.tabsContainer}>
            <GroupTabs
              tabs={filterOptions}
              activeTab={selectedFilter}
              onTabPress={setSelectedFilter}
            />
          </View>
        </ScrollView>
      )}
      <View
        style={{
          // ...theme.globalStyles.SHADOW_STYLE,
          borderTopLeftRadius: 15,
          borderTopRightRadius: 15,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          // backgroundColor: theme.colors.RED,
        }}
      >
        <View
          style={{
            ...styles.spaceBetween,
            gap: sizes.WIDTH * 0.045,
            backgroundColor: theme.colors.WHITE,
            paddingHorizontal: sizes.PADDING,
            paddingVertical: sizes.HEIGHT * 0.028,
          }}
        >
          <View style={styles.QuantityContainer}>
            <MinusIcon
              width={scaleWithMax(25, 28)}
              height={scaleWithMax(25, 28)}
              onPress={() => handleQuantityChange('decrement')}
            />
            <Text style={styles.QuantityText}>{quantity}</Text>
            <PlusIcon
              width={scaleWithMax(25, 28)}
              height={scaleWithMax(25, 28)}
              onPress={() => handleQuantityChange('increment')}
            />
          </View>

          <CustomButton
            buttonStyle={styles.button}
            onPress={() => navigation.navigate('GiftMessage' as never)}
            title="Add To Cart"
          />
        </View>
      </View>
    </View>
  );
};

export default ProductDetails;

const styles = StyleSheet.create({});
