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
    <ParentView style={styles.container}>
      <StatusBar
        backgroundColor={theme.colors.BACKGROUND}
        barStyle="dark-content"
      />
      <HomeHeader
        title="Occasions"
        showBackButton={true}
        showSearch={false}
        onBackPress={() => navigation.goBack()}
      />

      <View style={styles.content}>
        <Text style={styles.title}>Occasions</Text>
      </View>
    </ParentView>
  );
};

export default OccasionsScreen;
