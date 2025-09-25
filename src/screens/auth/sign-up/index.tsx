import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { AuthStackScreen } from '../../../types/navigation.types';
import CustomButton from '../../../components/global/Custombutton';
import useStyles from './style';
import InputField from '../../../components/global/InputField';
import Header from '../../../components/global/Header';
import api from '../../../utils/api';
import apiEndpoints from '../../../constants/api-endpoints';
import {
  SvgEmail,
  SvgLocationPin,
  SvgLogoBlue,
  SvgPhone,
  SvgPhoneIcon,
  SvgUser,
  SvgUsername,
} from '../../../assets/icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { dynamicArrayItem, scaleWithMax, toOption } from '../../../utils';
import { City } from '../../../types';
import DropdownField from '../../../components/global/DropdownField';
import useGetApi from '../../../hooks/useGetApi';
import AuthLayout from '../../../components/app/AuthLayout';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppBottomSheet from '../../../components/global/AppBottomSheet';
import { Formik } from 'formik';
import * as Yup from 'yup';

interface SignUpProps extends AuthStackScreen<'SignUp'> {}

const SignUp: React.FC<SignUpProps> = ({ navigation }) => {
  const { styles, theme } = useStyles();
  const [currentStep, setCurrentStep] = useState(1);
  const [areaSearch, setAreaSearch] = useState('');
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    city: '',
    phoneNumber: '',
    email: '',
  });

  const citiesApi = useGetApi<City[]>(apiEndpoints.GET_CITY_LISTING, {
    transformData: data => data.Data.cities,
  });

  // Dynamic validation schema based on current step
  const validationSchema = useMemo(() => {
    return Yup.object().shape({
      fullName:
        currentStep === 1
          ? Yup.string()
              .trim()
              .required('Full name is required')
              .min(3, 'Full name must be at least 3 characters')
              .max(50, 'Full name must be less than 50 characters')
          : Yup.string().optional(),
      username:
        currentStep === 1
          ? Yup.string()
              .trim()
              .required('Username is required')
              .min(3, 'Username must be at least 3 characters')
              .max(50, 'Username must be less than 50 characters')
          : Yup.string().optional(),
      city:
        currentStep === 2
          ? Yup.string().required('City is required')
          : Yup.string().optional(),
      phoneNumber:
        currentStep === 3
          ? Yup.string()
              .trim()
              .required('Phone number is required')
              .matches(/^5/, 'Phone number must start with 5x-xxx-xxxx')
              .matches(/^[0-9]+$/, 'Phone number must contain only digits')
              .length(9, 'Phone number must be 9 digits')
          : Yup.string().optional(),
      email:
        currentStep === 3
          ? Yup.string()
              .trim()
              .email('Invalid email address')
              .required('Email address is required')
          : Yup.string().optional(),
    });
  }, [currentStep]);

  const handleNext = async (formik: any) => {
    try {
      // Set touched fields for current step before validation
      const touchedFields = {
        fullName: currentStep === 1,
        username: currentStep === 1,
        city: currentStep === 2,
        phoneNumber: currentStep === 3,
        email: currentStep === 3,
      };

      await formik.setTouched(touchedFields);

      // Validate the form
      const errors = await formik.validateForm();

      // Check if there are validation errors for current step fields
      const currentStepFields = Object.keys(touchedFields).filter(
        key => touchedFields[key as keyof typeof touchedFields],
      );
      const hasCurrentStepErrors = currentStepFields.some(
        field => errors[field],
      );

      if (!hasCurrentStepErrors) {
        if (currentStep < 3) {
          setCurrentStep(currentStep + 1);
        } else {
          setIsBottomSheetOpen(true);
        }
      }
    } catch (error) {
      console.log('Validation error:', error);
    }
  };

  const handleSignUp = () => {
    console.log('Sign up data:', formData);
    setIsBottomSheetOpen(false);
    // Handle final sign up logic here
    navigation.navigate('OtpVerification', {
      email: formData.email,
      phone: formData.phoneNumber,
    });
  };

  const updateFormData = (field: string, value: string, formik?: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formik) {
      formik.setFieldValue(field, value);
    }
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressSubtitle}>
          {currentStep === 1 && 'Personal Information'}
          {currentStep === 2 && 'City'}
          {currentStep === 3 && 'Contact Information'}
        </Text>
        <Text style={styles.progressText}>Step {currentStep} of 3</Text>
      </View>
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${(currentStep / 3) * 100}%` },
          ]}
        />
      </View>
    </View>
  );

  return (
    <>
      <AuthLayout
        onBackPress={() => {
          if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
            return;
          }
          navigation.goBack();
        }}
        title={
          currentStep === 1
            ? "Let's start with Name & Username"
            : currentStep === 2
            ? 'Select Your City'
            : currentStep === 3
            ? 'Phone Number & Email'
            : ''
        }
      >
        <Formik
          initialValues={formData}
          validationSchema={validationSchema}
          onSubmit={() => {}}
          enableReinitialize={true}
        >
          {formik => (
            <>
              {renderProgressBar()}
              <StepContent
                currentStep={currentStep}
                formData={formData}
                updateFormData={updateFormData}
                styles={styles}
                citiesApi={citiesApi}
                areaSearch={areaSearch}
                setAreaSearch={setAreaSearch}
                formik={formik}
              />

              <View style={styles.buttonContainer}>
                <CustomButton
                  title={currentStep === 3 ? 'Sign Up' : 'Next'}
                  type="primary"
                  onPress={() => handleNext(formik)}
                />
              </View>
            </>
          )}
        </Formik>
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
            <SvgPhoneIcon width={scaleWithMax(48, 55)} />
          </View>
          <Text style={styles.bottomSheetTitle}>
            Is this your correct phone number?
          </Text>
          <Text style={styles.bottomSheetNumber}>
            +966 {formData.phoneNumber}
          </Text>
          <CustomButton
            title="Yes, send code by SMS"
            type="primary"
            buttonStyle={{
              marginBottom: scaleWithMax(15, 20),
            }}
            onPress={handleSignUp}
          />
          <CustomButton
            title="No, I want to change it"
            type="secondary"
            onPress={handleSignUp}
          />
        </View>
      </AppBottomSheet>
    </>
  );
};

export default SignUp;

interface StepContentProps {
  currentStep: number;
  formData: any;
  updateFormData: (field: string, value: string, formik?: any) => void;
  styles: any;
  citiesApi: any;
  areaSearch: string;
  setAreaSearch: (value: string) => void;
  formik: any;
}

const StepContent: React.FC<StepContentProps> = ({
  currentStep,
  formData,
  updateFormData,
  styles,
  citiesApi,
  areaSearch,
  setAreaSearch,
  formik,
}) => {
  const options = toOption<City>(citiesApi.data || [], 'CityName', 'CityID');
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(areaSearch.toLowerCase()),
  );
  const [selectedOption, setSelectedOption] = useState(
    options?.find(option => option.value === formData.city) || null,
  );

  switch (currentStep) {
    case 1:
      return (
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <InputField
              icon={<SvgUser width={scaleWithMax(20, 25)} />}
              error={
                formik.touched.fullName && formik.errors.fullName
                  ? formik.errors.fullName
                  : undefined
              }
              fieldProps={{
                placeholder: 'Full Name',
                value: formData.fullName,
                onChangeText: value =>
                  updateFormData('fullName', value, formik),
                autoCapitalize: 'words',
              }}
            />
          </View>

          <View style={styles.inputContainer}>
            <InputField
              icon={<SvgUsername width={scaleWithMax(20, 25)} />}
              error={
                formik.touched.username && formik.errors.username
                  ? formik.errors.username
                  : undefined
              }
              fieldProps={{
                placeholder: 'Username',
                value: formData.username,
                onChangeText: value =>
                  updateFormData('username', value, formik),
                autoCapitalize: 'none',
              }}
            />
          </View>
        </View>
      );

    case 2:
      return (
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <DropdownField
              isLoading={citiesApi.loading}
              label="Select City"
              selectedOption={selectedOption}
              icon={<SvgLocationPin width={scaleWithMax(20, 25)} />}
              options={filteredOptions}
              searchValue={areaSearch}
              onSearchChange={setAreaSearch}
              selectedValue={formData.city}
              onSelect={value => {
                setSelectedOption(value);
                updateFormData('city', value.value, formik);
              }}
              error={formik.touched.city && formik.errors.city}
            />
            {formik.touched.city && formik.errors.city && (
              <Text style={styles.errorText}>{formik.errors.city}</Text>
            )}
          </View>
        </View>
      );

    case 3:
      return (
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <InputField
              icon={<SvgPhone width={scaleWithMax(20, 25)} />}
              error={
                formik.touched.phoneNumber && formik.errors.phoneNumber
                  ? formik.errors.phoneNumber
                  : undefined
              }
              fieldProps={{
                placeholder: 'Phone Number',
                maxLength: 14,
                value: '+966 ' + formData.phoneNumber,
                onChangeText: value => {
                  if (value?.startsWith('+966 ')) {
                    updateFormData(
                      'phoneNumber',
                      value?.replaceAll('+966 ', ''),
                      formik,
                    );
                  }
                },
                keyboardType: 'phone-pad',
              }}
            />
          </View>
          <View style={styles.inputContainer}>
            <InputField
              icon={<SvgEmail width={scaleWithMax(20, 25)} />}
              error={
                formik.touched.email && formik.errors.email
                  ? formik.errors.email
                  : undefined
              }
              fieldProps={{
                placeholder: 'Email',
                value: formData.email,
                onChangeText: value => updateFormData('email', value, formik),
                keyboardType: 'email-address',
                autoCapitalize: 'none',
              }}
            />
          </View>
        </View>
      );

    default:
      return null;
  }
};
