import React, { useState, useMemo, useEffect } from 'react';
import { View, StatusBar, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Formik } from 'formik';
import useStyles from './style';
import { Text } from '../../../utils/elements';
import HomeHeader from '../../../components/global/HomeHeader';
import InputField from '../../../components/global/InputField';
import CustomButton from '../../../components/global/Custombutton';
import ParentView from '../../../components/app/ParentView';
import { login, logout, useAuthStore } from '../../../store/reducer/auth';
import {
  useLanguageShifter,
  useLocaleStore,
} from '../../../store/reducer/locale';
import DatePicker from 'react-native-date-picker';
import {
  SvgUser,
  SvgUsername,
  SvgEmail,
  SvgPhone,
  SvgBirthdayIcon,
  SvgLocationPin,
  SvgDropDown,
} from '../../../assets/icons';
import { scaleWithMax, toOption } from '../../../utils';
import { createSettingsSchema } from '../../../utils/validationSchemas';
import CityPickerModal from '../../../components/global/CityPickerModal';
import useGetApi from '../../../hooks/useGetApi';
import {
  City,
  fetchApiResponse,
  UpdateProfileApiResponse,
  User,
} from '../../../types';
import apiEndpoints from '../../../constants/api-endpoints';
import api from '../../../utils/api';
import notify from '../../../utils/notify';
import { useDispatch } from 'react-redux';
import SkeletonLoader from '../../../components/SkeletonLoader';
import ConfirmationPopup from '../../../components/global/ConfirmationPopup';
import { saveTokenWithLanguage } from '../../../utils/notificationService';

