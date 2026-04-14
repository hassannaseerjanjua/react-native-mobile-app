import React from 'react';
import { View, StatusBar, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import useStyles from './style';
import { Text } from '../../../utils/elements';
import HomeHeader from '../../../components/global/HomeHeader';
import ParentView from '../../../components/app/ParentView';
import SkeletonLoader from '../../../components/SkeletonLoader';
import FAQItem from '../../../components/app/FAQItem';
import { FAQ } from '../../../types';
import apiEndpoints from '../../../constants/api-endpoints';
import useGetApi from '../../../hooks/useGetApi';
import { useLocaleStore } from '../../../store/reducer/locale';

const FAQScreen: React.FC = () => {
  const { styles, theme } = useStyles();
  const navigation = useNavigation();
  const { getString } = useLocaleStore();

  const GetFaqs = useGetApi<FAQ[]>(apiEndpoints.GET_FAQS, {
    transformData: (data: any) => data.Data?.Items || [],
  });

  return (
    <ParentView
      style={styles.container}
      shadowPreset="towardsBottom"
      emptyStateText={
        GetFaqs.data && GetFaqs.data.length > 0
          ? ''
          : getString('FAQ_NO_FAQS_FOUND')
      }
    >
      <StatusBar
        backgroundColor={theme.colors.BACKGROUND}
        barStyle="dark-content"
      />

      <HomeHeader
        title={getString('FAQS_FAQS')}
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {GetFaqs.loading ? (
          <SkeletonLoader screenType="faq" />
        ) : (
          <View style={styles.faqContainer}>
            {GetFaqs?.data?.map(item => (
              <FAQItem
                key={item.FaqId}
                item={item}
                onPress={() => {}}
                style={styles.faqItem}
                textStyle={styles.faqItemText}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </ParentView>
  );
};

export default FAQScreen;
