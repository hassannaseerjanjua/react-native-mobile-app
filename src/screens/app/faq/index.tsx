import React from 'react';
import { View, StatusBar, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import useStyles from './style';
import { Text } from '../../../utils/elements';
import TabItem from '../../../components/global/TabItem';
import HomeHeader from '../../../components/global/HomeHeader';
import ParentView from '../../../components/app/ParentView';

const FAQScreen: React.FC = () => {
  const { styles, theme } = useStyles();
  const navigation = useNavigation();

  const faqItems = [
    {
      id: 'faq-1',
      title: 'How do I send a gift?',
    },
    {
      id: 'faq-2',
      title: 'How do I add friends?',
    },
    {
      id: 'faq-3',
      title: 'How do I create a group?',
    },
    {
      id: 'faq-4',
      title: 'How do I check my wallet balance?',
    },
    {
      id: 'faq-5',
      title: 'How do I update my profile?',
    },
  ];

  return (
    <ParentView style={styles.container}>
      <StatusBar
        backgroundColor={theme.colors.BACKGROUND}
        barStyle="dark-content"
      />

      <HomeHeader
        title="FAQs"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.faqContainer}>
          {faqItems.map((item, index) => (
            <View key={item.id} style={styles.faqItemWrapper}>
              <TabItem
                title={item.title}
                onPress={() => {}}
                TabItemStyles={styles.faqItem}
                TabTextStyles={styles.faqItemText}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </ParentView>
  );
};

export default FAQScreen;
