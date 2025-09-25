import React, { useState, useMemo } from 'react';
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
import * as Yup from 'yup';
import api from '../../../utils/api';
import apiEndpoints from '../../../constants/api-endpoints';

interface SignInProps extends AuthStackScreen<'SignIn'> {}

const SignIn: React.FC<SignInProps> = ({ navigation }) => {
  const { styles, theme } = useStyles();
  const [activeTab, setActiveTab] = useState<'Phone' | 'Email'>('Phone');
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [currentFormValues, setCurrentFormValues] = useState({
    phone: '',
    email: '',
  });

  const handleTabChange = (tab: 'Phone' | 'Email') => {
    setActiveTab(tab);
  };

  const handleSignIn = async (
    values: { phone: string; email: string },
    formik: any,
  ) => {
    console.log('Sign in pressed', values);

    // Mark the active field as touched to show validation errors
    const touchedFields = {
      phone: activeTab === 'Phone',
      email: activeTab === 'Email',
    };

    await formik.setTouched(touchedFields);

    // Validate the form
    const errors = await formik.validateForm();

    // Check if there are validation errors for the active field
    const hasErrors =
      (activeTab === 'Phone' && errors.phone) ||
      (activeTab === 'Email' && errors.email);

    if (!hasErrors) {
      // Store the form values and show confirmation bottom sheet
      setCurrentFormValues(values);

      setIsBottomSheetOpen(true);
    }
  };

  const validationSchema = useMemo(() => {
    return Yup.object().shape({
      phone:
        activeTab === 'Phone'
          ? Yup.string()
              .trim()
              .required('Phone number is required')
              .matches(/^5/, 'Phone number must start with 5x-xxx-xxxx')
              .matches(/^[0-9]+$/, 'Phone number must contain only digits')
              .length(9, 'Phone number must be 9 digits')
          : Yup.string().optional(),
      email:
        activeTab === 'Email'
          ? Yup.string()
              .trim()
              .email('Invalid email address')
              .matches(
                /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
                'Enter a valid email address',
              )
              .required('Email address is required')
          : Yup.string().optional(),
    });
  }, [activeTab]);

  // Helper functions for cleaner validation logic
  const getFieldError = (fieldName: 'phone' | 'email', formik: any) => {
    const isActiveField =
      (fieldName === 'phone' && activeTab === 'Phone') ||
      (fieldName === 'email' && activeTab === 'Email');

    return isActiveField &&
      formik.touched[fieldName] &&
      formik.errors[fieldName]
      ? formik.errors[fieldName]
      : undefined;
  };

  const handleConfirmAndNavigate = async () => {
    setIsBottomSheetOpen(false);

    api
      .post(apiEndpoints.SIGNIN, {
        PhoneNo: currentFormValues.phone,
        Email: currentFormValues.email,
      })
      .then(response => {
        console.log('Sign in response', response);
        if (response.success) {
          navigation.navigate('OtpVerification', {
            phone: currentFormValues.phone,
            email: currentFormValues.email,
            signIn: true,
          });
        }
      })
      .catch(error => {
        console.log('Sign in error', error);
      });

    // Navigate to OTP verification with the appropriate parameter

    // if (activeTab === 'Phone' && currentFormValues.phone) {
    //   const response = await api.post(apiEndpoints.SIGNIN, {
    //     PhoneNo: currentFormValues.phone,
    //   });
    //   console.log('Sign in response', response);
    //   if (response.success) {
    //     navigation.navigate('OtpVerification', {
    //       phone: currentFormValues.phone,
    //     });
    //   }
    // } else if (activeTab === 'Email' && currentFormValues.email) {
    //   const response = await api.post(apiEndpoints.SIGNIN, {
    //     Email: currentFormValues.email,
    //   });
    //   console.log('Sign in response', response);
    //   if (response.success) {
    //     navigation.navigate('OtpVerification', {
    //       email: currentFormValues.email,
    //     });
    //   }
    // }
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
                onPress={() => handleTabChange(item as 'Phone' | 'Email')}
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
            key={activeTab} // Force reinitialize when tab changes
            initialValues={{ phone: '', email: '' }}
            onSubmit={(values, formikHelpers) =>
              handleSignIn(values, formikHelpers)
            }
            validationSchema={validationSchema}
          >
            {formik => (
              <View style={styles.formContainer}>
                {activeTab === 'Phone' ? (
                  <View style={styles.inputContainer}>
                    <InputField
                      icon={<SvgPhone width={scaleWithMax(20, 25)} />}
                      error={getFieldError('phone', formik)}
                      fieldProps={{
                        placeholder: 'Phone Number',
                        maxLength: 14,
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
                      error={getFieldError('email', formik)}
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
            onPress={() => {
              setIsBottomSheetOpen(false);
            }}
          />
        </View>
      </AppBottomSheet>
    </>
  );
};

export default SignIn;
