import React from 'react';
import { View, Image, StatusBar, Modal } from 'react-native';
import { AuthStackScreen } from '../../../types/navigation.types';
import CustomButton from '../../../components/global/Custombutton';
import useStyles from './style';
import { SvgLogoBlue } from '../../../assets/icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocaleStore } from '../../../store/reducer/locale';
import ParentView from '../../../components/app/ParentView';

interface LandingProps extends AuthStackScreen<'Landing'> {}

const Landing: React.FC<LandingProps> = ({ navigation }) => {
  const { styles, theme } = useStyles();
  const { getString } = useLocaleStore();

  return (
    <ParentView style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      <View style={styles.logoContainer}>
        <SvgLogoBlue width={theme.sizes.APP_LOGO} />
      </View>

      <View style={styles.buttonContainer}>
        <CustomButton
          title={getString('SIGN_IN')}
          type="primary"
          onPress={() => navigation.navigate('SignIn')}
        />
        <CustomButton
          title={getString('SIGN_UP')}
          type="secondary"
          onPress={() => navigation.navigate('SignUp')}
        />
      </View>
    </ParentView>
  );
};

export default Landing;
