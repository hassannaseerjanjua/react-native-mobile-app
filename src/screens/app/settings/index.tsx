import React, { useState, useMemo, useEffect } from 'react';
import { View, StatusBar, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Formik } from 'formik';
import useStyles from './style';
import { Text } from '../../../utils/elements';
import HomeHeader from '../../../components/global/HomeHeader';
import InputField from '../../../components/global/InputField';
import CustomButton from '../../../components/global/Custombutton';
import ParentView from '../../../components/app/ParentView';
import { login, useAuthStore } from '../../../store/reducer/auth';
import { useLocaleStore } from '../../../store/reducer/locale';
import DatePicker from 'react-native-date-picker';
import {
  SvgUser,
  SvgUsername,
  SvgEmail,
  SvgPhone,
  SvgBirthdayIcon,
  SvgLocationPin,
} from '../../../assets/icons';
import { scaleWithMax, toOption } from '../../../utils';
import { createSettingsSchema } from '../../../utils/validationSchemas';
import DropdownField from '../../../components/global/DropdownField';
import useGetApi from '../../../hooks/useGetApi';
import { City, UpdateProfileApiResponse } from '../../../types';
import apiEndpoints from '../../../constants/api-endpoints';
import api from '../../../utils/api';
import { useDispatch } from 'react-redux';

