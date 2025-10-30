import React, { useState, useMemo } from 'react';
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

interface LandingProps extends AuthStackScreen<'Landing'> {}

const Landing: React.FC<LandingProps> = ({ navigation }) => {
  const { styles, theme } = useStyles();
  const { getString, langCode } = useLocaleStore();
  const { shiftLanguage } = useLanguageShifter();
  const { sizes } = useTheme();

  const langState = langCode as 'en' | 'ar';
  const [shimmerLoading, setShimmerLoading] = useState(false);

  console.log('langState', langState);

  return (
    <ParentView style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      <TouchableOpacity
        style={[
          styles.languageContainer,
          {
            justifyContent: langState === 'en' ? 'flex-end' : 'flex-start',
            transform: [{ translateX: 0 }],
          },
        ]}
        onPress={() => {
          setShimmerLoading(true);
          shiftLanguage(langCode === 'en' ? 'ar' : 'en');

          setTimeout(() => {
            setShimmerLoading(false);
          }, 1000);
        }}
      >
        {langState === 'en' ? (
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
