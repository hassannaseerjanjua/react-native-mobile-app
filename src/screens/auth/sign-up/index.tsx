import React, { useState } from 'react';
import { View, Text, ScrollView, Image, TextInput } from 'react-native';
import { AuthStackScreen } from '../../../types/navigation.types';
import CustomButton from '../../../components/global/Custombutton';
import useStyles from './style';
import InputField from '../../../components/global/InputField';

interface SignUpProps extends AuthStackScreen<'SignUp'> {}

const SignUp: React.FC<SignUpProps> = ({ navigation }) => {
  const { styles } = useStyles();
  const [currentStep, setCurrentStep] = useState(1);

  // Form data
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    city: '',
    phoneNumber: '',
    email: '',
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
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return (
          formData.fullName.trim() !== '' &&
          formData.username.trim() !== '' &&
          formData.email.trim() !== ''
        );
      case 2:
        return formData.city.trim() !== '';
      case 3:
        return formData.phoneNumber.trim() !== '';
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
            <Text style={styles.title}>Phone Number</Text>
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
          {currentStep === 3 && 'Personal Information'}
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

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <InputField
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
                fieldProps={{
                  placeholder: 'Username',
                  value: formData.username,
                  onChangeText: value => updateFormData('username', value),
                  autoCapitalize: 'none',
                }}
              />
            </View>
            <View style={styles.inputContainer}>
              <InputField
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

      case 2:
        return (
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <InputField
                fieldProps={{
                  placeholder: 'City',
                  value: formData.city,
                  onChangeText: value => updateFormData('city', value),
                  autoCapitalize: 'words',
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
                fieldProps={{
                  placeholder: 'Phone Number',
                  value: formData.phoneNumber,
                  onChangeText: value => updateFormData('phoneNumber', value),
                  keyboardType: 'phone-pad',
                }}
              />
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.logoContainer}>
        <Image source={require('../../../assets/images/blueLogo.png')} />
      </View>

      {renderHeading()}
      {renderProgressBar()}
      {renderStepContent()}

      <View style={styles.buttonContainer}>
        {currentStep > 1 && (
          <CustomButton
            title="Back"
            type="secondary"
            onPress={handleBack}
            buttonStyle={styles.backButton}
          />
        )}
        <CustomButton
          title={currentStep === 3 ? 'Complete Sign Up' : 'Next'}
          type="primary"
          onPress={handleNext}
          disabled={!isStepValid()}
        />
      </View>
    </ScrollView>
  );
};

export default SignUp;
