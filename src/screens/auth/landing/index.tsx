import React from 'react';
import { View, Image, StatusBar } from 'react-native';
import { AuthStackScreen } from '../../../types/navigation.types';
import CustomButton from '../../../components/global/Custombutton';
import useStyles from './style';

interface LandingProps extends AuthStackScreen<'Landing'> {}

const Landing: React.FC<LandingProps> = ({ navigation }) => {
  const { styles, theme } = useStyles();

  return (
    <>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../../assets/images/blueLogo.png')}
            style={styles.logo}
          />
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
      </View>
    </>
  );
};

export default Landing;
