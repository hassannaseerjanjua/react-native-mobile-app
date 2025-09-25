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

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsBottomSheetOpen(true);
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
  updateFormData: (field: string, value: string) => void;
  styles: any;
  citiesApi: any;
  areaSearch: string;
  setAreaSearch: (value: string) => void;
}

const StepContent: React.FC<StepContentProps> = ({
  currentStep,
  formData,
  updateFormData,
  styles,
  citiesApi,
  areaSearch,
  setAreaSearch,
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
                updateFormData('city', value.value);
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
              fieldProps={{
                placeholder: 'Phone Number',
                value: '+966 ' + formData.phoneNumber,
                onChangeText: value => {
                  if (value?.startsWith('+966 ')) {
                    updateFormData(
                      'phoneNumber',
                      value?.replaceAll('+966 ', ''),
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
