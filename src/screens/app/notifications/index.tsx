import React from 'react';
import { View, StatusBar } from 'react-native';
import useStyles from './style.ts';
import { useNavigation } from '@react-navigation/native';
import { Text } from '../../../utils/elements';

const NotificationsScreen: React.FC = () => {
  const { styles, theme } = useStyles();
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor={theme.colors.BACKGROUND}
        barStyle="dark-content"
      />

      <View style={styles.content}>
        <Text style={styles.title}>Notifications</Text>
      </View>
    </View>
  );
};

export default NotificationsScreen;
