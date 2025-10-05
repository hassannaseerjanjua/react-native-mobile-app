import React from 'react';
import { View, Text, StatusBar } from 'react-native';
import HomeHeader from '../../../components/global/HomeHeader.tsx';
import useStyles from './style.ts';
import { useNavigation } from '@react-navigation/native';
import ParentView from '../../../components/app/ParentView.tsx';
const FavoritesScreen: React.FC = () => {
  const { styles, theme } = useStyles();
  const navigation = useNavigation();
  return (
    <ParentView style={styles.container}>
      <StatusBar
        backgroundColor={theme.colors.BACKGROUND}
        barStyle="dark-content"
      />
      <HomeHeader
        title="Favorites"
        showBackButton={true}
        showSearch={false}
        onBackPress={() => navigation.goBack()}
      />

      <View style={styles.content}>
        <Text style={styles.title}>Favorites</Text>
      </View>
    </ParentView>
  );
};

export default FavoritesScreen;
