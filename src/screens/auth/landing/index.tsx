import React, { useState, useMemo, useRef, useEffect } from 'react';
import { View, StatusBar, TouchableOpacity } from 'react-native';
import { AuthStackScreen } from '../../../types/navigation.types';
import CustomButton from '../../../components/global/Custombutton';
import useStyles from './style';
import {
  SvgArabicIcon,
  SvgEnglishIcon,
  SvgLogoBlue,
} from '../../../assets/icons';
import {
  useLanguageShifter,
  useLocaleStore,
} from '../../../store/reducer/locale';
import ParentView from '../../../components/app/ParentView';
import useTheme from '../../../styles/theme';
import SkeletonLoader from '../../../components/SkeletonLoader';
import { rtlPosition } from '../../../utils/rtl';
import { scaleWithMax } from '../../../utils';

interface LandingProps extends AuthStackScreen<'Landing'> {}

const Landing: React.FC<LandingProps> = ({ navigation }) => {
  const { styles, theme } = useStyles();
  const { getString, langCode, isFetching } = useLocaleStore();
  const { shiftLanguage } = useLanguageShifter();
  const { sizes } = useTheme();

  const displayLangCode = useRef(langCode as 'en' | 'ar');
  const [shimmerLoading, setShimmerLoading] = useState(false);

  useEffect(() => {
    if (!shimmerLoading) {
      displayLangCode.current = langCode as 'en' | 'ar';
    }
  }, [langCode, shimmerLoading]);

  const [fallbackKeysLoaded, setFallbackKeysLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setFallbackKeysLoaded(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const keysLoaded =
    fallbackKeysLoaded ||
    (!isFetching && getString('AU_SIGN_IN') !== 'AU_SIGN_IN');

  return (
    <ParentView style={styles.container} stableLayout={false}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      <TouchableOpacity
        style={[
          styles.languageContainer,
          // rtlPosition(
          //   displayLangCode.current === 'ar',
          //   undefined,
          //   sizes.PADDING,
          // ),
        ]}
        onPress={() => {
          setShimmerLoading(true);
          shiftLanguage(langCode === 'en' ? 'ar' : 'en');
        }}
      >
        {displayLangCode.current === 'en' ? (
          <SvgArabicIcon
            width={sizes.WIDTH * 0.08}
            height={sizes.WIDTH * 0.08}
          />
        ) : (
          <SvgEnglishIcon
            width={sizes.WIDTH * 0.08}
            height={sizes.WIDTH * 0.08}
          />
        )}
      </TouchableOpacity>
      <View style={styles.logoContainer}>
        <SvgLogoBlue />
      </View>
      {shimmerLoading || !keysLoaded ? (
        <SkeletonLoader screenType="landing" />
      ) : (
        <View style={styles.buttonContainer}>
          <CustomButton
            title={
              getString('AU_SIGN_IN') === 'AU_SIGN_IN'
                ? 'Sign In'
                : getString('AU_SIGN_IN')
            }
            type="primary"
            onPress={() => navigation.navigate('SignIn')}
          />
          <CustomButton
            title={
              getString('AU_SIGN_UP') === 'AU_SIGN_UP'
                ? 'Sign Up'
                : getString('AU_SIGN_UP')
            }
            type="secondary"
            onPress={() => navigation.navigate('SignUp')}
          />
        </View>
      )}
    </ParentView>
  );
};

export default Landing;
