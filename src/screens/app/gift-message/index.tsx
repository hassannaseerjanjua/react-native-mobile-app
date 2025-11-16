import { Image, ScrollView, StatusBar, TextInput, View } from 'react-native';
import React, { useState } from 'react';
import useStyles from './style';
import HomeHeader from '../../../components/global/HomeHeader';
import { CameraIcon } from '../../../assets/icons';
import CustomButton from '../../../components/global/Custombutton';
import ParentView from '../../../components/app/ParentView';
import { Text } from '../../../utils/elements';
import { AppStackScreen } from '../../../types/navigation.types';
import { useLocaleStore } from '../../../store/reducer/locale';

const GiftMessage: React.FC<AppStackScreen<'GiftMessage'>> = ({
  route,
  navigation,
}) => {
  const { styles, theme } = useStyles();
  const { getString } = useLocaleStore();
  const [message, setMessage] = useState('');
  const { product, addToCartPayload, friendUserId } = route.params as any;
  const GiftFilter = require('../../../assets/images/gift-filter.png');
  return (
    <ParentView style={styles.container}>
      <StatusBar
        backgroundColor={theme.colors.BACKGROUND}
        barStyle="dark-content"
      />
      <HomeHeader
        title={getString('GIFT_MESSAGE_TITLE')}
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
                placeholder={getString('GIFT_MESSAGE_PLACEHOLDER')}
              />
            </View>
            <CameraIcon style={styles.cameraIcon} />
          </View>
          <Text style={styles.sectionTitle}>
            {getString('GIFT_MESSAGE_FILTER')}
          </Text>
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
                navigation.navigate('CheckOut', {
                  product,
                  addToCartPayload,
                  friendUserId,
                });
              }}
            />
          </View>
        </View>
      </View>
    </ParentView>
  );
};

export default GiftMessage;
