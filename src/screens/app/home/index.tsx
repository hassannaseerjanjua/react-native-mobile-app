import React from 'react';
import { Text, TouchableOpacity, View, StatusBar } from 'react-native';
import { useDispatch } from 'react-redux';
import useStyles from './style';
import { AppStackScreen } from '../../../types/navigation.types';
import useScreenLoader from '../../../hooks/useScreenLoader';
import InputField from '../../../components/global/InputField';
import CustomButton from '../../../components/global/Custombutton';
import { logout } from '../../../store/reducer/auth';

const HomeScreen: React.FC<AppStackScreen<'Home'>> = ({ navigation }) => {
  const { styles, theme } = useStyles();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      <Text style={styles.txt1}>Home</Text>
      <InputField
        fieldProps={{
          placeholder: 'Enter your name',
        }}
      />
      <CustomButton title="Logout" type="secondary" onPress={handleLogout} />
    </View>
  );
};

export default HomeScreen;
