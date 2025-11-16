import React from 'react';
import { View, StatusBar, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import HomeHeader from '../../../components/global/HomeHeader';
import HomeScreenTabs from '../../../components/global/HomeScreenTabs';
import ImageSlider from '../../../components/global/ImageSlider';
import SkeletonLoader from '../../../components/SkeletonLoader';
import useStyles from './style';
import {
  SvgGiftOneGetOne,
  SvgInboxGift,
  SvgOutboxGift,
  SvgProfileCrossIcon,
  SvgSendAGift,
} from '../../../assets/icons';
import apiEndpoints from '../../../constants/api-endpoints';
import { Slider, SliderApiResponse } from '../../../types';
import { useAuthStore } from '../../../store/reducer/auth';
import { useLocaleStore } from '../../../store/reducer/locale';
import { Text } from '../../../utils/elements';
import useGetApi from '../../../hooks/useGetApi';
import { isIOS, isIOSThen, scaleWithMax } from '../../../utils';

const HomeScreen: React.FC = () => {
  const { styles, theme } = useStyles();
  const { getString } = useLocaleStore();
  const { user } = useAuthStore();
  const navigation = useNavigation();

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
          navigation.navigate('Profile' as never);
        }}
        showLogo={true}
        showSearch={true}
      />
      <View style={styles.mainContent}>
        {sliderLoading ? (
          <SkeletonLoader screenType="home" />
        ) : (
          <>
            <Text style={styles.welcomeText}>
              {getString('HOME_WELCOME')}
              {', '}
              <Text style={styles.userName}>{user?.FullNameEn}</Text>
            </Text>
            <View style={styles.heroImage}>
              <ImageSlider
                sliders={sliderResponse || undefined}
                loading={sliderLoading}
                error={sliderError}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionTitle}>
                {getString('HOME_WHAT_ARE_YOU')}
              </Text>
              <HomeScreenTabsContainer />
            </View>
          </>
        )}
      </View>
    </View>
  );
};

// Component to handle all the tabs
const HomeScreenTabsContainer: React.FC = () => {
  const { styles, theme } = useStyles();
  const { getString } = useLocaleStore();
  const navigation = useNavigation();
  const isProMax = theme.sizes.WIDTH >= 430 && isIOS;

  const homeScreenTabs = [
    {
      id: 'gift-one-get-one',
      icon: <SvgGiftOneGetOne />,
      title: getString('HOME_GIFT_ONE'),
      titlePrimary: getString('HOME_GET_ONE'),
      description: getString('HOME_GIFT_ONE_GET_ONE_DESC'),
      onPress: () => navigation.navigate('SelectStore' as never),
    },
    {
      id: 'send-a-gift',
      icon: <SvgSendAGift />,
      title: getString('HOME_SEND_A_GIFT'),
      description: getString('HOME_SEND_A_GIFT_DESC'),
      onPress: () => navigation.navigate('SendAGift' as never),
    },
    {
      id: 'catch',
      image: require('../../../assets/images/catchIcon.png'),
      title: getString('HOME_CATCH'),
      titlePrimary: '\n' + getString('HOME_CATCH_INSTANT_GIFTS_LIMITED_TIME'),
      description: getString('HOME_CATCH_INSTANT_GIFT_DESC'),
      onPress: () =>
        (navigation as any).navigate('CatchScreen', {
          type: 'catch',
        }),
    },
    {
      id: 'inbox',
      icon: <SvgInboxGift />,
      title: getString('HOME_INBOX'),
      description: getString('HOME_INBOX_DESC'),
      onPress: () => navigation.navigate('Inbox' as never),
    },
    {
      id: 'outbox',
      icon: (
        <SvgOutboxGift
          style={{
            transform: isIOSThen([{ rotate: '180deg' }], []),
          }}
        />
      ),
      title: getString('HOME_OUTBOX'),
      description: getString('HOME_OUTBOX_DESC'),
      onPress: () => navigation.navigate('OutBox' as never),
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

      <View style={styles.optionsWrapper}>
        <HomeScreenTabs
          key={homeScreenTabs[2].id}
          image={homeScreenTabs[2].image}
          title={homeScreenTabs[2].title}
          titlePrimary={homeScreenTabs[2].titlePrimary}
          description={homeScreenTabs[2].description}
          onPress={homeScreenTabs[2].onPress}
        />
      </View>

      <View style={styles.optionsWrapper}>
        {homeScreenTabs.slice(3, 5).map(tab => (
          <HomeScreenTabs
            key={tab.id}
            icon={tab.icon}
            title={tab.title}
            description={tab.description}
            onPress={tab.onPress}
            style={{
              paddingVertical: isProMax
                ? scaleWithMax(24, 26)
                : scaleWithMax(20, 30),
            }}
          />
        ))}
      </View>
    </View>
  );
};

export default HomeScreen;
