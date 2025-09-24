import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  StatusBar,
} from 'react-native';
import { AuthStackScreen } from '../../../types/navigation.types';
import CustomButton from '../../../components/global/Custombutton';
import useStyles from './style';
import InputField from '../../../components/global/InputField';
import Header from '../../../components/global/Header';
import { Formik } from 'formik';
import { SvgLogoBlue } from '../../../assets/icons';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SignInProps extends AuthStackScreen<'SignIn'> {}

const SignIn: React.FC<SignInProps> = ({ navigation }) => {
  const { styles, theme } = useStyles();
  const [activeTab, setActiveTab] = useState<'Phone' | 'Email'>('Phone');

  const handleSignIn = (values: { phone: string; email: string }) => {
    console.log('Sign in pressed', values);

    // Navigate to OTP verification with the appropriate parameter
    if (activeTab === 'Phone' && values.phone) {
      navigation.navigate('OtpVerification', { phone: values.phone });
    } else if (activeTab === 'Email' && values.email) {
      navigation.navigate('OtpVerification', { email: values.email });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      <Header />
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.logoContainer}>
          <SvgLogoBlue width={theme.sizes.APP_LOGO} />
        </View>
        <View style={styles.headerContainer}>
          <Text style={styles.subtitle}>Welcome back, you've been missed</Text>
        </View>

        <View style={styles.tabContainer}>
          {['Phone', 'Email'].map((item: string) => (
            <TouchableOpacity
              style={[styles.tab, activeTab === item && styles.activeTab]}
              onPress={() => setActiveTab(item as 'Phone' | 'Email')}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === item && styles.activeTabText,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Formik
          initialValues={{ phone: '', email: '' }}
          onSubmit={handleSignIn}
        >
          {formik => (
            <View style={styles.formContainer}>
              {activeTab === 'Phone' ? (
                <View style={styles.inputContainer}>
                  <InputField
                    fieldProps={{
                      placeholder: 'Phone Number',
                      value: formik.values.phone,
                      onChangeText: formik.handleChange('phone'),
                      keyboardType: 'phone-pad',
                    }}
                  />
                </View>
              ) : (
                <View style={styles.inputContainer}>
                  <InputField
                    fieldProps={{
                      placeholder: 'Email Address',
                      value: formik.values.email,
                      onChangeText: formik.handleChange('email'),
                      keyboardType: 'email-address',
                      autoCapitalize: 'none',
                    }}
                  />
                </View>
              )}

              <CustomButton
                buttonStyle={styles.button}
                title="Sign In"
                type="primary"
                onPress={formik.handleSubmit}
              />
            </View>
          )}
        </Formik>

        <Text style={styles.linkContainer}>
          Don't have an account?{' '}
          <Text
            style={styles.link}
            onPress={() => navigation.navigate('SignUp')}
          >
            Sign Up
          </Text>
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignIn;
