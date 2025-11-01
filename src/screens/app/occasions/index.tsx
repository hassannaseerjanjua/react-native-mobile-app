import React from 'react';
import { View, StatusBar, FlatList } from 'react-native';
import useStyles from './style.ts';
import { useNavigation } from '@react-navigation/native';
import { Text } from '../../../utils/elements';
import { useLocaleStore } from '../../../store/reducer/locale';
import HomeHeader from '../../../components/global/HomeHeader.tsx';
import TabItem from '../../../components/global/TabItem.tsx';
import CustomButton from '../../../components/global/Custombutton.tsx';
import { SvgAddGroup, SvgAddOccasion } from '../../../assets/icons';

const OccasionsScreen: React.FC = () => {
  const { styles, theme } = useStyles();
  const { getString } = useLocaleStore();
  const navigation = useNavigation();

  const mockOccasions = [
    {
      id: 1,
      title: getString('OCC_BIRTHDAY'),
      image: require('../../../assets/images/birthday.png'),
    },
    {
      id: 2,
      title: getString('OCC_ANNIVERSARY'),
      image: require('../../../assets/images/anniversary.png'),
    },
  ];
  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor={theme.colors.BACKGROUND}
        barStyle="dark-content"
      />
      <HomeHeader
        title={getString('OCC_OCCASIONS')}
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />

      <FlatList
        data={mockOccasions}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.content}
        renderItem={({ item }: { item: (typeof mockOccasions)[0] }) => (
          <TabItem
            isGroupImage={item.image}
            title={item.title}
            onPress={() => {}}
            TabItemStyles={styles.TabItem}
          />
        )}
      />
      <View style={styles.buttonContainer}>
        <CustomButton
          title={getString('OCC_CREATE_OCCASION')}
          type="primary"
          icon={<SvgAddOccasion />}
          onPress={() => {
            // Handle create occasion
          }}
        />
      </View>
    </View>
  );
};

export default OccasionsScreen;
