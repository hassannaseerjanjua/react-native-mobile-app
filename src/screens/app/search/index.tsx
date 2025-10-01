import React from 'react';
import { View, Text, StatusBar } from 'react-native';
import { AppStackScreen } from '../../../types/navigation.types';
import AuthHeader from '../../../components/global/AuthHeader';
import useStyles from './style.ts';
import HomeHeader from '../../../components/global/HomeHeader';

interface SearchProps extends AppStackScreen<'Search'> {}

const SearchScreen: React.FC<SearchProps> = ({ navigation }) => {
  const { styles, theme } = useStyles();

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor={theme.colors.BACKGROUND}
        barStyle="dark-content"
      />
      <HomeHeader
        title="Search"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
        showSearch={false}
      />
      <View style={styles.content}>
        <Text style={styles.title}>Search Screen</Text>
      </View>
    </View>
  );
};

export default SearchScreen;
