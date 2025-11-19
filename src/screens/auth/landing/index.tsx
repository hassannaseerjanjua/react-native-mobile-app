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

interface LandingProps extends AuthStackScreen<'Landing'> {}

const Landing: React.FC<LandingProps> = ({ navigation }) => {
  const { styles, theme } = useStyles();
  const { getString, langCode } = useLocaleStore();
  const { shiftLanguage } = useLanguageShifter();
  const { sizes } = useTheme();

  const displayLangCode = useRef(langCode as 'en' | 'ar');
  const [shimmerLoading, setShimmerLoading] = useState(false);

  useEffect(() => {
    if (!shimmerLoading) {
      displayLangCode.current = langCode as 'en' | 'ar';
    }
  }, [langCode, shimmerLoading]);

  return (
    <ParentView style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      <TouchableOpacity
        style={[
          styles.languageContainer,
          rtlPosition(
            displayLangCode.current === 'ar',
            undefined,
            sizes.PADDING,
          ),
        ]}
        onPress={() => {
          setShimmerLoading(true);
          shiftLanguage(langCode === 'en' ? 'ar' : 'en');

          setTimeout(() => {
            setShimmerLoading(false);
          }, 1000);
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
      <TouchableOpacity style={styles.logoContainer}>
        <SvgLogoBlue
          width={theme.sizes.APP_LOGO}
          opacity={shimmerLoading ? 0.1 : 1}
        />
      </TouchableOpacity>
      {shimmerLoading ? (
        <SkeletonLoader screenType="landing" />
      ) : (
        <View style={styles.buttonContainer}>
          <CustomButton
            title={getString('AU_SIGN_IN')}
            type="primary"
            onPress={() => navigation.navigate('SignIn')}
          />
          <CustomButton
            title={getString('AU_SIGN_UP')}
            type="secondary"
            onPress={() => navigation.navigate('SignUp')}
          />
        </View>
      )}
    </ParentView>
  );
};

export default Landing;
