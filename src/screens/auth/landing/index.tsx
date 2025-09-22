import React from 'react';
import { View, Image } from 'react-native';
import { AuthStackScreen } from '../../../types/navigation.types';
import CustomButton from '../../../components/global/Custombutton';
import { useColors } from '../../../styles/colors';
import { styles } from './style';

interface LandingProps extends AuthStackScreen<'Landing'> {}

const Landing: React.FC<LandingProps> = ({ navigation }) => {
  const colors = useColors();

  return (
    <>
      <View style={{ flex: 1, backgroundColor: colors.WHITE }}>
        <View style={styles.container}>
          <Image source={require('../../../assets/images/blueLogo.png')} />
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
            color={colors.PRIMARY}
            onPress={() => navigation.navigate('SignUp')}
          />
        </View>
      </View>
    </>
  );
};

export default Landing;