const SettingsScreen: React.FC = () => {
  const { styles, theme } = useStyles();
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const dispatch = useDispatch();
  console.log('User:', user);
  const { getString } = useLocaleStore();
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [areaSearch, setAreaSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(() => {
    if (user?.DateOfBirth) {
      return new Date(user.DateOfBirth);
    }
    const eighteenYearsAgo = new Date();
    eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);
    return eighteenYearsAgo;
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  const citiesApi = useGetApi<City[]>(apiEndpoints.GET_CITY_LISTING, {
    transformData: data => data.Data.cities,
  });

  const options = toOption<City>(citiesApi.data || [], 'CityName', 'CityID');
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(areaSearch.toLowerCase()),
  );
  const [selectedOption, setSelectedOption] = useState<any>(null);

  useEffect(() => {
    if (citiesApi.data && user?.CityId && !selectedOption) {
      const defaultCity = options.find(option => option.value === user.CityId);
      if (defaultCity) {
        setSelectedOption(defaultCity);
      }
    }
  }, [citiesApi.data, user?.CityId, options, selectedOption]);

  useEffect(() => {
    if (user?.DateOfBirth) {
      setDate(new Date(user.DateOfBirth));
    }
  }, [user?.DateOfBirth]);

  const validationSchema = useMemo(
    () => createSettingsSchema(getString as (key: any) => string),
    [getString],
  );

  const initialValues = {
    Fullname: user?.FullNameEn || '',
    username: user?.UserName || '',
    CityId: user?.CityId || '',
    email: user?.Email || '',
    phoneNumber: user?.PhoneNo || '',
    Dob: user?.DateOfBirth || '',
    GenderId: user?.GenderId || '',
  };

  const handleUpdate = (values: typeof initialValues) => {
    if (loading) return;
    setLoading(true);

    const formData = new FormData();

    const fieldsToUpdate = ['Fullname', 'CityId', 'Dob', 'GenderId'];
    fieldsToUpdate.forEach(field => {
      if (values[field as keyof typeof values]) {
        formData.append(field, values[field as keyof typeof values]);
      }
    });

    api
      .put<UpdateProfileApiResponse>(apiEndpoints.UPDATE_PROFILE, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then(response => {
        console.log('Update profile:', response);
        if (response.data?.Data) {
          console.log('==>>', response.data.Data);
          dispatch(login({ ...user, ...response.data.Data }));
        }
      })

      .catch(error => {
        console.log('Update profile error:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <ParentView style={styles.container}>
      <StatusBar
        backgroundColor={theme.colors.BACKGROUND}
        barStyle="dark-content"
      />

      <HomeHeader
        title={getString('S_SETTINGS')}
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{getString('S_SELECT_LANGUAGE')}</Text>
        <View style={styles.languageContainer}>
          {['English', 'Arabic'].map((language: string) => (
            <TouchableOpacity
              key={language}
              style={styles.languageOption}
              onPress={() => setSelectedLanguage(language)}
            >
              <View style={styles.radioButton}>
                {selectedLanguage === language && (
                  <View style={styles.radioButtonSelected} />
                )}
              </View>
              <Text style={styles.languageText}>{language}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleUpdate}
          enableReinitialize={true}
        >
          {formik => (
            <>
              <View style={styles.formContainer}>
                <View style={styles.inputContainer}>
                  <InputField
                    icon={<SvgUser width={scaleWithMax(20, 25)} />}
                    error={
                      formik.touched.Fullname && formik.errors.Fullname
                        ? formik.errors.Fullname
                        : undefined
                    }
                    fieldProps={{
                      placeholder: 'Full name',
                      value: formik.values.Fullname,
                      onChangeText: (value: string) => {
                        formik.setFieldValue('Fullname', value);
                      },
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
                      value: formik.values.username,
                      onChangeText: (value: string) => {
                        formik.setFieldValue(
                          'username',
                          value?.trim()?.toLowerCase() || '',
                        );
                      },
                      autoCapitalize: 'none',
                      autoCorrect: false,
                      readOnly: true,
                      style: { color: theme.colors.SECONDARY_TEXT },
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
                      value: formik.values.email,
                      onChangeText: (value: string) => {
                        formik.setFieldValue('email', value);
                      },
                      keyboardType: 'email-address',
                      autoCapitalize: 'none',
                      autoCorrect: false,
                      readOnly: true,
                      style: { color: theme.colors.SECONDARY_TEXT },
                    }}
                  />
                </View>
                <View style={styles.inputContainer}>
                  <DropdownField
                    isLoading={citiesApi.loading}
                    label={getString('AU_PL_CITY')}
                    selectedOption={selectedOption}
                    icon={<SvgLocationPin width={scaleWithMax(20, 25)} />}
                    options={filteredOptions}
                    searchValue={areaSearch}
                    onSearchChange={setAreaSearch}
                    placeholder="City"
                    selectedValue={formik.values.CityId}
                    onSelect={value => {
                      setSelectedOption(value);
                      formik.setFieldValue('CityId', value.value);
                    }}
                    error={
                      formik.touched.CityId && formik.errors.CityId
                        ? formik.errors.CityId
                        : undefined
                    }
                  />
                </View>

                <View style={styles.inputContainer}>
                  <InputField
                    icon={<SvgPhone width={scaleWithMax(20, 25)} />}
                    isPhone={true}
                    error={
                      formik.touched.phoneNumber && formik.errors.phoneNumber
                        ? formik.errors.phoneNumber
                        : undefined
                    }
                    fieldProps={{
                      placeholder: 'Phone number',
                      value: formik.values.phoneNumber,
                      onChangeText: (value: string) => {
                        formik.setFieldValue('phoneNumber', value);
                      },
                      keyboardType: 'phone-pad',
                      maxLength: 9,
                      readOnly: true,
                      style: { color: theme.colors.SECONDARY_TEXT },
                    }}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                    <InputField
                      icon={<SvgBirthdayIcon width={scaleWithMax(20, 25)} />}
                      error={
                        formik.touched.Dob && formik.errors.Dob
                          ? formik.errors.Dob
                          : undefined
                      }
                      fieldProps={{
                        placeholder: 'Birthday',
                        value: formik.values.Dob,
                        editable: false,
                        pointerEvents: 'none',
                      }}
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.genderContainer}>
                  <View style={styles.genderOptions}>
                    {[
                      { label: getString('S_MALE'), value: 1 },
                      { label: getString('S_FEMALE'), value: 2 },
                    ].map(gender => (
                      <TouchableOpacity
                        key={gender.value}
                        style={styles.genderOption}
                        onPress={() =>
                          formik.setFieldValue('GenderId', gender.value)
                        }
                      >
                        <View style={styles.radioButton}>
                          {formik.values.GenderId === gender.value && (
                            <View style={styles.radioButtonSelected} />
                          )}
                        </View>
                        <Text style={styles.genderText}>{gender.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.buttonContainer}>
                  <CustomButton
                    title={getString('S_UPDATE')}
                    type="primary"
                    onPress={() => formik.handleSubmit()}
                    loading={loading}
                    disabled={loading}
                  />
                </View>
              </View>

              <DatePicker
                modal
                open={showDatePicker}
                date={date}
                mode="date"
                maximumDate={new Date()}
                onConfirm={selectedDate => {
                  const today = new Date();
                  if (selectedDate <= today) {
                    setShowDatePicker(false);
                    setDate(selectedDate);
                    formik.setFieldValue(
                      'Dob',
                      selectedDate.toISOString().split('T')[0],
                    );
                  }
                }}
                onCancel={() => {
                  setShowDatePicker(false);
                }}
                theme="light"
                style={{
                  backgroundColor: theme.colors.BACKGROUND,
                }}
              />
            </>
          )}
        </Formik>
      </ScrollView>
    </ParentView>
  );
};

export default SettingsScreen;
