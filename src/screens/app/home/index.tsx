import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StatusBar } from 'react-native';
import { AppStackScreen } from '../../../types/navigation.types';
import HomeHeader from '../../../components/global/HomeHeader';
import HomeScreenTabs from '../../../components/global/HomeScreenTabs';
import ImageSlider from '../../../components/global/ImageSlider';
import useStyles from './style';
import {
  SvgGiftOneGetOne,
  SvgInboxGift,
  SvgOutboxGift,
  SvgSendAGift,
} from '../../../assets/icons';
import apiEndpoints from '../../../constants/api-endpoints';
import api from '../../../utils/api';
import { Slider, SliderApiResponse } from '../../../types';
import { useSizes } from '../../../styles/sizes';
import { useDispatch } from 'react-redux';
import { logout, useAuthStore } from '../../../store/reducer/auth';
import { SafeAreaView } from 'react-native-safe-area-context';

const HomeScreen: React.FC = () => {
  const { styles, theme } = useStyles();
  const [sliders, setSliders] = useState<Slider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch();
  const getHomeSlider = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<SliderApiResponse>(
        apiEndpoints.GET_HOME_SLIDER,
      );
      setSliders(response.data?.Data || []);
    } catch (err) {
      console.log('Error fetching sliders:', err);
      setError('Failed to load slider images');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getHomeSlider();
    console.log('Api called');
  }, []);

  const { user } = useAuthStore();
  console.log('user', user);

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor={theme.colors.BACKGROUND}
        barStyle="dark-content"
      />
      <HomeHeader
        showProfileIcon={true}
        onProfilePress={() => {
          dispatch(logout());
        }}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.welcomeText}>
          Welcome, <Text style={styles.userName}>{user?.FullNameEn}</Text>
        </Text>

        {loading ? (
          <View style={[styles.heroImage, { backgroundColor: '#f0f0f0' }]} />
        ) : error ? (
          <View
            style={[
              styles.heroImage,
              {
                backgroundColor: '#f0f0f0',
                justifyContent: 'center',
                alignItems: 'center',
              },
            ]}
          >
            <Text style={{ color: '#666' }}>Failed to load images</Text>
          </View>
        ) : (
          <View style={styles.fullWidthContainer}>
            <ImageSlider sliders={sliders} height={theme.sizes.HEIGHT * 0.36} />
          </View>
        )}

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
    <View style={styles.contentContainer}>
      <Text style={styles.sectionTitle}>What are you looking for?</Text>

      <View style={styles.optionsWrapper}>
        {homeScreenTabs.slice(0, 2).map(tab => (
          <HomeScreenTabs
            key={tab.id}
            icon={tab.icon}
            title={tab.title}
            titlePrimary={tab.titlePrimary}
            description={tab.description}
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
    </View>
  );
};

export default HomeScreen;
