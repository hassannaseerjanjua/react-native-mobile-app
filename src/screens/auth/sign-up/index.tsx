import React, { useEffect, useState, useMemo } from 'react';
import { TouchableOpacity, View } from 'react-native';
import DatePicker from 'react-native-date-picker';
import { AuthStackScreen } from '../../../types/navigation.types';
import CustomButton from '../../../components/global/Custombutton';
import useStyles from './style';
import InputField from '../../../components/global/InputField';
import api from '../../../utils/api';
import apiEndpoints from '../../../constants/api-endpoints';
import {
  SvgEmailStroke,
  SvgPhoneStroke,
  SvgPhoneIcon,
  SvgBirthdayStroke,
  SvgLocationPinStroke,
  SvgUserStroke,
  SvgUsernameStroke,
} from '../../../assets/icons';
import {
  scaleWithMax,
  toOption,
  formatPhoneWithCountryCode,
} from '../../../utils';
import { City } from '../../../types';
import DropdownField from '../../../components/global/DropdownField';
import useGetApi from '../../../hooks/useGetApi';
import AuthLayout from '../../../components/app/AuthLayout';
import AppBottomSheet from '../../../components/global/AppBottomSheet';
import { Formik } from 'formik';
import { useLocaleStore } from '../../../store/reducer/locale';
import { Text } from '../../../utils/elements';
import { createSignUpSchema } from '../../../utils/validationSchemas';
import notify from '../../../utils/notify';

interface SignUpProps extends AuthStackScreen<'SignUp'> {}

