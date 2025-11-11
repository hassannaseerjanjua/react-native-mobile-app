import React from 'react';
import { View, Text, Image } from 'react-native';
import useStyles from './style';
import ParentView from '../../../components/app/ParentView';
import HomeHeader from '../../../components/global/HomeHeader';
import { DummyQrSvg, SvgProfileCrossIcon } from '../../../assets/icons';
import { useNavigation } from '@react-navigation/native';
import { scaleWithMax } from '../../../utils';

const ScanQr: React.FC = () => {
  const { styles, theme } = useStyles();
  const navigation = useNavigation();
  const dummyImage = require('../../../assets/images/qr-product-dummy.png');

  return (
    <ParentView>
      <HomeHeader
        showLogo={true}
        showBackButton={false}
        rightSideIcon={<SvgProfileCrossIcon />}
        rightSideTitle={true as any}
        onBackPress={() => navigation.navigate('Profile' as never)}
        rightSideTitlePress={() => navigation.navigate('Profile' as never)}
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
          <DummyQrSvg
            height={scaleWithMax(270, 275)}
            width={scaleWithMax(270, 275)}
          />
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
          <Text style={styles.QrCodeNums}>123456</Text>
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
                fontSize: theme.sizes.FONTSIZE_LESS_MEDIUM,
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
