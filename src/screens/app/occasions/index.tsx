import React from 'react';
import { View, Text, StatusBar } from 'react-native';
import Header from '../../../components/global/Header';
import useStyles from './style.ts';

const OccasionsScreen: React.FC = () => {
  const { styles, theme } = useStyles();

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor={theme.colors.BACKGROUND}
        barStyle="dark-content"
      />
      <Header isLogo isSearch showBackButton={false} spaceTaken={false} />

      <View style={styles.content}>
        <Text style={styles.title}>Occasions</Text>
      </View>
    </View>
  );
};

export default OccasionsScreen;
