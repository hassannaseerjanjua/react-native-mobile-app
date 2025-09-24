import React, { useState, useEffect } from 'react';
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
  SvgUser,
  SvgUsername,
} from '../../../assets/icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { scaleWithMax, toOption } from '../../../utils';
import { City } from '../../../types';
import DropdownField from '../../../components/global/DropdownField';
import useGetApi from '../../../hooks/useGetApi';
import AuthLayout from '../../../components/app/AuthLayout';

interface SignUpProps extends AuthStackScreen<'SignUp'> {}

const SignUp: React.FC<SignUpProps> = ({ navigation }) => {
  const { styles, theme } = useStyles();
  const [currentStep, setCurrentStep] = useState(1);

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

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSignUp();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSignUp = () => {
    console.log('Sign up data:', formData);
    // Handle final sign up logic here
    navigation.navigate('OtpVerification', {
      email: formData.email,
      phone: formData.phoneNumber,
    });
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return (
          formData.fullName.trim() !== '' && formData.username.trim() !== ''
        );
      case 2:
        return formData.city !== null || formData.city !== undefined;
      case 3:
        return (
          formData.phoneNumber.trim() !== '' && formData.email.trim() !== ''
        );
      default:
        return false;
    }
  };

  const renderHeading = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Let’s start Name & Username</Text>
          </View>
        );
      case 2:
        return (
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Select Your City</Text>
          </View>
        );
      case 3:
        return (
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Phone Number & Email</Text>
          </View>
        );
      default:
        return null;
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
    <AuthLayout
      onBackPress={() => {
        if (currentStep > 1) {
          setCurrentStep(currentStep - 1);
          return;
        }
        navigation.goBack();
      }}
      title="Let's start with Name & Username"
    >
      <>
        {renderProgressBar()}
        <StepContent
          currentStep={currentStep}
          formData={formData}
          updateFormData={updateFormData}
          styles={styles}
          citiesApi={citiesApi}
        />

        <View style={styles.buttonContainer}>
          <CustomButton
            title={currentStep === 3 ? 'Sign Up' : 'Next'}
            type="primary"
            onPress={handleNext}
            disabled={!isStepValid()}
          />
        </View>
      </>
    </AuthLayout>
  );
};

export default SignUp;

interface StepContentProps {
  currentStep: number;
  formData: any;
  updateFormData: (field: string, value: string) => void;
  styles: any;
  citiesApi: any;
}

const StepContent: React.FC<StepContentProps> = ({
  currentStep,
  formData,
  updateFormData,
  styles,
  citiesApi,
}) => {
  switch (currentStep) {
    case 1:
      return (
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <InputField
              icon={<SvgUser width={scaleWithMax(20, 25)} />}
              fieldProps={{
                placeholder: 'Full Name',
                value: formData.fullName,
                onChangeText: value => updateFormData('fullName', value),
                autoCapitalize: 'words',
              }}
            />
          </View>

          <View style={styles.inputContainer}>
            <InputField
              icon={<SvgUsername width={scaleWithMax(20, 25)} />}
              fieldProps={{
                placeholder: 'Username',
                value: formData.username,
                onChangeText: value => updateFormData('username', value),
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
            {/* <InputField
              icon={<SvgLocationPin width={scaleWithMax(20, 25)} />}
              fieldProps={{
                placeholder: 'City',
                value: formData.city,
                onChangeText: value => updateFormData('city', value),
                autoCapitalize: 'words',
              }}
            /> */}
            {citiesApi.loading ? (
              <ActivityIndicator />
            ) : (
              <DropdownField
                label="Select City"
                icon={<SvgLocationPin width={scaleWithMax(20, 25)} />}
                options={toOption<City>(
                  citiesApi.data || [],
                  'CityName',
                  'CityID',
                )}
                selectedValue={formData.city}
                onSelect={value => {
                  updateFormData('city', value.value);
                }}
              />
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
              fieldProps={{
                placeholder: 'Phone Number',
                value: formData.phoneNumber,
                onChangeText: value => updateFormData('phoneNumber', value),
                keyboardType: 'phone-pad',
              }}
            />
          </View>
          <View style={styles.inputContainer}>
            <InputField
              icon={<SvgEmail width={scaleWithMax(20, 25)} />}
              fieldProps={{
                placeholder: 'Email',
                value: formData.email,
                onChangeText: value => updateFormData('email', value),
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
