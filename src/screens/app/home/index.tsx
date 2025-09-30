import React from 'react';
import { View, Text, ScrollView, StatusBar } from 'react-native';
import { AppStackScreen } from '../../../types/navigation.types';
import Header from '../../../components/global/Header';
import HomeScreenTabs from '../../../components/global/HomeScreenTabs';
import useStyles from './style';
import {
  SvgDummyBanner,
  SvgGiftOneGetOne,
  SvgInboxGift,
  SvgOutboxGift,
  SvgSendAGift,
} from '../../../assets/icons';

const HomeScreen: React.FC<AppStackScreen<'Home'>> = ({ navigation }) => {
  const { styles, theme } = useStyles();

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor={theme.colors.BACKGROUND}
        barStyle="dark-content"
      />
      <Header isLogo isSearch showBackButton={false} spaceTaken={false} />

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.welcomeText}>
          Welcome, <Text style={styles.userName}>Mohammed</Text>
        </Text>

        <SvgDummyBanner />
        <HomeScreenTabsContainer />
      </ScrollView>
    </View>
  );
};

// Component to handle all the tabs
const HomeScreenTabsContainer: React.FC = () => {
  const { styles } = useStyles();

  const homeScreenTabs = [
    {
      id: 'gift-one-get-one',
      icon: <SvgGiftOneGetOne />,
      title: 'Gift One',
      titlePrimary: 'Get One',
      description: 'Send a gift and score a bonus treat for yourself.',
      flex: 1.2,
    },
    {
      id: 'send-a-gift',
      icon: <SvgSendAGift />,
      title: 'Send a Gift',
      description: 'Send & receive gifts from your friends and loved ones.',
    },
    {
      id: 'catch',
      image: require('../../../assets/images/catchIcon.png'),
      title: 'Catch\nInstant gifts, limited time.',
      description:
        'Be the fastest to claim surprise drops\nbefore they disappear.',
    },
    {
      id: 'inbox',
      icon: <SvgInboxGift />,
      title: 'Inbox',
      description: 'Received gifts',
    },
    {
      id: 'outbox',
      icon: <SvgOutboxGift />,
      title: 'Outbox',
      description: 'Sent gifts',
    },
  ];

  return (
    <>
      <Text style={styles.sectionTitle}>What are you looking for?</Text>

      <View style={styles.optionsWrapper}>
        {homeScreenTabs.slice(0, 2).map(tab => (
          <HomeScreenTabs
            key={tab.id}
            icon={tab.icon}
            title={tab.title}
            titlePrimary={tab.titlePrimary}
            description={tab.description}
            flex={tab.flex}
          />
        ))}
      </View>

      <HomeScreenTabs
        key={homeScreenTabs[2].id}
        image={homeScreenTabs[2].image}
        title={homeScreenTabs[2].title}
        titlePrimary={homeScreenTabs[2].titlePrimary}
        description={homeScreenTabs[2].description}
      />

      <View style={styles.optionsWrapper}>
        {homeScreenTabs.slice(3, 5).map(tab => (
          <HomeScreenTabs
            key={tab.id}
            icon={tab.icon}
            title={tab.title}
            description={tab.description}
          />
        ))}
      </View>
    </>
  );
};

export default HomeScreen;
