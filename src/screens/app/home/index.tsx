import React, { useRef } from 'react';
import {
  View,
  StatusBar,
  useWindowDimensions,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'react-native-linear-gradient';
import ParentView from '../../../components/app/ParentView';
import HomeHeader from '../../../components/global/HomeHeader';
import HomeScreenTabs from '../../../components/global/HomeScreenTabs';
import ImageSlider from '../../../components/global/ImageSlider';
import SkeletonLoader from '../../../components/SkeletonLoader';
import useStyles from './style';
import {
  SvgGiftOneGetOne,
  SvgHomeG1G1,
  SvgHomeInbox,
  SvgHomeOutbox,
  SvgHomeSendAGift,
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
import {
  isAndroid,
  isAndroidThen,
  isIOS,
  isIOSThen,
  scaleWithMax,
} from '../../../utils';

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
          showSearch={true}
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
  const isLargeAndroid = isAndroid && theme.sizes.HEIGHT > 800;

  const homeScreenTabs = [
    {
      id: 'gift-one-get-one',
      icon: <SvgHomeG1G1 />,
      title: getString('HOME_GIFT_ONE') + ' ' + getString('HOME_GET_ONE'),
      titlePrimary: getString('HOME_GET_ONE'),
      description: getString('HOME_GIFT_ONE_GET_ONE_DESC'),
      iconStyles: {
        marginRight: scaleWithMax(18, 20),
      },
      onPress: () =>
        (navigation as any).navigate('SendAGift' as never, {
          routeTo: 'GiftOneGetOne',
        }),
    },
    {
      id: 'catch',
      image: require('../../../assets/catch-Group-Icon.png'),
      title: getString('HOME_CATCH'),
      description: getString('HOME_CATCH_INSTANT_GIFT_DESC'),
      onPress: () =>
        (navigation as any).navigate('CatchScreen', {
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
        (navigation as any).navigate('InboxOutbox', {
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
              ? scaleWithMax(95, 103)
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
            titlePrimary={tab.titlePrimary}
            description={tab.description}
            onPress={tab.onPress}
            style={{
              minHeight: isProMax
                ? scaleWithMax(85, 100)
                : isLargeAndroid
                ? scaleWithMax(85, 93)
                : scaleWithMax(85, 85),
            }}
          />
        ))}
      </View>

      <Text style={styles.innerSectionTitle}>Received and sent gifts</Text>

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
                ? scaleWithMax(75, 83)
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