const SettingsScreen: React.FC = () => {
  const { styles, theme } = useStyles();
  const navigation = useNavigation();
  const { user, token } = useAuthStore();
  const dispatch = useDispatch();
  const { getString, langCode } = useLocaleStore();
  const [selectedLanguage, setSelectedLanguage] = useState<
    'English' | 'Arabic'
  >(langCode === 'en' ? 'English' : 'Arabic');
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [shimmerLoading, setShimmerLoading] = useState(false);
  const { shiftLanguage } = useLanguageShifter();
  const [date, setDate] = useState(() => {
    if (user?.DateOfBirth) {
      return new Date(user.DateOfBirth);
    }
    const eighteenYearsAgo = new Date();
    eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);
    return eighteenYearsAgo;
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const citiesApi = useGetApi<City[]>(apiEndpoints.GET_CITY_LISTING, {
    transformData: data => data.Data.cities,
  });

  const cityOptions = useMemo(
    () =>
      (citiesApi.data || []).map(city => ({
        label:
          langCode === 'ar'
            ? city.CityNameAr || city.CityName
            : city.CityNameEn || city.CityName,
        value: city.CityID,
      })),
    [citiesApi.data, langCode],
  );

  useFocusEffect(
    React.useCallback(() => {
      const unsubscribe = navigation.addListener('beforeRemove', (e: any) => {
        if (shimmerLoading) {
          e.preventDefault();
          return;
        }
      });

      return unsubscribe;
    }, [navigation, shimmerLoading]),
  );

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
    phoneNumber: user?.PhoneNo.replace('+966', '') || '',
    Dob: user?.DateOfBirth || '',
    GenderId: user?.GenderId || '',
  };
  const handleUpdate = (values: typeof initialValues) => {
    if (loading) return;
    setLoading(true);

    const formData = new FormData();
    const fieldsToUpdate = [
      'Fullname',
      'CityId',
      ...(!user?.IsBirthdayUpdated ? ['Dob'] : []),
      'GenderId',
    ];
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
        if (response.success && response.data?.Data && token) {
          dispatch(
            login({
              user: { ...user, ...response.data.Data },
              token: token,
            }),
          );

          notify.success(getString('PROFILE_UPDATED_SUCCESSFULLY'));
          setTimeout(() => {
            navigation.goBack();
          }, 500);
        } else if (response.failed) {
          notify.error(response.error || getString('AU_ERROR_OCCURRED'));
        }
      })
      .catch(error => {
        notify.error(error?.error || getString('AU_ERROR_OCCURRED'));
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleDeleteUser = () => {
    setShowDeleteConfirmation(false);
    setDeleteLoading(true);
    api
      .post(apiEndpoints.DELETE_USER, {})
      .then(response => {
        if (response.success) {
          notify.success(getString('S_ACCOUNT_DELETED_SUCCESSFULLY'));
          dispatch(logout());
          navigation.reset({
            index: 1,
            routes: [{ name: 'Login' as never }],
          });
        } else {
          notify.error(response.error || getString('AU_ERROR_OCCURRED'));
        }
      })
      .catch(error => {
        notify.error(error?.error || getString('AU_ERROR_OCCURRED'));
      })
      .finally(() => {
        setDeleteLoading(false);
      });
  };
  return (
    <ParentView style={styles.container}>
      <StatusBar
        backgroundColor={theme.colors.BACKGROUND}
        barStyle="dark-content"
      />

      <HomeHeader
        title={shimmerLoading ? '' : getString('S_SETTINGS')}
        showBackButton={!shimmerLoading}
        onBackPress={() => {
          if (!shimmerLoading) {
            navigation.goBack();
          }
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {shimmerLoading ? (
          <SkeletonLoader screenType="settings" />
        ) : (
          <>
            <Text style={styles.title}>{getString('S_SELECT_LANGUAGE')}</Text>
            <View style={styles.languageContainer}>
              {['English', 'Arabic'].map((language: string) => (
                <TouchableOpacity
                  key={language}
                  style={styles.languageOption}
                  onPress={async () => {
                    if (selectedLanguage === language) {
                      return;
                    }
                    setSelectedLanguage(language as 'English' | 'Arabic');
                    setShimmerLoading(true);
                    const newLangId = language === 'English' ? 1 : 2;
                    await saveTokenWithLanguage(newLangId);
                    shiftLanguage(language === 'English' ? 'en' : 'ar');

                    setTimeout(() => {
                      setShimmerLoading(false);
                    }, 1000);
                  }}
                >
                  <View style={styles.radioButton}>
                    {selectedLanguage === language && (
                      <View style={styles.radioButtonSelected} />
                    )}
                  </View>
                  <Text style={styles.languageText}>
                    {language === 'English'
                      ? getString('S_ENGLISH')
                      : getString('S_ARABIC')}
                  </Text>
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
                          placeholder: getString('AU_PL_FULL_NAME'),
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
                          placeholder: getString('AU_PL_USERNAME'),
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
                          placeholder: getString('AU_PL_EMAIL'),
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
                      <TouchableOpacity
                        onPress={() => setShowCityPicker(true)}
                        activeOpacity={0.7}
                        style={{ position: 'relative' }}
                      >
                        <InputField
                          icon={<SvgLocationPin width={scaleWithMax(20, 25)} />}
                          error={
                            formik.touched.CityId && formik.errors.CityId
                              ? formik.errors.CityId
                              : undefined
                          }
                          fieldProps={{
                            placeholder: getString('AU_PL_CITY'),
                            value:
                              cityOptions.find(
                                opt => opt.value === formik.values.CityId,
                              )?.label || '',
                            editable: false,
                            pointerEvents: 'none',
                          }}
                        />
                        <View
                          style={{
                            position: 'absolute',
                            right: theme.sizes.PADDING,
                            top: 0,
                            bottom: 0,
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}
                        >
                          <SvgDropDown width={scaleWithMax(20, 25)} />
                        </View>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.inputContainer}>
                      <InputField
                        icon={<SvgPhone width={scaleWithMax(20, 25)} />}
                        isPhone={true}
                        error={
                          formik.touched.phoneNumber &&
                          formik.errors.phoneNumber
                            ? formik.errors.phoneNumber
                            : undefined
                        }
                        fieldProps={{
                          placeholder: getString('AU_PHONE_NUMBER'),
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
                      <TouchableOpacity
                        onPress={() =>
                          !user?.IsBirthdayUpdated && setShowDatePicker(true)
                        }
                      >
                        <InputField
                          icon={
                            <SvgBirthdayIcon width={scaleWithMax(20, 25)} />
                          }
                          error={
                            formik.touched.Dob && formik.errors.Dob
                              ? formik.errors.Dob
                              : undefined
                          }
                          fieldProps={{
                            placeholder: getString('S_BIRTHDAY'),
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
                            <Text style={styles.genderText}>
                              {gender.label}
                            </Text>
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
                        disabled={loading || deleteLoading}
                      />
                      <CustomButton
                        title={getString('S_DELETE_ACCOUNT')}
                        type="secondary"
                        onPress={() => setShowDeleteConfirmation(true)}
                        loading={deleteLoading}
                        disabled={loading || deleteLoading}
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

                  <CityPickerModal
                    visible={showCityPicker}
                    onClose={() => setShowCityPicker(false)}
                    options={cityOptions.map(opt => ({
                      label: opt.label,
                      value: opt.value,
                    }))}
                    selectedValue={formik.values.CityId || user?.CityId}
                    onSelect={value => {
                      formik.setFieldValue('CityId', value);
                      setShowCityPicker(false);
                    }}
                    title={getString('AU_PL_CITY')}
                  />

                  <ConfirmationPopup
                    visible={showDeleteConfirmation}
                    title={getString('S_DELETE_ACCOUNT')}
                    message={getString('S_DELETE_ACCOUNT_CONFIRM_MESSAGE')}
                    onConfirm={handleDeleteUser}
                    onCancel={() => setShowDeleteConfirmation(false)}
                  />
                </>
              )}
            </Formik>
          </>
        )}
      </ScrollView>
    </ParentView>
  );
};

export default SettingsScreen;
