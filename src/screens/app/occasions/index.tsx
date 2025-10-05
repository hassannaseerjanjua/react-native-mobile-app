import React from 'react';
import { View, Text, StatusBar } from 'react-native';
import Header from '../../../components/global/Header';
import useStyles from './style.ts';
import HomeHeader from '../../../components/global/HomeHeader.tsx';
import { useNavigation } from '@react-navigation/native';
import ParentView from '../../../components/app/ParentView';

const OccasionsScreen: React.FC = () => {
  const { styles, theme } = useStyles();
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor={theme.colors.BACKGROUND}
        barStyle="dark-content"
      />

      <View style={styles.content}>
        <Text style={styles.title}>Occasions</Text>
      </View>
    </View>
  );
};

export default OccasionsScreen;
