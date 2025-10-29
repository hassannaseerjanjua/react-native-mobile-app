import React from 'react';
import { View, StatusBar } from 'react-native';
import useStyles from './style.ts';
import { useNavigation } from '@react-navigation/native';
import { Text } from '../../../utils/elements';
import { useLocaleStore } from '../../../store/reducer/locale';

const OccasionsScreen: React.FC = () => {
  const { styles, theme } = useStyles();
  const { getString } = useLocaleStore();
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor={theme.colors.BACKGROUND}
        barStyle="dark-content"
      />

      <View style={styles.content}>
        <Text style={styles.title}>{getString('OCC_OCCASIONS')}</Text>
      </View>
    </View>
  );
};

export default OccasionsScreen;
