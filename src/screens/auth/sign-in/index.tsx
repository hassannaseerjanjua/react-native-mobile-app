import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Formik } from 'formik';
import { AuthStackScreen } from '../../../types/navigation.types';
import CustomButton from '../../../components/global/Custombutton';
import InputField from '../../../components/global/InputField';
import AuthLayout from '../../../components/app/AuthLayout';
import AppBottomSheet from '../../../components/global/AppBottomSheet';
import { SvgEmail, SvgPhone, SvgPhoneIcon } from '../../../assets/icons';
import { scaleWithMax } from '../../../utils';
import { createSignInSchema } from '../../../utils/validationSchemas';
import api from '../../../utils/api';
import apiEndpoints from '../../../constants/api-endpoints';
import useStyles from './style';
import { login } from '../../../store/reducer/auth';
import { useDispatch } from 'react-redux';
import { User } from '../../../types';
import { useLocaleStore } from '../../../store/reducer/locale';

interface SignInProps extends AuthStackScreen<'SignIn'> {}

const SignIn: React.FC<SignInProps> = ({ navigation }) => {
  const { styles, theme } = useStyles();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState<'Phone' | 'Email'>('Phone');
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string>('');
  const [currentFormValues, setCurrentFormValues] = useState({
    phone: '',
    email: '',
  });

  const { getString } = useLocaleStore();

  const validationSchema = useMemo(
    () => createSignInSchema(activeTab, getString as (key: any) => string),
    [activeTab, getString],
  );
  const handleSignIn = async (
    values: typeof currentFormValues,
    formik: any,
  ) => {
    // Bypass the API call, Dev purposes only.
    if (values.phone === '555555555' || values.email === 'dev@gmail.com') {
      console.log(values);
      const devUser: User = {
        UserId: 0,
        FullNameEn: 'Dev User',
        FullNameAr: null,
        UserName: 'dev',
        Email: 'dev@gmail.com',
        Password: null,
        DateOfBirth: null,
        GenderId: null,
        ProfileUrl: null,
        Status: 1,
        PhoneNo: '555555555',
        CreatedOn: new Date().toISOString(),
        CreatedBy: 0,
        ModifiedOn: null,
        ModifiedBy: null,
        CityId: 0,
        City: null,
      };
      dispatch(login(devUser));
    }

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
      setIsLoading(true);
      setApiError(''); // Clear previous API errors
      try {
        const response = await api.post(apiEndpoints.SIGNIN, {
          PhoneNo: values.phone,
          Email: values.email,
        });

        if (response.success) {
          setCurrentFormValues(values);
          setIsBottomSheetOpen(true); // ✅ open only after API success
        } else {
          // Capture the error message from the API response
          setApiError(response.error || 'An error occurred');
        }
      } catch (error) {
        console.error('Sign in error', error);
        setApiError('Network error. Please try again.');
      } finally {
        setTimeout(() => {
          setIsLoading(false);
        }, 1000);
      }
    }
  };

  const handleConfirmAndNavigate = () => {
    setIsBottomSheetOpen(false);
    navigation.navigate('OtpVerification', {
      phone: currentFormValues.phone,
      email: currentFormValues.email,
      signIn: true,
    });
  };

  return (
    <>
      <AuthLayout
        onBackPress={() => navigation.goBack()}
        title={getString('AU_SIGN_IN_HEADING')}
        backButton={false}
        subtitle={getString('AU_WELCOME_BACK')}
      >
        <View style={styles.tabContainer}>
          {['Phone', 'Email'].map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => {
                setActiveTab(tab as 'Phone' | 'Email');
                setApiError(''); // Clear API error when switching tabs
              }}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.activeTabText,
                ]}
              >
                {tab === 'Phone'
                  ? getString('AU_PHONE')
                  : getString('AU_EMAIL')}
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

            // Show API error if it exists, otherwise show Formik validation error
            const error = apiError || (formikError as string);

            return (
              <View style={styles.formContainer}>
                <View style={styles.inputContainer}>
                  <InputField
                    isPhone={isPhone}
                    icon={
                      isPhone ? (
                        <SvgPhone width={scaleWithMax(20, 25)} />
                      ) : (
                        <SvgEmail width={scaleWithMax(20, 25)} />
                      )
                    }
                    error={error as string}
                    fieldProps={{
                      placeholder: isPhone
                        ? getString('AU_PHONE_NUMBER')
                        : getString('AU_PL_EMAIL'),
                      keyboardType: isPhone ? 'phone-pad' : 'email-address',
                      autoCapitalize: 'none',
                      maxLength: isPhone ? 14 : 100,
                      value: isPhone ? values.phone : values.email,
                      onChangeText: isPhone
                        ? value => {
                            setApiError('');
                            setFieldValue('phone', value.replace('+966 ', ''));
                          }
                        : value => {
                            setApiError('');
                            handleChange('email')(value);
                          },
                    }}
                  />
                </View>

                <CustomButton
                  buttonStyle={styles.button}
                  title={getString('AU_SIGN_IN_BUTTON')}
                  type="primary"
                  onPress={handleSubmit}
                  loading={isLoading}
                />
              </View>
            );
          }}
        </Formik>

        <Text style={styles.linkContainer}>
          {getString('AU_DONT_HAVE_AN_ACCOUNT')}{' '}
          <Text
            style={styles.link}
            onPress={() => navigation.navigate('SignUp')}
          >
            {getString('AU_SIGN_UP_FOOTER')}
          </Text>
        </Text>
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
              ? getString('AU_IS_THIS_YOUR_CORRECT_PN')
              : getString('AU_IS_THIS_YOUR_CORRECT_EMAIL')}
          </Text>

          <Text style={styles.bottomSheetNumber}>
            {activeTab === 'Phone'
              ? `+966 ${currentFormValues.phone}`
              : currentFormValues.email}
          </Text>

          <CustomButton
            disabled={!isBottomSheetOpen}
            title={
              activeTab === 'Phone'
                ? getString('AU_SEND_CODE_BY_SMS')
                : getString('AU_SEND_CODE_BY_EMAIL')
            }
            type="primary"
            buttonStyle={{ marginBottom: scaleWithMax(15, 20) }}
            onPress={handleConfirmAndNavigate}
          />

          <CustomButton
            disabled={!isBottomSheetOpen}
            title={getString('AU_NO_I_WANT_TO_CHANGE')}
            type="secondary"
            onPress={() => setIsBottomSheetOpen(false)}
          />
        </View>
      </AppBottomSheet>
    </>
  );
};

export default SignIn;
