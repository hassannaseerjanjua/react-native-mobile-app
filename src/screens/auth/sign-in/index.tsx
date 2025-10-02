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
  const [currentFormValues, setCurrentFormValues] = useState({
    phone: '',
    email: '',
  });

  const { getString } = useLocaleStore();

  const validationSchema = createSignInSchema(activeTab);
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
      try {
        const response = await api.post(apiEndpoints.SIGNIN, {
          PhoneNo: values.phone,
          Email: values.email,
        });

        if (response.success) {
          setCurrentFormValues(values);
          setIsBottomSheetOpen(true); // ✅ open only after API success
        }
      } catch (error) {
        console.error('Sign in error', error);
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
        title="Sign In"
        backButton={false}
        subtitle={getString('WELCOME_BACK')}
      >
        <View style={styles.tabContainer}>
          {['Phone', 'Email'].map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab as 'Phone' | 'Email')}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.activeTabText,
                ]}
              >
                {tab}
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
            const error = isPhone
              ? errors.phone && touched.phone && errors.phone
              : errors.email && touched.email && errors.email;

            return (
              <View style={styles.formContainer}>
                <View style={styles.inputContainer}>
                  <InputField
                    icon={
                      isPhone ? (
                        <SvgPhone width={scaleWithMax(20, 25)} />
                      ) : (
                        <SvgEmail width={scaleWithMax(20, 25)} />
                      )
                    }
                    error={error as string}
                    fieldProps={{
                      placeholder: isPhone ? 'Phone Number' : 'Email Address',
                      keyboardType: isPhone ? 'phone-pad' : 'email-address',
                      autoCapitalize: isPhone ? undefined : 'none',
                      maxLength: isPhone ? 14 : 100,
                      value: isPhone ? `+966 ${values.phone}` : values.email,
                      onChangeText: isPhone
                        ? value =>
                            setFieldValue('phone', value.replace('+966 ', ''))
                        : handleChange('email'),
                    }}
                  />
                </View>

                <CustomButton
                  buttonStyle={styles.button}
                  title="Sign In"
                  type="primary"
                  onPress={handleSubmit}
                />
              </View>
            );
          }}
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
            buttonStyle={{ marginBottom: scaleWithMax(15, 20) }}
            onPress={handleConfirmAndNavigate}
          />

          <CustomButton
            title="No, I want to change it"
            type="secondary"
            onPress={() => setIsBottomSheetOpen(false)}
          />
        </View>
      </AppBottomSheet>
    </>
  );
};

export default SignIn;
