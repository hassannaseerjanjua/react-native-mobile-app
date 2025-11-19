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
import { SvgUser, SvgEmail, SvgWhatsappIcon } from '../../../assets/icons';
import { scaleWithMax } from '../../../utils';
import { createContactUsSchema } from '../../../utils/validationSchemas';
import api from '../../../utils/api';
import apiEndpoints from '../../../constants/api-endpoints';
import notify from '../../../utils/notify';
const ContactUsScreen: React.FC = () => {
  const { styles, theme } = useStyles();
  const navigation = useNavigation();
  const { getString } = useLocaleStore();
  const [loading, setLoading] = useState(false);

  const validationSchema = useMemo(
    () => createContactUsSchema(getString as (key: any) => string),
    [getString],
  );

  const initialValues = {
    subject: '',
    message: '',
  };

  const handleSubmit = (values: typeof initialValues) => {
    if (loading) return;
    setLoading(true);
    api
      .post(apiEndpoints.CONTACT_US_SUBMIT, values)
      .then(response => {
        if (response.success) {
          navigation.goBack();
        } else {
          notify.error(response.error || getString('AU_ERROR_OCCURRED'));
        }
      })
      .catch(error => {
        notify.error(error?.error || getString('AU_ERROR_OCCURRED'));
      })
      .finally(() => setLoading(false));
  };

  return (
    <ParentView style={styles.container}>
      <StatusBar
        backgroundColor={theme.colors.BACKGROUND}
        barStyle="dark-content"
      />

      <HomeHeader
        title={getString('CU_CONTACT_US')}
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
                    placeholder: getString('CU_SUBJECT'),
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
                    placeholder: getString('CU_WRITE_A_MESSAGE'),
                    value: formik.values.message,
                    onChangeText: (value: string) => {
                      formik.setFieldValue('message', value);
                    },
                    multiline: true,
                    numberOfLines: 6,
                    textAlignVertical: 'top',
                    style: {
                      height: theme.sizes.HEIGHT * 0.22,
                    },
                  }}
                />
              </View>

              <View style={styles.buttonContainer}>
                <CustomButton
                  title={getString('CU_SUBMIT')}
                  type="primary"
                  onPress={() => formik.handleSubmit()}
                />
              </View>
            </View>
          )}
        </Formik>
        <View style={styles.whatsappContainer}>
          <SvgWhatsappIcon
            width={scaleWithMax(56, 64)}
            height={scaleWithMax(56, 64)}
          />
        </View>
      </ScrollView>
    </ParentView>
  );
};

export default ContactUsScreen;
