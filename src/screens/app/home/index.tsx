import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import StatusBarComponent from '../../../components/global/StatusBarComponent';
import useStyles from './style';
import { AppStackScreen } from '../../../types/navigation.types';
import useScreenLoader from '../../../hooks/useScreenLoader';
import InputField from '../../../components/global/InputField';

const HomeScreen: React.FC<AppStackScreen<'Home'>> = ({ navigation }) => {
  const { styles, theme } = useStyles();

  return (
    <View style={styles.container}>
      <StatusBarComponent backgroundColor={theme.colors.BACKGROUND} />
      <Text style={styles.txt1}>Home</Text>
      <InputField
        fieldProps={{
          placeholder: 'Enter your name',
        }}
      />
    </View>
  );
};

export default HomeScreen;
