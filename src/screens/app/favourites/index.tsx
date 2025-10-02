import React from 'react';
import { View, Text, StatusBar } from 'react-native';
import HomeHeader from '../../../components/global/HomeHeader.tsx';
import useStyles from './style.ts';
import { useNavigation } from '@react-navigation/native';
const FavouritesScreen: React.FC = () => {
  const { styles, theme } = useStyles();
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor={theme.colors.BACKGROUND}
        barStyle="dark-content"
      />
      <HomeHeader
        title="Favourites"
        showBackButton={true}
        showSearch={false}
        onBackPress={() => navigation.goBack()}
      />

      <View style={styles.content}>
        <Text style={styles.title}>Favourites</Text>
      </View>
    </View>
  );
};

export default FavouritesScreen;
