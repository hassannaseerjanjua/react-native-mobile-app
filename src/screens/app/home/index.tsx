import React, { useRef } from 'react';
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
  const hasLoadedOnceRef = useRef(false);

  const {
    data: sliderResponse,
    loading: sliderLoading,
    error: sliderError,
  } = useGetApi<Slider[]>(apiEndpoints.GET_HOME_SLIDER, {
    transformData: (data: SliderApiResponse) => data?.Data || [],
  });

  if (sliderResponse && !hasLoadedOnceRef.current) {
    hasLoadedOnceRef.current = true;
  }

  const showShimmer = sliderLoading && !hasLoadedOnceRef.current;

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
        showCartIcon={true}
      />
      <View style={styles.mainContent}>
        {showShimmer ? (
          <SkeletonLoader screenType="home" />
        ) : (
          <>
            <Text
              style={styles.welcomeText}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {getString('HOME_WELCOME')}
              {', '}
              <Text style={styles.userName}>{user?.FullNameEn}</Text>
            </Text>
            <View style={styles.heroImage}>
              <ImageSlider
                sliders={sliderResponse || undefined}
                loading={sliderLoading && !hasLoadedOnceRef.current}
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
      onPress: () =>
        (navigation as any).navigate('SendAGift' as never, {
          routeTo: 'GiftOneGetOne',
        }),
    },
    {
      id: 'send-a-gift',
      icon: <SvgSendAGift />,
      title: getString('HOME_SEND_A_GIFT'),
      description: getString('HOME_SEND_A_GIFT_DESC'),
      onPress: () =>
        (navigation as any).navigate('SendAGift' as never, {
          routeTo: 'SelectStore',
        }),
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
      onPress: () =>
        (navigation as any).navigate('InboxOutbox', {
          title: getString('HOME_INBOX'),
          isInbox: true,
        }),
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
      onPress: () =>
        (navigation as any).navigate('InboxOutbox', {
          title: getString('HOME_OUTBOX'),
          isInbox: false,
        }),
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
              minHeight: isProMax ? scaleWithMax(80, 86) : scaleWithMax(75, 80),
            }}
          />
        ))}
      </View>
    </View>
  );
};

export default HomeScreen;
