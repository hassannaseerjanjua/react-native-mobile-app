import React from 'react';
import { View, StatusBar } from 'react-native';
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
import { Slider, SliderApiResponse } from '../../../types';
import { useDispatch } from 'react-redux';
import { logout, useAuthStore } from '../../../store/reducer/auth';
import { useLocaleStore } from '../../../store/reducer/locale';
import { Text } from '../../../utils/elements';
import useGetApi from '../../../hooks/useGetApi';

const HomeScreen: React.FC = () => {
  const { styles, theme } = useStyles();
  const dispatch = useDispatch();
  const { getString } = useLocaleStore();
  const { user } = useAuthStore();

  const {
    data: sliderResponse,
    loading: sliderLoading,
    error: sliderError,
  } = useGetApi<Slider[]>(apiEndpoints.GET_HOME_SLIDER, {
    transformData: (data: SliderApiResponse) => data?.Data || [],
  });

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

      <View style={styles.mainContent}>
        <Text style={styles.welcomeText}>
          {getString('HOME_WELCOME')}
          <Text style={styles.userName}>{user?.FullNameEn}</Text>
        </Text>
        <View style={styles.heroImage}>
          <ImageSlider
            sliders={sliderResponse || undefined}
            loading={sliderLoading}
            error={sliderError}
          />
        </View>
        <Text style={styles.sectionTitle}>
          {getString('HOME_WHAT_ARE_YOU')}
        </Text>
        <HomeScreenTabsContainer />
      </View>
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
      title: 'Gift One',
      titlePrimary: 'Get one',
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
      title: 'Catch',
      titlePrimary: '\nInstant gifts, limited time',
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
