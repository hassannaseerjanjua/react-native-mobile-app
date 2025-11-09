import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useState } from 'react';
import useStyles from './style';
import HomeHeader from '../../../components/global/HomeHeader';
import { useNavigation } from '@react-navigation/native';
import { CameraIcon } from '../../../assets/icons';
import { scaleWithMax } from '../../../utils';
import CustomButton from '../../../components/global/Custombutton';
import ParentView from '../../../components/app/ParentView';

const GiftMessage: React.FC = () => {
  const { styles, theme } = useStyles();
  const [message, setMessage] = useState('');
  const navigation = useNavigation();
  const GiftFilter = require('../../../assets/images/gift-filter.png');
  return (
    <ParentView>
      {/* <View style={styles.container}> */}
      <StatusBar
        backgroundColor={theme.colors.BACKGROUND}
        barStyle="dark-content"
      />
      <HomeHeader
        title={'Gift Message'}
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />
      <View
        style={{
          paddingHorizontal: theme.sizes.PADDING,
          position: 'relative',
          flex: 1,
        }}
      >
        <View
          style={{
            height: theme.sizes.HEIGHT * 0.55,
            position: 'relative',
          }}
        >
          <View style={styles.inputWrapper}>
            <TextInput
              multiline
              style={styles.textInput}
              placeholderTextColor={'#CCCCCC'}
              placeholder="Type Text..."
            />
          </View>
          <CameraIcon
            style={{
              position: 'absolute',
              bottom: scaleWithMax(20, 25),
              right: scaleWithMax(20, 25),
            }}
          />
        </View>
        <Text
          style={{
            ...theme.globalStyles.TEXT_STYLE_SEMIBOLD,
            fontSize: theme.sizes.FONTSIZE_MED_HIGH,
          }}
        >
          Gift Filter
        </Text>
        <View
          style={{
            height: theme.sizes.HEIGHT * 0.2,
            marginVertical: theme.sizes.PADDING * 0.5,
          }}
        >
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.ImageContainer}>
              <Image style={styles.FilterImage} source={GiftFilter} />
            </View>
            <View style={styles.ImageContainer}>
              <Image style={styles.FilterImage} source={GiftFilter} />
            </View>
            <View style={styles.ImageContainer}>
              <Image style={styles.FilterImage} source={GiftFilter} />
            </View>
          </ScrollView>
        </View>
        <CustomButton
          title="Skip"
          onPress={() => navigation.navigate('CheckOut' as never)}
        />
      </View>
      {/* </View> */}
    </ParentView>
  );
};

export default GiftMessage;

const styles = StyleSheet.create({});