const SignUp: React.FC<SignUpProps> = ({ navigation }) => {
  const { styles, theme } = useStyles();
  const { getString } = useLocaleStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [areaSearch, setAreaSearch] = useState('');
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    city: '',
    dateOfBirth: '',
    phoneNumber: '',
    email: '',
  });

  const [usernameApiError, setUsernameApiError] = useState<string | null>(null);

  const citiesApi = useGetApi<City[]>(apiEndpoints.GET_CITY_LISTING, {
    transformData: data => data.Data.cities,
  });

  const handleNext = async (formik: any) => {
    try {
      const touchedFields = {
        fullName: currentStep === 1,
        username: currentStep === 1,
        city: currentStep === 2,
        dateOfBirth: currentStep === 2,
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
              if (response.error === 'This username already exists.') {
                setUsernameApiError(
                  getString('API_THIS_USERNAME_ALREADY_EXISTS'),
                );
              } else if (response.ResponseCode !== 200) {
                notify.error(response.error);
              } else {
                setCurrentStep(currentStep + 1);
              }
            } catch (error) {
              notify.error((error as string) || getString('AU_ERROR_OCCURRED'));
            }
          } else {
            setCurrentStep(currentStep + 1);
          }
        } else {
          // Step 3: Verify email and phone before opening bottom sheet
          try {
            const verifyResponse = await api.post(
              apiEndpoints.VERIFY_EMAIL_PHONE,
              {
                Email: formData.email,
                PhoneNo: formatPhoneWithCountryCode(formData.phoneNumber),
              },
            );
            if (verifyResponse.success && !verifyResponse.failed) {
              setIsBottomSheetOpen(true);
            } else {
              notify.error(
                verifyResponse.error || getString('AU_ERROR_OCCURRED'),
              );
            }
          } catch (error) {
            notify.error(getString('AU_NETWORK_ERROR_PLEASE_TRY_AGAIN'));
          }
        }
      }
    } catch (error) {}
  };

  const handleSignUp = async () => {
    const response = await api
      .post(apiEndpoints.SIGNUP, {
        FullName: formData.fullName,
        UserName: formData.username,
        CityId: formData.city,
        DateOfBirth: formData.dateOfBirth,
        Phone: formatPhoneWithCountryCode(formData.phoneNumber),
        Email: formData.email,
      })
      .then(res => {
        if (res.success) {
          navigation.navigate('OtpVerification', {
            email: formData.email,
            phone: formData.phoneNumber,
            fullName: formData.fullName,
            username: formData.username,
            city: formData.city,
          });
        } else {
          notify.error(res.error || getString('AU_ERROR_OCCURRED'));
        }
      })
      .catch(err => {
        notify.error(
          err?.error || getString('AU_NETWORK_ERROR_PLEASE_TRY_AGAIN'),
        );
      })
      .finally(() => {
        setIsBottomSheetOpen(false);
      });
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
          {currentStep === 1 && getString('AU_PERSONAL_INFO')}
          {currentStep === 2 && getString('AU_LABEL_CITY')}
          {currentStep === 3 && getString('AU_PERSONAL_INFO_STEP_3')}
        </Text>
        <Text style={styles.progressText}>
          {getString('AU_STEP')} {currentStep} {getString('AU_OF')} 3
        </Text>
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

  const validationSchema = useMemo(
    () => createSignUpSchema(currentStep, getString as (key: any) => string),
    [currentStep, getString],
  );
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
        onBackPress={() => {
          if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
            return;
          }
          navigation.goBack();
        }}
        title={
          currentStep === 1
            ? getString('AU_LETS_START')
            : currentStep === 2
            ? getString('AU_SELECT_CITY')
            : currentStep === 3
            ? `${getString('AU_PHONE_NUMBER_LABEL')}${getString(
                'AU_PHONE_AND_EMAIL',
              )}${getString('AU_EMAIL')}`
            : ''
        }
      >
        <Formik
          initialValues={formData}
          validationSchema={validationSchema}
          onSubmit={() => {}}
        >
          {formik => (
            <>
              {renderProgressBar()}
              <StepContent
                currentStep={currentStep}
                formData={formData}
                updateFormData={updateFormData}
                styles={styles}
                theme={theme}
                citiesApi={citiesApi}
                areaSearch={areaSearch}
                setAreaSearch={setAreaSearch}
                formik={formik}
                usernameApiError={usernameApiError}
              />

              <View style={styles.buttonContainer}>
                <CustomButton
                  title={
                    currentStep === 3
                      ? getString('AU_SIGN_UP_BUTTON')
                      : getString('AU_NEXT_BUTTON')
                  }
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
        height={theme.sizes.HEIGHT * 0.42}
        isOpen={isBottomSheetOpen}
        onClose={() => setIsBottomSheetOpen(false)}
      >
        <View style={styles.bottomSheetContainer}>
          <View style={styles.bottomSheetIconContainer}>
            <SvgPhoneIcon width={scaleWithMax(48, 55)} />
          </View>
          <Text style={styles.bottomSheetTitle}>
            {getString('AU_IS_THIS_YOUR_CORRECT_PN')}
          </Text>
          <Text style={styles.bottomSheetNumber}>
            {'\u200E'}+966 {formatPhone(formData.phoneNumber)}
          </Text>
          <CustomButton
            title={getString('AU_SEND_CODE_BY_SMS')}
            type="primary"
            buttonStyle={{
              marginBottom: scaleWithMax(15, 20),
            }}
            onPress={handleSignUp}
          />
          <CustomButton
            title={getString('AU_NO_I_WANT_TO_CHANGE')}
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
  theme: any;
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
  theme,
  citiesApi,
  areaSearch,
  setAreaSearch,
  formik,
  usernameApiError,
}) => {
  const { getString } = useLocaleStore();
  const options = toOption<City>(citiesApi.data || [], 'CityName', 'CityID');
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(areaSearch.toLowerCase()),
  );
  const [selectedOption, setSelectedOption] = useState(
    options?.find(option => option.value === formData.city) || null,
  );
  const eighteenYearsAgo = useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 18);
    return d;
  }, []);
  const [date, setDate] = useState(
    formData.dateOfBirth ? new Date(formData.dateOfBirth) : eighteenYearsAgo,
  );
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (formData.dateOfBirth) {
      setDate(new Date(formData.dateOfBirth));
    } else {
      setDate(eighteenYearsAgo);
    }
  }, [formData.dateOfBirth, eighteenYearsAgo]);

  switch (currentStep) {
    case 1:
      return (
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <InputField
              icon={<SvgUserStroke width={scaleWithMax(20, 25)} />}
              error={
                formik.touched.fullName && formik.errors.fullName
                  ? formik.errors.fullName
                  : undefined
              }
              fieldProps={{
                placeholder: getString('AU_PL_FULL_NAME'),
                value: formData.fullName,
                maxLength: 50,
                onChangeText: value =>
                  updateFormData('fullName', value, formik),
                autoCapitalize: 'words',
                autoCorrect: false,
              }}
            />
          </View>

          <View style={styles.inputContainer}>
            <InputField
              icon={<SvgUsernameStroke width={scaleWithMax(20, 25)} />}
              error={
                usernameApiError
                  ? usernameApiError
                  : formik.touched.username && formik.errors.username
                  ? formik.errors.username
                  : undefined
              }
              fieldProps={{
                placeholder: getString('AU_PL_USERNAME'),
                maxLength: 50,
                value: formData.username,
                onChangeText: value =>
                  updateFormData(
                    'username',
                    value?.trim()?.toLowerCase() || '',
                    formik,
                  ),
                autoCapitalize: 'none',
                autoCorrect: false,
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
              label={getString('AU_PL_CITY')}
              selectedOption={selectedOption}
              icon={<SvgLocationPinStroke width={scaleWithMax(20, 25)} />}
              options={filteredOptions}
              placeholder={getString('AU_PL_CITY')}
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
            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
              <InputField
                icon={<SvgBirthdayStroke width={scaleWithMax(20, 25)} />}
                error={
                  formik.touched.dateOfBirth && formik.errors.dateOfBirth
                    ? formik.errors.dateOfBirth
                    : undefined
                }
                fieldProps={{
                  placeholder: getString('S_BIRTHDAY'),
                  value: formData.dateOfBirth,
                  editable: false,
                  pointerEvents: 'none',
                }}
              />
            </TouchableOpacity>
          </View>
          <DatePicker
            modal
            open={showDatePicker}
            date={date}
            mode="date"
            maximumDate={new Date()}
            onConfirm={selectedDate => {
              setShowDatePicker(false);
              setDate(selectedDate);
              updateFormData(
                'dateOfBirth',
                selectedDate.toISOString().split('T')[0],
                formik,
              );
            }}
            onCancel={() => setShowDatePicker(false)}
            theme="light"
          />
        </View>
      );

    case 3:
      return (
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <InputField
              icon={<SvgEmailStroke width={scaleWithMax(20, 25)} />}
              error={
                formik.touched.email && formik.errors.email
                  ? formik.errors.email
                  : undefined
              }
              fieldProps={{
                id: 'email',
                placeholder: getString('AU_EMAIL'),
                value: formData.email,
                onChangeText: value => updateFormData('email', value, formik),
                keyboardType: 'email-address',
                autoCapitalize: 'none',
              }}
            />
          </View>
          <View style={styles.inputContainer}>
            <InputField
              icon={<SvgPhoneStroke width={scaleWithMax(20, 25)} />}
              isPhone={true}
              error={
                formik.touched.phoneNumber && formik.errors.phoneNumber
                  ? formik.errors.phoneNumber
                  : undefined
              }
              fieldProps={{
                placeholder: getString('AU_PHONE_NUMBER'),
                maxLength: 9,
                value: formData.phoneNumber,
                onChangeText: value => {
                  updateFormData('phoneNumber', value, formik);
                },
                keyboardType: 'number-pad',
              }}
            />
          </View>
        </View>
      );

    default:
      return null;
  }
};
