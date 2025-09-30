import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { AppStackScreen } from '../../../types/navigation.types';
import Header from '../../../components/global/Header';
import useStyles from './style';
import {
  SvgCatchGift,
  SvgDummyBanner,
  SvgGiftOneGetOne,
  SvgInboxGift,
  SvgOutboxGift,
  SvgSendAGift,
} from '../../../assets/icons';

const HomeScreen: React.FC<AppStackScreen<'Home'>> = ({ navigation }) => {
  const { styles, theme } = useStyles();

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor={theme.colors.BACKGROUND}
        barStyle="dark-content"
      />
      <Header isLogo isSearch showBackButton={false} spaceTaken={false} />

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.welcomeText}>
          Welcome, <Text style={styles.userName}>Mohammed</Text>
        </Text>

        <SvgDummyBanner />
        <Text style={styles.sectionTitle}>What are you looking for?</Text>

        <View style={styles.optionsWrapper}>
          <TouchableOpacity style={[styles.optionCard, { flex: 1.2 }]}>
            <SvgGiftOneGetOne />
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>
                Gift One <Text style={styles.optionTitlePrimary}>Get One</Text>
              </Text>
              <Text numberOfLines={3} style={styles.optionDesc}>
                Send a gift and score a bonus treat for yourself.
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionCard}>
            <SvgSendAGift />
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Send a Gift</Text>
              <Text style={styles.optionDesc}>
                Send & receive gifts from your friends and loved ones.
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.optionCard}>
          <Image
            source={require('../../../assets/images/catchIcon.png')}
            style={{ width: 32, height: 32, resizeMode: 'contain' }}
          />
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>
              Catch{'\n'}
              <Text style={styles.optionTitlePrimary}>
                Instant gifts, limited time.
              </Text>
            </Text>
            <Text style={styles.optionDesc}>
              Be the fastest to claim surprise drops before they disappear.
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.optionsWrapper}>
          <TouchableOpacity style={styles.optionCard}>
            <SvgInboxGift />
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Inbox</Text>
              <Text style={styles.optionDesc}>Received gifts</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionCard}>
            <SvgOutboxGift />
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Outbox</Text>
              <Text style={styles.optionDesc}>Sent gifts</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default HomeScreen;
