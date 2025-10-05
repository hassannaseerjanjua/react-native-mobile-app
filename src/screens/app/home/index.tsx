import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StatusBar } from 'react-native';
import { AppStackScreen } from '../../../types/navigation.types';
import { useNavigation } from '@react-navigation/native';
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
import { useLocaleStore } from '../../../store/reducer/locale';
import ParentView from '../../../components/app/ParentView';

const HomeScreen: React.FC = () => {
  const { styles, theme } = useStyles();
  const [sliders, setSliders] = useState<Slider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch();
  const { getString } = useLocaleStore();
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
          {getString('HOME_WELCOME')}
          <Text style={styles.userName}>{user?.FullNameEn}</Text>
        </Text>

        {loading ? (
          <View
            style={[
              styles.heroImage,
              {
                backgroundColor: '#f0f0f0',
                borderRadius: theme.sizes.BORDER_RADIUS_MID,
              },
            ]}
          />
        ) : error ? (
          <View
            style={[
              styles.heroImage,
              {
                backgroundColor: '#f0f0f0',
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: theme.sizes.BORDER_RADIUS_MID,
              },
            ]}
          >
            <Text style={{ color: '#666' }}>Failed to load images</Text>
          </View>
        ) : (
          <View style={styles.heroImage}>
            <ImageSlider sliders={sliders} />
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
  const { getString } = useLocaleStore();
  const navigation = useNavigation();

  const handleSendAGiftPress = () => {
    navigation.navigate('SendAGift' as never);
  };

  const homeScreenTabs = [
    {
      id: 'gift-one-get-one',
      icon: <SvgGiftOneGetOne />,
      title: getString('HOME_GIFT_ONE_GET_ONE'),
      titlePrimary: '',
      description: getString('HOME_GIFT_ONE_GET_ONE_DESC'),
      onPress: undefined,
    },
    {
      id: 'send-a-gift',
      icon: <SvgSendAGift />,
      title: getString('HOME_SEND_A_GIFT'),
      description: getString('HOME_SEND_A_GIFT_DESC'),
      onPress: handleSendAGiftPress,
    },
    {
      id: 'catch',
      image: require('../../../assets/images/catchIcon.png'),
      title: getString('HOME_CATCH_INSTANT_GIFT'),
      description: getString('HOME_CATCH_INSTANT_GIFT_DESC'),
      onPress: undefined,
    },
    {
      id: 'inbox',
      icon: <SvgInboxGift />,
      title: getString('HOME_INBOX'),
      description: getString('HOME_INBOX_DESC'),
      onPress: undefined,
    },
    {
      id: 'outbox',
      icon: <SvgOutboxGift />,
      title: getString('HOME_OUTBOX'),
      description: getString('HOME_OUTBOX_DESC'),
      onPress: undefined,
    },
  ];

  return (
    <View style={styles.contentContainer}>
      <Text style={styles.sectionTitle}>{getString('HOME_WHAT_ARE_YOU')}</Text>

      <View style={styles.optionsWrapper}>
        {homeScreenTabs.slice(0, 2).map(tab => (
          <HomeScreenTabs
            key={tab.id}
            icon={tab.icon}
            title={tab.title}
            titlePrimary={tab.titlePrimary}
            description={tab.description}
            onPress={tab.onPress}
          />
        ))}
      </View>

      <HomeScreenTabs
        key={homeScreenTabs[2].id}
        image={homeScreenTabs[2].image}
        title={homeScreenTabs[2].title}
        titlePrimary={homeScreenTabs[2].titlePrimary}
        description={homeScreenTabs[2].description}
        onPress={homeScreenTabs[2].onPress}
      />

      <View style={styles.optionsWrapper}>
        {homeScreenTabs.slice(3, 5).map(tab => (
          <HomeScreenTabs
            key={tab.id}
            icon={tab.icon}
            title={tab.title}
            description={tab.description}
            onPress={tab.onPress}
          />
        ))}
      </View>
    </View>
  );
};

export default HomeScreen;
