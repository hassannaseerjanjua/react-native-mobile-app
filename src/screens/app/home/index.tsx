import React, { useRef } from 'react';
import { View, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
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
} from '../../../assets/icons';
import apiEndpoints from '../../../constants/api-endpoints';
import { Slider, SliderApiResponse } from '../../../types';
import { useAuthStore } from '../../../store/reducer/auth';
import { useLocaleStore } from '../../../store/reducer/locale';
import { Text } from '../../../utils/elements';
import useGetApi from '../../../hooks/useGetApi';
import { isAndroid, isAndroidThen, isIOS, scaleWithMax } from '../../../utils';
import notify from '../../../utils/notify';

const HomeScreen: React.FC = () => {
  const { styles, theme } = useStyles();
  const { getString } = useLocaleStore();
  const { user } = useAuthStore();
  const navigation = useNavigation();
  const hasLoadedOnceRef = useRef(false);
  const isMerchant = user?.isMerchant === 1;

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
        backgroundColor={theme.colors.WHITE}
        barStyle="dark-content"
        translucent
      />

      <View style={styles.contentWrapper}>
        <LinearGradient
          colors={[
            '#FFFFFF',
            '#FEF8F8',
            '#FDECEC',
            '#FDECEC',
            '#FDECEC',
            '#FDECEC',
            '#FFFFFF',
          ]}
          locations={[0, isAndroidThen(0.06, 0.92), 0.15, 0.4, 0.6, 0.85, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.mainContent}
          useAngle={false}
        />
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
              {getString('HOME_WELCOME') === 'HOME_WELCOME'
                ? 'Welcome'
                : getString('HOME_WELCOME')}
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
                {getString('HOME_WHAT_ARE_YOU') === 'HOME_WHAT_ARE_YOU'
                  ? 'What are you looking for?'
                  : getString('HOME_WHAT_ARE_YOU')}
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
  const isLargeAndroid = isAndroid && theme.sizes.HEIGHT > 800;

  const homeScreenTabs = [
    {
      id: 'gift-one-get-one',
      icon: <SvgHomeG1G1 />,
      title:
        getString('HOME_GIFT_ONE_GET_ONE') === 'HOME_GIFT_ONE_GET_ONE'
          ? 'Gift One'
          : getString('HOME_GIFT_ONE_GET_ONE'),

      description:
        getString('HOME_GIFT_ONE_GET_ONE_DESC') === 'HOME_GIFT_ONE_GET_ONE_DESC'
          ? 'Gift One Get One'
          : getString('HOME_GIFT_ONE_GET_ONE_DESC'),
      iconStyles: {
        marginRight: scaleWithMax(18, 20),
      },
      onPress: () =>
        isMerchant
          ? notify.error(
            getString('MERCHANT_NOT_ALLOWED') === 'MERCHANT_NOT_ALLOWED'
              ? 'Merchant not allowed'
              : getString('MERCHANT_NOT_ALLOWED'),
          )
          : (navigation as any).navigate('SendAGift' as never, {
            routeTo: 'GiftOneGetOne',
          }),
    },
    {
      id: 'catch',
      image: require('../../../assets/catch-Group-Icon.png'),
      title:
        getString('HOME_CATCH') === 'HOME_CATCH'
          ? 'Catch'
          : getString('HOME_CATCH'),
      description:
        getString('HOME_CATCH_INSTANT_GIFT_DESC') ===
          'HOME_CATCH_INSTANT_GIFT_DESC'
          ? 'Catch instant gift'
          : getString('HOME_CATCH_INSTANT_GIFT_DESC'),
      onPress: () =>
        isMerchant
          ? notify.error(
            getString('MERCHANT_NOT_ALLOWED') === 'MERCHANT_NOT_ALLOWED'
              ? 'Merchant not allowed'
              : getString('MERCHANT_NOT_ALLOWED'),
          )
          : (navigation as any).navigate('CatchScreen', {
            type: 'catch',
          }),
    },
    {
      id: 'send-a-gift',
      icon: <SvgHomeSendAGift />,
      title:
        getString('HOME_SEND_A_GIFT') === 'HOME_SEND_A_GIFT'
          ? 'Send a Gift'
          : getString('HOME_SEND_A_GIFT'),
      description:
        getString('HOME_SEND_A_GIFT_DESC') === 'HOME_SEND_A_GIFT_DESC'
          ? 'Send a gift'
          : getString('HOME_SEND_A_GIFT_DESC'),
      onPress: () =>
        (navigation as any).navigate('SendAGift' as never, {
          routeTo: 'SelectStore',
        }),
    },

    {
      id: 'inbox',
      icon: <SvgHomeInbox />,
      title:
        getString('HOME_INBOX') === 'HOME_INBOX'
          ? 'Inbox'
          : getString('HOME_INBOX'),
      description:
        getString('HOME_INBOX_DESC') === 'HOME_INBOX_DESC'
          ? 'Inbox'
          : getString('HOME_INBOX_DESC'),
      onPress: () =>
        isMerchant
          ? notify.error(
            getString('MERCHANT_NOT_ALLOWED') === 'MERCHANT_NOT_ALLOWED'
              ? 'Merchant not allowed'
              : getString('MERCHANT_NOT_ALLOWED'),
          )
          : (navigation as any).navigate('InboxOutbox', {
            title:
              getString('HOME_INBOX') === 'HOME_INBOX'
                ? 'Inbox'
                : getString('HOME_INBOX'),
            isInbox: true,
          }),
    },
    {
      id: 'outbox',
      icon: <SvgHomeOutbox />,
      title:
        getString('HOME_OUTBOX') === 'HOME_OUTBOX'
          ? 'Outbox'
          : getString('HOME_OUTBOX'),
      description:
        getString('HOME_OUTBOX_DESC') === 'HOME_OUTBOX_DESC'
          ? 'Outbox'
          : getString('HOME_OUTBOX_DESC'),
      onPress: () =>
        (navigation as any).navigate('InboxOutbox', {
          title:
            getString('HOME_OUTBOX') === 'HOME_OUTBOX'
              ? 'Outbox'
              : getString('HOME_OUTBOX'),
          isInbox: false,
        }),
    },
  ];

  return (
    <View style={styles.contentContainer}>
      <View style={styles.optionsWrapper}>
        <HomeScreenTabs
          key={homeScreenTabs[0].id}
          icon={homeScreenTabs[0].icon}
          title={homeScreenTabs[0].title}
          description={homeScreenTabs[0].description}
          descriptionStyles={{
            maxWidth: '50%',
          }}
          onPress={homeScreenTabs[0].onPress}
          iconStyles={homeScreenTabs[0].iconStyles}
          style={{
            minHeight: isProMax
              ? scaleWithMax(95, 110)
              : isLargeAndroid
                ? scaleWithMax(88, 93)
                : scaleWithMax(95, 95),
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
              minHeight: isProMax
                ? scaleWithMax(85, 100)
                : isLargeAndroid
                  ? scaleWithMax(78, 83)
                  : scaleWithMax(85, 85),
            }}
          />
        ))}
      </View>

      <Text style={styles.innerSectionTitle}>
        {getString('HOME_RECEIVED_AND_SENT_GIFTS') ===
          'HOME_RECEIVED_AND_SENT_GIFTS'
          ? 'Received and Sent Gifts'
          : getString('HOME_RECEIVED_AND_SENT_GIFTS')}
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
              minHeight: isProMax
                ? scaleWithMax(75, 90)
                : isLargeAndroid
                  ? scaleWithMax(73, 78)
                  : scaleWithMax(78, 80),
              shadowColor: '#000000',
              shadowOffset: { width: 0, height: 5 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
              elevation: 2,
            }}
          />
        ))}
      </View>
    </View>
  );
};

export default HomeScreen;
