import React from 'react';
import { View, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = {
  backgroundColor: string;
  isDark?: boolean;
};

const StatusBarComponent = ({ backgroundColor, isDark }: Props) => (
  <View
    style={{
      height: StatusBar.currentHeight,
      backgroundColor,
    }}
  >
    <SafeAreaView>
      <StatusBar
        translucent
        backgroundColor={backgroundColor}
        barStyle={isDark ? 'light-content' : 'dark-content'}
      />
    </SafeAreaView>
  </View>
);

export default StatusBarComponent;
