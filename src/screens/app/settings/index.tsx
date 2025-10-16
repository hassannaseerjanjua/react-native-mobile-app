import React, { useState, useMemo } from 'react';
import { View, StatusBar, ScrollView } from 'react-native';
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
} from '../../../assets/icons';
import { scaleWithMax } from '../../../utils';
import { createSettingsSchema } from '../../../utils/validationSchemas';

const SettingsScreen: React.FC = () => {
  const { styles, theme } = useStyles();
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const { getString } = useLocaleStore();

  const validationSchema = useMemo(
    () => createSettingsSchema(getString as (key: any) => string),
    [getString],
  );

  const initialValues = {
    fullName: user?.FullNameEn || '',
    username: user?.UserName || '',
    email: user?.Email || '',
    phoneNumber: user?.PhoneNo || '',
    birthday: user?.DateOfBirth || '',
  };

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
