import React, { useState, useMemo } from 'react';
import { View, Text } from 'react-native';
import { AuthStackScreen } from '../../../types/navigation.types';
import CustomButton from '../../../components/global/Custombutton';
import useStyles from './style';
import InputField from '../../../components/global/InputField';
import api from '../../../utils/api';
import apiEndpoints from '../../../constants/api-endpoints';
import {
  SvgEmail,
  SvgLocationPin,
  SvgPhone,
  SvgPhoneIcon,
  SvgUser,
  SvgUsername,
} from '../../../assets/icons';
import { scaleWithMax, toOption } from '../../../utils';
import { City } from '../../../types';
import DropdownField from '../../../components/global/DropdownField';
import useGetApi from '../../../hooks/useGetApi';
import AuthLayout from '../../../components/app/AuthLayout';
import AppBottomSheet from '../../../components/global/AppBottomSheet';
import { Formik } from 'formik';
import { createSignUpSchema } from '../../../utils/validationSchemas';

interface SignUpProps extends AuthStackScreen<'SignUp'> {}

const SignUp: React.FC<SignUpProps> = ({ navigation }) => {
  const { styles, theme } = useStyles();
  const [currentStep, setCurrentStep] = useState(1);
  const [areaSearch, setAreaSearch] = useState('');
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    city: '',
    phoneNumber: '',
    email: '',
  });

  const [usernameApiError, setUsernameApiError] = useState<string | null>(null);

  const citiesApi = useGetApi<City[]>(apiEndpoints.GET_CITY_LISTING, {
    transformData: data => data.Data.cities,
  });

  const validationSchema = createSignUpSchema(currentStep);

  const handleNext = async (formik: any) => {
    try {
      const touchedFields = {
        fullName: currentStep === 1,
        username: currentStep === 1,
        city: currentStep === 2,
        phoneNumber: currentStep === 3,
        email: currentStep === 3,
      };

      await formik.setTouched(touchedFields);

      const errors = await formik.validateForm();

      const currentStepFields = Object.keys(touchedFields).filter(
        key => touchedFields[key as keyof typeof touchedFields],
      );
      const hasCurrentStepErrors = currentStepFields.some(
        field => errors[field],
      );

      if (!hasCurrentStepErrors) {
        if (currentStep < 3) {
          if (currentStep === 1) {
            try {
              setUsernameApiError(null);
              const response = await api.post(
                apiEndpoints.VERIFY_USERNAME,
                formData.username,
              );
              console.log('API Response:', response);
              if (response.success) {
                console.log(
                  'Username verification successful:',
                  response.success,
                );
                setCurrentStep(currentStep + 1);
              } else {
                console.log('Username verification failed:', response.error);
                setUsernameApiError('Username already exists');
              }
            } catch (error) {
              console.log('API Error:', error);
              setUsernameApiError('Username already exists');
            }
          } else {
            setCurrentStep(currentStep + 1);
          }
          console.log('Form data:', formData);
        } else {
          setIsBottomSheetOpen(true);
        }
      }
    } catch (error) {
      console.log('Validation error:', error);
    }
  };

  const handleSignUp = async () => {
    console.log('Sign up data:', formData);
    const response = await api
      .post(apiEndpoints.SIGNUP, {
        FullName: formData.fullName,
        UserName: formData.username,
        CityId: formData.city,
        Phone: formData.phoneNumber,
        Email: formData.email,
      })
      .then(res => {
        console.log('Sign up response:', res);
        if (res.success) {
          navigation.navigate('OtpVerification', {
            email: formData.email,
            phone: formData.phoneNumber,
            fullName: formData.fullName,
            username: formData.username,
            city: formData.city,
          });
        }
      })
      .catch(err => {
        console.log('Sign up error:', err);
      })
      .finally(() => {
        setIsBottomSheetOpen(false);
      });
    console.log('Sign up response:', response);
    setIsBottomSheetOpen(false);
  };

  const updateFormData = (field: string, value: string, formik?: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formik) {
      formik.setFieldValue(field, value);
    }
    if (field === 'username' && usernameApiError) {
      setUsernameApiError(null);
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
                usernameApiError={usernameApiError}
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
            onPress={() => {
              setIsBottomSheetOpen(false);
            }}
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
  usernameApiError: string | null;
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
  usernameApiError,
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
                maxLength: 50,
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
                usernameApiError
                  ? usernameApiError
                  : formik.touched.username && formik.errors.username
                  ? formik.errors.username
                  : undefined
              }
              fieldProps={{
                placeholder: 'Username',
                maxLength: 50,
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
          </View>

          <View style={styles.inputContainer}>
            <InputField
              error={''}
              fieldProps={{
                placeholder: '',
                maxLength: 0,
                value: '',
                readOnly: true,
              }}
              style={{
                opacity: 0,
              }}
            />
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
