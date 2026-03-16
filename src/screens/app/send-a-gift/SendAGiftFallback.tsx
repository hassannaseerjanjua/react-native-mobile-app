import React from 'react';
import { View, ScrollView } from 'react-native';
import ParentView from '../../../components/app/ParentView';
import HomeHeader from '../../../components/global/HomeHeader';
import SkeletonLoader from '../../../components/SkeletonLoader';
import ShadowView from '../../../components/global/ShadowView';
import { useLocaleStore } from '../../../store/reducer/locale';
import useStyles from './style';

/**
 * Lightweight fallback shown while SendAGiftScreen module loads.
 * Matches main screen loading state: header, search bar, tabs loader, list skeleton.
 */
const SendAGiftFallback: React.FC = () => {
  const { getString } = useLocaleStore();
  const { styles, theme } = useStyles();

  return (
    <ParentView style={styles.container}>
      <HomeHeader
        title={getString('HOME_SEND_A_GIFT')}
        showBackButton
        showSearch={false}
        showSearchBar
        searchPlaceholder={getString('HOME_SEARCH')}
        loading
      />
      <View style={styles.content}>
        <ScrollView
          style={styles.scrollableContentContainer}
          contentContainerStyle={{
            paddingHorizontal: theme.sizes.PADDING,
            paddingBottom: theme.sizes.HEIGHT * 0.025,
          }}
          showsVerticalScrollIndicator={false}
        >
          <View>
            <SkeletonLoader screenType="groupTabs" />
          </View>
          <ShadowView preset="listItem">
            <View style={styles.listCard}>
              <SkeletonLoader screenType="sendAGift" />
            </View>
          </ShadowView>
        </ScrollView>
      </View>
    </ParentView>
  );
};

export default SendAGiftFallback;
