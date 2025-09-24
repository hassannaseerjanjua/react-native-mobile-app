import React from 'react';
import { View, Image, StatusBar, Modal } from 'react-native';
import { AuthStackScreen } from '../../../types/navigation.types';
import CustomButton from '../../../components/global/Custombutton';
import useStyles from './style';
import { SvgLogoBlue } from '../../../assets/icons';
import { SafeAreaView } from 'react-native-safe-area-context';

interface LandingProps extends AuthStackScreen<'Landing'> {}

const Landing: React.FC<LandingProps> = ({ navigation }) => {
  const { styles, theme } = useStyles();

  return (
    <>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      <SafeAreaView style={styles.container}>
        <View style={styles.logoContainer}>
          <SvgLogoBlue width={theme.sizes.APP_LOGO} />
        </View>

        <View style={styles.buttonContainer}>
          <CustomButton
            title="Sign in"
            type="primary"
            onPress={() => navigation.navigate('SignIn')}
          />

          <CustomButton
            title="Sign Up"
            type="secondary"
            onPress={() => navigation.navigate('SignUp')}
          />
        </View>
      </SafeAreaView>
    </>
  );
};

export default Landing;
