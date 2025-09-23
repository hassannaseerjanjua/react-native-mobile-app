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
import useStyles from './style';
import InputField from '../../../components/global/InputField';
import { Formik } from 'formik';

interface SignInProps extends AuthStackScreen<'SignIn'> {}

const SignIn: React.FC<SignInProps> = ({ navigation }) => {
  const { styles } = useStyles();
  const [activeTab, setActiveTab] = useState<'Phone' | 'Email'>('Phone');

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
      <Formik initialValues={{ phone: '', email: '' }} onSubmit={handleSignIn}>
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
        <Text style={styles.link} onPress={() => navigation.navigate('SignUp')}>
          Sign Up
        </Text>
      </Text>
    </ScrollView>
  );
};

export default SignIn;
