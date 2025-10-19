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
import { useAuthStore } from '../../../store/reducer/auth';
import { useLocaleStore } from '../../../store/reducer/locale';
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
import { City } from '../../../types';
import apiEndpoints from '../../../constants/api-endpoints';

const SettingsScreen: React.FC = () => {
  const { styles, theme } = useStyles();
  const navigation = useNavigation();
  const { user } = useAuthStore();
  console.log('User:', user);
  const { getString } = useLocaleStore();
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [selectedGender, setSelectedGender] = useState('Male');
  const [areaSearch, setAreaSearch] = useState('');

  const citiesApi = useGetApi<City[]>(apiEndpoints.GET_CITY_LISTING, {
    transformData: data => data.Data.cities,
  });

  const options = toOption<City>(citiesApi.data || [], 'CityName', 'CityID');
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(areaSearch.toLowerCase()),
  );
  const [selectedOption, setSelectedOption] = useState<any>(null);

  // Update selected option when cities data loads
  useEffect(() => {
    console.log('Cities data loaded:', citiesApi.data?.length);
    console.log('User CityId:', user?.CityId);
    console.log('Options available:', options.length);
    console.log('Current selectedOption:', selectedOption);

    if (citiesApi.data && user?.CityId && !selectedOption) {
      const defaultCity = options.find(option => option.value === user.CityId);
      console.log('Found default city:', defaultCity);
      if (defaultCity) {
        setSelectedOption(defaultCity);
      }
    }
  }, [citiesApi.data, user?.CityId, options, selectedOption]);

  const validationSchema = useMemo(
    () => createSettingsSchema(getString as (key: any) => string),
    [getString],
  );

  const initialValues = {
    fullName: user?.FullNameEn || '',
    username: user?.UserName || '',
    city: user?.CityId || '',
    email: user?.Email || '',
    phoneNumber: user?.PhoneNo || '',
    birthday: user?.DateOfBirth || '',
  };

  console.log('Initial values:', initialValues);

  const handleUpdate = (values: typeof initialValues) => {
    // TODO: Implement update logic
    console.log('Update profile:', values);
  };

  return (
    <ParentView style={styles.container}>
      <StatusBar
        backgroundColor={theme.colors.BACKGROUND}
        barStyle="dark-content"
      />

      <HomeHeader
        title="Settings"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Select Language</Text>
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
                    placeholder: 'Full name',
                    value: formik.values.fullName,
                    onChangeText: (value: string) => {
                      formik.setFieldValue('fullName', value);
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
                  selectedValue={formik.values.city}
                  onSelect={value => {
                    setSelectedOption(value);
                    formik.setFieldValue('city', value.value);
                  }}
                  error={
                    formik.touched.city && formik.errors.city
                      ? formik.errors.city
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
                  }}
                />
              </View>

              <View style={styles.inputContainer}>
                <InputField
                  icon={<SvgBirthdayIcon width={scaleWithMax(20, 25)} />}
                  error={
                    formik.touched.birthday && formik.errors.birthday
                      ? formik.errors.birthday
                      : undefined
                  }
                  fieldProps={{
                    placeholder: 'Birthday',
                    value: formik.values.birthday,
                    onChangeText: (value: string) => {
                      formik.setFieldValue('birthday', value);
                    },
                  }}
                />
              </View>

              <View style={styles.genderContainer}>
                <View style={styles.genderOptions}>
                  {['Male', 'Female'].map((gender: string) => (
                    <TouchableOpacity
                      key={gender}
                      style={styles.genderOption}
                      onPress={() => setSelectedGender(gender)}
                    >
                      <View style={styles.radioButton}>
                        {selectedGender === gender && (
                          <View style={styles.radioButtonSelected} />
                        )}
                      </View>
                      <Text style={styles.genderText}>{gender}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.buttonContainer}>
                <CustomButton
                  title="Update"
                  type="primary"
                  onPress={() => formik.handleSubmit()}
                />
              </View>
            </View>
          )}
        </Formik>
      </ScrollView>
    </ParentView>
  );
};

export default SettingsScreen;
