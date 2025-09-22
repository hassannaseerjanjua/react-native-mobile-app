import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
} from 'react-native';
import { AuthStackScreen } from '../../../types/navigation.types';
import CustomButton from '../../../components/global/Custombutton';
import { createStyles } from './style';

interface SignInProps extends AuthStackScreen<'SignIn'> {}

const SignIn: React.FC<SignInProps> = ({ navigation }) => {
  const styles = createStyles();
  const [activeTab, setActiveTab] = useState<'phone' | 'email'>('phone');
  const [phoneValue, setPhoneValue] = useState('');
  const [emailValue, setEmailValue] = useState('');

  const handleSignIn = () => {
    console.log('Sign in pressed');
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.logoContainer}>
        <Image
          source={require('../../../assets/images/blueLogo.png')}
          style={styles.logo}
        />
      </View>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Sign In</Text>
        <Text style={styles.subtitle}>Welcome back, you've been missed</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'phone' && styles.activeTab]}
          onPress={() => setActiveTab('phone')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'phone' && styles.activeTabText,
            ]}
          >
            Phone
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'email' && styles.activeTab]}
          onPress={() => setActiveTab('email')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'email' && styles.activeTabText,
            ]}
          >
            Email
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formContainer}>
        {activeTab === 'phone' ? (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              value={phoneValue}
              onChangeText={setPhoneValue}
              keyboardType="phone-pad"
            />
          </View>
        ) : (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              value={emailValue}
              onChangeText={setEmailValue}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        )}

        <CustomButton title="Sign In" type="primary" onPress={handleSignIn} />
      </View>
      <Text style={styles.linkContainer}>
        Don't have an account?{' '}
        <Text style={styles.link} onPress={() => navigation.navigate('SignUp')}>
          Sign Up
        </Text>
      </Text>
    </ScrollView>
  );
};

export default SignIn;
