import { Image, ScrollView, StatusBar, TextInput, View } from 'react-native';
import React, { useState } from 'react';
import useStyles from './style';
import HomeHeader from '../../../components/global/HomeHeader';
import { CameraIcon } from '../../../assets/icons';
import CustomButton from '../../../components/global/Custombutton';
import ParentView from '../../../components/app/ParentView';
import { Text } from '../../../utils/elements';
import { AppStackScreen } from '../../../types/navigation.types';

const GiftMessage: React.FC<AppStackScreen<'GiftMessage'>> = ({
  route,
  navigation,
}) => {
  const { styles, theme } = useStyles();
  const [message, setMessage] = useState('');
  const { product } = route.params;
  const GiftFilter = require('../../../assets/images/gift-filter.png');
  return (
    <ParentView style={styles.container}>
      <StatusBar
        backgroundColor={theme.colors.BACKGROUND}
        barStyle="dark-content"
      />
      <HomeHeader
        title={'Gift Message'}
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />
      <View style={styles.content}>
        <View style={styles.body}>
          <View style={styles.messageContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                multiline
                style={styles.textInput}
                value={message}
                onChangeText={setMessage}
                placeholderTextColor={theme.colors.SECONDARY_TEXT}
                placeholder="Type Text..."
              />
            </View>
            <CameraIcon style={styles.cameraIcon} />
          </View>
          <Text style={styles.sectionTitle}>Gift Filter</Text>
          <View style={styles.filtersWrapper}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filtersScrollContent}
            >
              {[...Array(3)].map((item, index) => (
                <View key={index} style={styles.imageContainer}>
                  <Image
                    style={styles.filterImage}
                    source={GiftFilter}
                    resizeMode="cover"
                  />
                </View>
              ))}
            </ScrollView>
          </View>
          <View style={styles.footer}>
            <CustomButton
              title="Skip"
              onPress={() => {
                navigation.navigate('CheckOut', { product });
              }}
            />
          </View>
        </View>
      </View>
    </ParentView>
  );
};

export default GiftMessage;
