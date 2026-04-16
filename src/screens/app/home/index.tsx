import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, StatusBar } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import HomeHeader from '../../../components/global/HomeHeader';
import useStyles from './style';
import apiEndpoints from '../../../constants/api-endpoints';
import { useAuthStore } from '../../../store/reducer/auth';
import { Text } from '../../../utils/elements';
import useGetApi from '../../../hooks/useGetApi';
import { isAndroidThen, isIOS } from '../../../utils';
import notify from '../../../utils/notify';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const HomeScreen: React.FC = () => {
  const { styles, theme } = useStyles();
  const { user } = useAuthStore();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [fallbackKeysLoaded, setFallbackKeysLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setFallbackKeysLoaded(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor={theme.colors.STATUS_BAR_BACKGROUND}
        barStyle="dark-content"
        translucent
      />

      <View style={[styles.contentWrapper, { paddingTop: insets.top }]}>
        <HomeHeader
          showProfileIcon={true}
          onProfilePress={() => {
            navigation.navigate('Profile' as never);
          }}
          showLogo={true}
          customContainerStyle={{
            backgroundColor: 'transparent',
            zIndex: 2,
          }}
        />
      </View>
    </View>
  );
};

const HomeScreenTabsContainer: React.FC = () => {
  const { styles, theme } = useStyles();
  const { user } = useAuthStore();
  const navigation = useNavigation();
  const isProMax = theme.sizes.WIDTH >= 430 && isIOS;

  return (
    <View style={styles.contentContainer}>
      <View
        style={[
          styles.optionsWrapper,
          { marginBottom: theme.sizes.HEIGHT * 0.014 },
        ]}
      ></View>
      <View style={styles.optionsWrapper}></View>

      <View style={styles.optionsWrapper}></View>
    </View>
  );
};

export default HomeScreen;
