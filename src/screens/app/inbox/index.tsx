import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import ParentView from '../../../components/app/ParentView';
import HomeHeader from '../../../components/global/HomeHeader';
import useStyles from './style';
import {
  GiftIcon,
  RoundedBackIcon,
  SmsTrackingIcon,
} from '../../../assets/icons';
import { LinearGradient } from 'react-native-linear-gradient';
import AppBottomSheet from '../../../components/global/AppBottomSheet';
import CustomButton from '../../../components/global/Custombutton';
import { useNavigation } from '@react-navigation/native';

interface OutboxItemProps {
  name: string;
  time: string;
  place: string;
  ProfileImage: any;
  image: any;
}
const outBoxes: OutboxItemProps[] = [
  {
    name: 'Mohammed Almosilih',
    ProfileImage: require('../../../assets/images/Profile-image.png'),
    time: '14 hours ago',
    place: 'Ecleel cafe',
    image: require('../../../assets/images/outbox-image-1.png'),
  },
  {
    name: 'Mohammed Almosilih',
    ProfileImage: require('../../../assets/images/Profile-image.png'),
    time: '14 hours ago',
    place: 'Ecleel cafe',
    image: require('../../../assets/images/outbox-image-1.png'),
  },
  {
    name: 'Mohammed Almosilih',
    ProfileImage: require('../../../assets/images/Profile-image.png'),
    time: '14 hours ago',
    place: 'Ecleel cafe',
    image: require('../../../assets/images/outbox-image-1.png'),
  },
];
const Inbox: React.FC = () => {
  const { styles, theme } = useStyles();
  const navigation = useNavigation();
  const [openBottomSheet, setOpenBottomSheet] = useState(false);
  return (
    <LinearGradient
      colors={[theme.colors.GRADIENT_COLOR, theme.colors.BACKGROUND]}
      start={{ x: 0, y: 0 }}
      style={{ flex: 1 }}
      end={{ x: 0, y: 0.3 }}
    >
      <ParentView style={{ backgroundColor: '' }}>
        <HomeHeader showBackButton title="Inbox" showSearchBar />
        <ScrollView style={{ paddingVertical: theme.sizes.PADDING * 0.5 }}>
          {outBoxes.map((item, index) => (
            <InboxItem
              isLast={index === outBoxes.length - 1}
              key={index}
              OutBox={item}
              onClick={() => setOpenBottomSheet(true)}
            />
          ))}
        </ScrollView>
        <AppBottomSheet
          blurAmount={100}
          isOpen={openBottomSheet}
          fullHeight
          snapPoints={['20%']}
          onClose={() => setOpenBottomSheet(false)}
        >
          <View style={styles.bottomSheet}>
            <CustomButton title="Pick Up" />
            <CustomButton
              title="Delivery"
              type="secondary"
              onPress={() => navigation.navigate('LocationSelection' as never)}
              buttonStyle={{ backgroundColor: theme.colors.WHITE }}
            />
          </View>
        </AppBottomSheet>
      </ParentView>
    </LinearGradient>
  );
};
const InboxItem = ({
  OutBox,
  isLast,
  onClick,
}: {
  OutBox: OutboxItemProps;
  isLast: boolean;
  onClick?: () => void;
}) => {
  const { styles, theme } = useStyles();
  return (
    <TouchableOpacity onPress={onClick}>






      <View
        style={{
          ...styles.inboxTop,
          borderBottomWidth: isLast ? 0 : 0.7,
          borderBottomColor: theme.colors.BORDER_COLOR,
        }}
      >
        <View
          style={{
            ...styles.row,
            alignItems: 'flex-start',
          }}
        >
          <Image style={styles.inboxProfile} source={OutBox.ProfileImage} />
          <View style={{ flex: 1 }}>




            <View
              style={{
                display: 'flex',
                // backgroundColor: theme.colors.RED,
                flexDirection: 'column',

















                justifyContent: 'space-between',
                paddingVertical: theme.sizes.PADDING * 0.26,
                rowGap: theme.sizes.PADDING * 0.26,
              }}
            >
              <View
                style={{
                  flex: 1,

                  ...styles.row,
                  justifyContent: 'space-between',
                }}
              >
                <Text>{OutBox.name}</Text>



                <Text
                  style={{
                    // backgroundColor: theme.colors.WHITE,
                    fontSize: theme.sizes.FONTSIZE,

                  }}
                >
                  {OutBox.time}
                </Text>

              </View>
              <View
                style={{
                  flex: 1,
                  ...styles.row,
                  justifyContent: 'space-between',
                }}
              >
                <View
                  style={{
                    ...styles.row,
                  }}
                >
                  <GiftIcon
                    height={theme.sizes.FONTSIZE}
                    width={theme.sizes.FONTSIZE}
                  />
                  <Text
                    style={{
                      fontSize: theme.sizes.FONTSIZE,
                      color: theme.colors.SECONDARY_TEXT,
                    }}
                  >
                    {OutBox.place}
                  </Text>
                  <RoundedBackIcon />
                </View>
                <SmsTrackingIcon />
              </View>
            </View>
            <View
              style={{
                paddingVertical: theme.sizes.PADDING * 0.6,
              }}
            >
              <Image source={OutBox.image} style={styles.inboxImage} />
              <View style={styles.inboxImageBottom}>
                <Text>Blue De Channel</Text>
                <View style={styles.numCircle}>
                  <Text style={styles.numText}>2</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default Inbox;

const styles = StyleSheet.create({});