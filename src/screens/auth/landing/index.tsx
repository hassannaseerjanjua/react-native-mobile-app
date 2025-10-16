import React from 'react';
import { View, StatusBar, TouchableOpacity } from 'react-native';
import { AuthStackScreen } from '../../../types/navigation.types';
import CustomButton from '../../../components/global/Custombutton';
import useStyles from './style';
import { SvgLogoBlue } from '../../../assets/icons';
import {
  useLanguageShifter,
  useLocaleStore,
} from '../../../store/reducer/locale';
import ParentView from '../../../components/app/ParentView';

interface LandingProps extends AuthStackScreen<'Landing'> {}

const Landing: React.FC<LandingProps> = ({ navigation }) => {
  const { styles, theme } = useStyles();
  const { getString, langCode } = useLocaleStore();
  const { shiftLanguage } = useLanguageShifter();

  return (
    <ParentView style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      <TouchableOpacity
        style={styles.logoContainer}
        onPress={() => shiftLanguage(langCode === 'en' ? 'ar' : 'en')}
      >
        <SvgLogoBlue width={theme.sizes.APP_LOGO} />
      </TouchableOpacity>

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
    </ParentView>
  );
};

export default Landing;
