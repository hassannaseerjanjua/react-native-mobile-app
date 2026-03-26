import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, StatusBar } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'react-native-linear-gradient';
import HomeHeader from '../../../components/global/HomeHeader';
import HomeScreenTabs from '../../../components/global/HomeScreenTabs';
import ImageSlider from '../../../components/global/ImageSlider';
import SkeletonLoader from '../../../components/SkeletonLoader';
import useStyles from './style';
import {
  SvgHomeG1G1,
  SvgHomeInbox,
  SvgHomeOutbox,
  SvgHomeSendAGift,
  SvgConfetti,
} from '../../../assets/icons';
import apiEndpoints from '../../../constants/api-endpoints';
import { Slider, SliderApiResponse } from '../../../types';
import { useAuthStore } from '../../../store/reducer/auth';
import { useLocaleStore } from '../../../store/reducer/locale';
import { Text } from '../../../utils/elements';
import useGetApi from '../../../hooks/useGetApi';
import { isAndroidThen, isIOS } from '../../../utils';
import notify from '../../../utils/notify';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const HomeScreen: React.FC = () => {
  const { styles, theme } = useStyles();
  const { getString, isRtl, isFetching } = useLocaleStore();
  const { user } = useAuthStore();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const hasLoadedOnceRef = useRef(false);
  const isMerchant = user?.isMerchant === 1;
  // const keysLoaded =
  //   getString('HOME_WELCOME') !== 'HOME_WELCOME' &&
  //   getString('HOME_WHAT_ARE_YOU') !== 'HOME_WHAT_ARE_YOU';

  const [fallbackKeysLoaded, setFallbackKeysLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setFallbackKeysLoaded(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const keysLoaded =
    fallbackKeysLoaded ||
    (!isFetching &&
      getString('HOME_WELCOME') !== 'HOME_WELCOME' &&
      getString('HOME_WHAT_ARE_YOU') !== 'HOME_WHAT_ARE_YOU');

  const {
    data: sliderResponse,
    loading: sliderLoading,
    error: sliderError,
    refetch: refetchSlider,
  } = useGetApi<Slider[]>(apiEndpoints.GET_HOME_SLIDER, {
    transformData: (data: SliderApiResponse) => data?.Data || [],
  });

  const refetchSliderRef = useRef(refetchSlider);

  useEffect(() => {
    refetchSliderRef.current = refetchSlider;
  }, [refetchSlider]);

  useFocusEffect(
    useCallback(() => {
      if (!hasLoadedOnceRef.current) return;
      refetchSliderRef.current();
    }, []),
  );

  if (sliderResponse && !hasLoadedOnceRef.current) {
    hasLoadedOnceRef.current = true;
  }
  // notify.error('test');
  // notify.success('test');
  const showShimmer =
    !keysLoaded ||
    (!fallbackKeysLoaded &&
      !hasLoadedOnceRef.current &&
      (sliderLoading || !sliderResponse));

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor={theme.colors.STATUS_BAR_BACKGROUND}
        barStyle="dark-content"
        translucent
      />

      <View style={[styles.contentWrapper, { paddingTop: insets.top }]}>
        {/* <LinearGradient
          // colors={[
          //   '#FFFFFF',
          //   '#FEF8F8',
          //   '#FDECEC',
          //   '#FDECEC',
          //   '#FDECEC',
          //   '#FDECEC',
          //   '#FFFFFF',
          // ]}
          colors={[
            '#FFFFFF',
            '#FFFFFF',
            '#FFFFFF',
            '#FFFFFF',
            '#FFFFFF',
            '#FFFFFF',
            '#FFFFFF',
            '#FFFFFF',
          ]}
          locations={[0, isAndroidThen(0.06, 0.92), 0.15, 0.4, 0.6, 0.85, 1, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 0 }}
          style={styles.mainContent}
          useAngle={false}
        /> */}
        <View style={styles.confettiContainer} pointerEvents="none">
          <SvgConfetti width="100%" height="100%" />
          <LinearGradient
            pointerEvents="none"
            colors={['rgba(255,255,255,0)', '#FFFFFF', '#FFFFFF']}
            locations={[0, 0.65, 1]}
            style={styles.confettiFade}
            useAngle={false}
          />
        </View>
        <HomeHeader
          showProfileIcon={true}
          onProfilePress={() => {
            navigation.navigate('Profile' as never);
          }}
          showLogo={true}
          showSearch={!isMerchant}
          showCartIcon={true}
          customContainerStyle={{
            backgroundColor: 'transparent',
            zIndex: 2,
          }}
        />
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
  const { user } = useAuthStore();
  const navigation = useNavigation();
  const isMerchant = user?.isMerchant === 1;
  const isProMax = theme.sizes.WIDTH >= 430 && isIOS;

  const formatDescription = (text: string) => text.replace(/\.\s+/, '.\n');

  const homeScreenTabs = [
    {
      id: 'gift-one-get-one',
      icon: <SvgHomeG1G1 />,
      title: getString('HOME_GIFT_ONE_GET_ONE'),
      description: formatDescription(getString('HOME_GIFT_ONE_GET_ONE_DESC')),
      iconStyles: {
        marginRight: theme.sizes.WIDTH * 0.048,
      },
      onPress: () =>
        isMerchant
          ? notify.error(getString('MERCHANT_NOT_ALLOWED'))
          : (navigation as any).navigate('SendAGift' as never, {
              routeTo: 'GiftOneGetOne',
            }),
    },
    {
      id: 'catch',
      image: require('../../../assets/catch-Group-Icon.png'),
      title: getString('HOME_CATCH'),
      description: getString('HOME_CATCH_INSTANT_GIFT_DESC'),
      onPress: () =>
        isMerchant
          ? notify.error(getString('MERCHANT_NOT_ALLOWED'))
          : (navigation as any).navigate('CatchScreen', {
              type: 'catch',
            }),
    },
    {
      id: 'send-a-gift',
      icon: <SvgHomeSendAGift />,
      title: getString('HOME_SEND_A_GIFT'),
      description: getString('HOME_SEND_A_GIFT_DESC'),
      onPress: () =>
        (navigation as any).navigate('SendAGift' as never, {
          routeTo: 'SelectStore',
        }),
    },

    {
      id: 'inbox',
      icon: <SvgHomeInbox />,
      title: getString('HOME_INBOX'),
      description: getString('HOME_INBOX_DESC'),
      onPress: () =>
        isMerchant
          ? notify.error(getString('MERCHANT_NOT_ALLOWED'))
          : (navigation as any).navigate('InboxOutbox', {
              title: getString('HOME_INBOX'),
              isInbox: true,
            }),
    },
    {
      id: 'outbox',
      icon: <SvgHomeOutbox />,
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
      <View
        style={[
          styles.optionsWrapper,
          { marginBottom: theme.sizes.HEIGHT * 0.014 },
        ]}
      >
        <HomeScreenTabs
          key={homeScreenTabs[0].id}
          icon={homeScreenTabs[0].icon}
          title={homeScreenTabs[0].title}
          description={homeScreenTabs[0].description}
          onPress={homeScreenTabs[0].onPress}
          iconStyles={homeScreenTabs[0].iconStyles}
          style={{
            minHeight:
              theme.sizes.HEIGHT *
              isAndroidThen(0.133, isProMax ? 0.125 : 0.118),
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.08,
            shadowRadius: 8,
            elevation: 1,
          }}
        />
      </View>
      <View style={styles.optionsWrapper}>
        {homeScreenTabs.slice(1, 3).map(tab => (
          <HomeScreenTabs
            key={tab.id}
            icon={tab.icon}
            image={tab.image}
            title={tab.title}
            description={tab.description}
            onPress={tab.onPress}
            style={{
              minHeight:
                theme.sizes.HEIGHT *
                isAndroidThen(0.12, isProMax ? 0.111 : 0.106),
              shadowColor: '#000000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
              elevation: 1,
            }}
          />
        ))}
      </View>

      <Text style={styles.innerSectionTitle}>
        {getString('HOME_RECEIVED_AND_SENT_GIFTS')}
      </Text>

      <View style={styles.optionsWrapper}>
        {homeScreenTabs.slice(3, 5).map(tab => (
          <HomeScreenTabs
            key={tab.id}
            icon={tab.icon}
            title={tab.title}
            description={tab.description}
            onPress={tab.onPress}
            style={{
              minHeight:
                theme.sizes.HEIGHT *
                isAndroidThen(0.11, isProMax ? 0.103 : 0.098),
              shadowColor: '#000000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
              elevation: 1,
            }}
          />
        ))}
      </View>
    </View>
  );
};

export default HomeScreen;
