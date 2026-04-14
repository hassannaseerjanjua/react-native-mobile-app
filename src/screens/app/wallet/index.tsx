import React from 'react';
import { View, StatusBar, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import useStyles from './style';
import { Text } from '../../../utils/elements';
import HomeHeader from '../../../components/global/HomeHeader';
import WalletCard from '../../../components/app/WalletCard';
import ParentView from '../../../components/app/ParentView';
import SkeletonLoader from '../../../components/SkeletonLoader';
import apiEndpoints from '../../../constants/api-endpoints';
import useGetApi from '../../../hooks/useGetApi';
import { useLocaleStore } from '../../../store/reducer/locale';

const WalletScreen: React.FC = () => {
  const { styles, theme } = useStyles();
  const navigation = useNavigation();
  const { getString } = useLocaleStore();

  const walletBalance = useGetApi<any>(apiEndpoints.GET_WALLET_BALANCE, {
    transformData: data => data.Data,
  });

  return (
    <ParentView style={styles.container} shadowPreset="towardsBottom">
      <StatusBar
        backgroundColor={theme.colors.BACKGROUND}
        barStyle="dark-content"
      />

      <HomeHeader
        title={getString('W_WALLET')}
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />

      {walletBalance.loading ? (
        <SkeletonLoader screenType="wallet" />
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.walletSection}>
            <WalletCard
              balance={
                walletBalance?.data?.WalletBalance != null
                  ? Number(walletBalance.data.WalletBalance)
                  : 0
              }
            />
          </View>
        </ScrollView>
      )}
    </ParentView>
  );
};

export default WalletScreen;
