import React from 'react';
import { View, StatusBar, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import useStyles from './style';
import { Text } from '../../../utils/elements';
import HomeHeader from '../../../components/global/HomeHeader';
import WalletCard from '../../../components/app/WalletCard';
import ParentView from '../../../components/app/ParentView';

const WalletScreen: React.FC = () => {
  const { styles, theme } = useStyles();
  const navigation = useNavigation();

  return (
    <ParentView style={styles.container}>
      <StatusBar
        backgroundColor={theme.colors.BACKGROUND}
        barStyle="dark-content"
      />

      <HomeHeader
        title="Wallet"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.walletSection}>
          <WalletCard balance="200.00" />
        </View>
      </ScrollView>
    </ParentView>
  );
};

export default WalletScreen;
