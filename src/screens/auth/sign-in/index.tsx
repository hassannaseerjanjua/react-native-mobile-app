import React, { useState, useMemo } from 'react';
import { View, TouchableOpacity, Platform } from 'react-native';
import { Formik } from 'formik';
import { AuthStackScreen } from '../../../types/navigation.types';
import CustomButton from '../../../components/global/Custombutton';
import InputField from '../../../components/global/InputField';
import AuthLayout from '../../../components/app/AuthLayout';
import AppBottomSheet from '../../../components/global/AppBottomSheet';
import {
  SvgEmailStroke,
  SvgPhoneStroke,
  SvgPhoneIcon,
} from '../../../assets/icons';
import { scaleWithMax, formatPhoneWithCountryCode } from '../../../utils';
import { createSignInSchema } from '../../../utils/validationSchemas';
import api from '../../../utils/api';
import apiEndpoints from '../../../constants/api-endpoints';
import useStyles from './style';
import { useDispatch } from 'react-redux';
import { Text } from '../../../utils/elements';
import notify from '../../../utils/notify';

interface SignInProps extends AuthStackScreen<'SignIn'> {}

const SignIn: React.FC<SignInProps> = ({ navigation }) => {
  const { styles, theme } = useStyles();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState<'Phone' | 'Email'>('Phone');
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [apiError, setApiError] = useState<string>('');
  const [currentFormValues, setCurrentFormValues] = useState({
    phone: '',
    email: '',
  });

  const validationSchema = useMemo(
    () => createSignInSchema(activeTab),
    [activeTab],
  );

  const handleSignIn = async (
    values: typeof currentFormValues,
    formik: any,
  ) => {
    if (isVerifying) return;
    const touched = {
      phone: activeTab === 'Phone',
      email: activeTab === 'Email',
    };
    await formik.setTouched(touched);

    const errors = await formik.validateForm();
    const hasErrors =
      (activeTab === 'Phone' && errors.phone) ||
      (activeTab === 'Email' && errors.email);

    if (!hasErrors) {
      setApiError('');
      setCurrentFormValues(values);
      setIsVerifying(true);

      try {
        const payload =
          activeTab === 'Phone'
            ? { PhoneNo: formatPhoneWithCountryCode(values.phone) }
            : { Email: values.email };

        const verifyResponse = await api.post(
          apiEndpoints.VERIFY_EMAIL_PHONE_SIGNIN,
          payload,
        );

        // For sign-in: if data EXISTS (user is registered), allow to proceed
        if (verifyResponse.success) {
          setIsBottomSheetOpen(true);
        } else {
          setApiError(getString('API_USER_NOT_FOUND'));
        }
      } catch (error) {
        notify.error(getString('AU_NETWORK_ERROR_PLEASE_TRY_AGAIN'));
      } finally {
        setIsVerifying(false);
      }
    }
  };

  const handleConfirmAndNavigate = async () => {
    setIsLoading(true);
    setApiError('');
    try {
      const payload =
        activeTab === 'Phone'
          ? { PhoneNo: formatPhoneWithCountryCode(currentFormValues.phone) }
          : { Email: currentFormValues.email };
      const response = await api.post(apiEndpoints.SIGNIN, payload);

      if (response.success) {
        setIsBottomSheetOpen(false);
        navigation.navigate('OtpVerification', {
          signIn: true,
          ...(activeTab === 'Phone'
            ? { phone: currentFormValues.phone }
            : { email: currentFormValues.email }),
        });
      } else {
        setIsBottomSheetOpen(false);
        setApiError(response.error || 'Something went wrong');
      }
    } catch (error) {
      setIsBottomSheetOpen(false);
      setApiError('Network error, please try again');
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    }
  };
  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');

    const part1 = digits.slice(0, 2);
    const part2 = digits.slice(2, 5);
    const part3 = digits.slice(5, 9);

    return [part1, part2, part3].filter(Boolean).join(' ');
  };
  return (
    <>
      <AuthLayout
        onBackPress={() => navigation.goBack()}
        title="Sign in to your account"
        // backButton={false}
        subtitle="Welcome back! Sign in to continue."
      >
        <View style={styles.tabContainer}>
          {['Phone', 'Email'].map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => {
                setActiveTab(tab as 'Phone' | 'Email');
                setApiError('');
              }}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.activeTabText,
                ]}
              >
                {tab === 'Phone' ? 'Phone' : 'Email'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Formik
          key={activeTab}
          initialValues={{ phone: '', email: '' }}
          validationSchema={validationSchema}
          onSubmit={handleSignIn}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            setFieldValue,
            handleSubmit,
          }) => {
            const isPhone = activeTab === 'Phone';
            const formikError = isPhone
              ? errors.phone && touched.phone && errors.phone
              : errors.email && touched.email && errors.email;

            const error = apiError || (formikError as string);

            return (
              <View style={styles.formContainer}>
                <View style={styles.inputContainer}>
                  <InputField
                    isPhone={isPhone}
                    icon={
                      isPhone ? (
                        <SvgPhoneStroke width={scaleWithMax(20, 25)} />
                      ) : (
                        <SvgEmailStroke width={scaleWithMax(20, 25)} />
                      )
                    }
                    error={error as string}
                    fieldProps={{
                      placeholder: isPhone
                        ? 'Phone number'
                        : 'Enter your email',
                      keyboardType: isPhone ? 'number-pad' : 'email-address',
                      autoCapitalize: 'none',
                      maxLength: isPhone ? 9 : 100,
                      value: isPhone ? values.phone : values.email,
                      onChangeText: isPhone
                        ? value => {
                            setApiError('');
                            const cleanValue = value;
                            setFieldValue('phone', cleanValue);
                          }
                        : value => {
                            setApiError('');
                            handleChange('email')(value);
                          },
                    }}
                    style={{
                      ...(Platform.OS === 'ios' &&
                        {
                          // paddingTop: theme.sizes.PADDING * 0.2,
                        }),
                    }}
                  />
                </View>

                <CustomButton
                  buttonStyle={styles.button}
                  title="Sign in"
                  type="primary"
                  onPress={handleSubmit}
                  loading={isVerifying}
                  disabled={isVerifying}
                />
              </View>
            );
          }}
        </Formik>

        <Text style={styles.linkContainer}>
          {"Don't have an account? "}
          <Text
            style={styles.link}
            onPress={() => navigation.navigate('SignUp')}
          >
            Sign up
          </Text>
        </Text>
      </AuthLayout>

      <AppBottomSheet
        blurAmount={100}
        blurType="light"
        height={theme.sizes.HEIGHT * 0.42}
        isOpen={isBottomSheetOpen}
        onClose={() => setIsBottomSheetOpen(false)}
      >
        <View style={styles.bottomSheetContainer}>
          <View style={styles.bottomSheetIconContainer}>
            {activeTab === 'Phone' ? (
              <SvgPhoneIcon width={scaleWithMax(48, 55)} />
            ) : (
              <SvgEmailStroke
                width={scaleWithMax(55, 55)}
                height={scaleWithMax(40, 40)}
              />
            )}
          </View>

          <Text style={styles.bottomSheetTitle}>
            {activeTab === 'Phone'
              ? 'Is this your correct phone number?'
              : 'Is this your correct email?'}
          </Text>

          <Text style={styles.bottomSheetNumber}>
            {activeTab === 'Phone'
              ? `\u200E+966 ${formatPhone(currentFormValues.phone)}`
              : `${currentFormValues.email}`}
          </Text>

          <CustomButton
            disabled={!isBottomSheetOpen || isLoading}
            title={
              activeTab === 'Phone' ? 'Send code by SMS' : 'Send code by email'
            }
            type="primary"
            buttonStyle={{ marginBottom: scaleWithMax(15, 20) }}
            onPress={handleConfirmAndNavigate}
            loading={isLoading}
          />

          <CustomButton
            disabled={!isBottomSheetOpen}
            title="No, I want to change"
            type="secondary"
            onPress={() => setIsBottomSheetOpen(false)}
          />
        </View>
      </AppBottomSheet>
    </>
  );
};

export default SignIn;
