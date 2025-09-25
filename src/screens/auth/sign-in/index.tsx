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
import {
  SvgEmail,
  SvgLogoBlue,
  SvgPhone,
  SvgPhoneIcon,
} from '../../../assets/icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { scaleWithMax } from '../../../utils';
import AuthLayout from '../../../components/app/AuthLayout';
import AppBottomSheet from '../../../components/global/AppBottomSheet';

interface SignInProps extends AuthStackScreen<'SignIn'> {}

const SignIn: React.FC<SignInProps> = ({ navigation }) => {
  const { styles, theme } = useStyles();
  const [activeTab, setActiveTab] = useState<'Phone' | 'Email'>('Phone');
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [currentFormValues, setCurrentFormValues] = useState({
    phone: '',
    email: '',
  });

  const handleSignIn = (values: { phone: string; email: string }) => {
    console.log('Sign in pressed', values);

    // Store the form values and show confirmation bottom sheet
    setCurrentFormValues(values);
    setIsBottomSheetOpen(true);
  };

  const handleConfirmAndNavigate = () => {
    setIsBottomSheetOpen(false);

    // Navigate to OTP verification with the appropriate parameter
    if (activeTab === 'Phone' && currentFormValues.phone) {
      navigation.navigate('OtpVerification', {
        phone: currentFormValues.phone,
      });
    } else if (activeTab === 'Email' && currentFormValues.email) {
      navigation.navigate('OtpVerification', {
        email: currentFormValues.email,
      });
    }
  };

  const handleChangeNumber = () => {
    setIsBottomSheetOpen(false);
  };

  return (
    <>
      <AuthLayout
        onBackPress={() => navigation.goBack()}
        title="Sign In"
        backButton={false}
        subtitle="Welcome back, you've been missed"
      >
        <>
          <View style={styles.tabContainer}>
            {['Phone', 'Email'].map((item: string) => (
              <TouchableOpacity
                key={item}
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
                      icon={<SvgPhone width={scaleWithMax(20, 25)} />}
                      fieldProps={{
                        placeholder: 'Phone Number',
                        value: '+966 ' + formik.values.phone,
                        onChangeText: value => {
                          if (value?.startsWith('+966 ')) {
                            formik.setFieldValue(
                              'phone',
                              value?.replaceAll('+966 ', ''),
                            );
                          }
                        },
                        keyboardType: 'phone-pad',
                      }}
                    />
                  </View>
                ) : (
                  <View style={styles.inputContainer}>
                    <InputField
                      icon={<SvgEmail width={scaleWithMax(20, 25)} />}
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
        </>
      </AuthLayout>
      <AppBottomSheet
        blurAmount={100}
        blurType="light"
        height={theme.sizes.HEIGHT * 0.45}
        isOpen={isBottomSheetOpen}
        onClose={() => setIsBottomSheetOpen(false)}
      >
        <View style={styles.bottomSheetContainer}>
          <View style={styles.bottomSheetIconContainer}>
            {activeTab === 'Phone' ? (
              <SvgPhoneIcon width={scaleWithMax(48, 55)} />
            ) : (
              <SvgEmail width={100} height={scaleWithMax(48, 55)} />
            )}
          </View>
          <Text style={styles.bottomSheetTitle}>
            {activeTab === 'Phone'
              ? 'Is this your correct phone number?'
              : 'Is this your correct email address?'}
          </Text>
          <Text style={styles.bottomSheetNumber}>
            {activeTab === 'Phone'
              ? `+966 ${currentFormValues.phone}`
              : currentFormValues.email}
          </Text>
          <CustomButton
            title={
              activeTab === 'Phone'
                ? 'Yes, send code by SMS'
                : 'Yes, send code by Email'
            }
            type="primary"
            buttonStyle={{
              marginBottom: scaleWithMax(15, 20),
            }}
            onPress={handleConfirmAndNavigate}
          />
          <CustomButton
            title="No, I want to change it"
            type="secondary"
            onPress={handleChangeNumber}
          />
        </View>
      </AppBottomSheet>
    </>
  );
};

export default SignIn;
