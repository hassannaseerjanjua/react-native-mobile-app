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
import { useLocaleStore } from '../../../store/reducer/locale';
import { SvgUser, SvgEmail } from '../../../assets/icons';
import { scaleWithMax } from '../../../utils';
import { createContactUsSchema } from '../../../utils/validationSchemas';

const ContactUsScreen: React.FC = () => {
  const { styles, theme } = useStyles();
  const navigation = useNavigation();
  const { getString } = useLocaleStore();

  const validationSchema = useMemo(
    () => createContactUsSchema(getString as (key: any) => string),
    [getString],
  );

  const initialValues = {
    subject: '',
    message: '',
  };

  const handleSubmit = (values: typeof initialValues) => {
    // TODO: Implement contact us API call
    console.log('Contact us submission:', values);
  };

  return (
    <ParentView style={styles.container}>
      <StatusBar
        backgroundColor={theme.colors.BACKGROUND}
        barStyle="dark-content"
      />

      <HomeHeader
        title="Contact us"
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
          onSubmit={handleSubmit}
          enableReinitialize={true}
        >
          {formik => (
            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <InputField
                  error={
                    formik.touched.subject && formik.errors.subject
                      ? formik.errors.subject
                      : undefined
                  }
                  fieldProps={{
                    placeholder: 'Subject',
                    value: formik.values.subject,
                    onChangeText: (value: string) => {
                      formik.setFieldValue('subject', value);
                    },
                    autoCapitalize: 'words',
                  }}
                />
              </View>

              <View style={styles.inputContainer}>
                <InputField
                  error={
                    formik.touched.message && formik.errors.message
                      ? formik.errors.message
                      : undefined
                  }
                  fieldProps={{
                    placeholder: 'Write a message',
                    value: formik.values.message,
                    onChangeText: (value: string) => {
                      formik.setFieldValue('message', value);
                    },
                    multiline: true,
                    numberOfLines: 6,
                    textAlignVertical: 'top',
                    style: {
                      height: theme.sizes.HEIGHT * 0.22,
                      // backgroundColor: '#F9F9F9',
                      // paddingTop: theme.sizes.HEIGHT * 0.2,
                    },
                  }}
                />
              </View>

              <View style={styles.buttonContainer}>
                <CustomButton
                  title="Submit"
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

export default ContactUsScreen;
