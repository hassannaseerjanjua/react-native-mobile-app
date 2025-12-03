import { StyleSheet, TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';
import ParentView from '../../../components/app/ParentView';
import HomeHeader from '../../../components/global/HomeHeader';
import { Formik } from 'formik';
import InputField from '../../../components/global/InputField';
import * as Yup from 'yup';
import useStyles from './style';
import DatePicker from 'react-native-date-picker';
import CustomFooter from '../../../components/global/CustomFooter';
import CustomButton from '../../../components/global/Custombutton';
import { Text } from '../../../utils/elements';
import { useLocaleStore } from '../../../store/reducer/locale';
import { rtlFlexDirection } from '../../../utils';
const AddCart: React.FC = () => {
  const initialValues = {
    CardNumber: '',
    ExpiryDate: '',
    CVV: '',
    CardHolder: '',
  };
  const validationSchema = Yup.object().shape({
    CardNumber: Yup.string()
      .required('Card number is required')
      .test('card-digits-length', 'Enter a valid card number', value => {
        if (!value) return false;
        const digits = value.replace(/\s+/g, '');
        return (
          digits.length >= 13 && digits.length <= 19 && /^\d+$/.test(digits)
        );
      }),
    CVV: Yup.string()
      .required('CVV is required')
      .matches(/^\d{3,4}$/, 'CVV must be 3 or 4 digits'),
    ExpiryDate: Yup.string().required('Expiry date is required'),

  });
  const [date, setDate] = useState(() => {
    if (false) {
      return new Date('');
    }
    return new Date();
  });
  const { styles, theme } = useStyles();
  const { getString, isRtl } = useLocaleStore();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const formatCardNumber = (raw: string) => {
    const digitsOnly = raw.replace(/\D+/g, '').slice(0, 19);
    return digitsOnly.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
  };
  const formatExpiry = (d: Date) => {
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yy = String(d.getFullYear()).slice(-2);
    return `${mm}/${yy}`;
  };
  return (
    <ParentView>
      <HomeHeader title={getString('ADD_CARD_TITLE')} showBackButton />
      <View style={{ paddingHorizontal: theme.sizes.PADDING }}>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={() => {}}
          enableReinitialize={true}
        >
          {formik => (
            <>
              <View style={styles.formContainer}>
                <Text style={styles.label}>{getString('ADD_CARD_NUMBER_LABEL')}</Text>
                <View style={styles.inputContainer}>
                  <InputField
                    error={
                      formik.touched.CardNumber && formik.errors.CardNumber
                        ? formik.errors.CardNumber
                        : undefined
                    }
                    fieldProps={{
                      placeholder: getString('ADD_CARD_NUMBER_PLACEHOLDER'),
                      value: formik.values.CardNumber,
                      onChangeText: (value: string) => {
                        const formatted = formatCardNumber(value);
                        formik.setFieldValue('CardNumber', formatted);
                      },
                      keyboardType: 'number-pad',
                      maxLength: 23,
                      autoCapitalize: 'none',
                    }}
                  />
                </View>
              </View>
              <View
                style={{
                  ...styles.formContainer,
                  flexDirection: rtlFlexDirection(isRtl),
                  gap: theme.sizes.WIDTH * 0.04,
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>{getString('ADD_CARD_EXPIRY_LABEL')} </Text>
                  <View style={styles.inputContainer}>
                    <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                      <InputField
                        error={
                          formik.touched.ExpiryDate && formik.errors.ExpiryDate
                            ? formik.errors.ExpiryDate
                            : undefined
                        }
                        fieldProps={{
                          placeholder: getString('ADD_CARD_EXPIRY_PLACEHOLDER'),
                          value: formik.values.ExpiryDate,
                          editable: false,
                          autoCapitalize: 'none',
                        }}
                      />
                    </TouchableOpacity>
                    <DatePicker
                      modal
                      open={showDatePicker}
                      date={date}
                      mode="date"
                      minimumDate={new Date()}
                      onConfirm={selectedDate => {
                        setShowDatePicker(false);
                        setDate(selectedDate);
                        formik.setFieldValue(
                          'ExpiryDate',
                          formatExpiry(selectedDate),
                        );
                      }}
                      onCancel={() => {
                        setShowDatePicker(false);
                      }}
                      theme="light"
                      style={{
                        backgroundColor: theme.colors.BACKGROUND,
                      }}
                    />
                  </View>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>{getString('ADD_CARD_CVV_LABEL')}</Text>
                  <View style={styles.inputContainer}>
                    <InputField
                      error={
                        formik.touched.CVV && formik.errors.CVV
                          ? formik.errors.CVV
                          : undefined
                      }
                      fieldProps={{
                        placeholder: getString('ADD_CARD_CVV_PLACEHOLDER'),
                        value: formik.values.CVV,
                        onChangeText: (value: string) => {
                          const digits = value.replace(/\D+/g, '').slice(0, 4);
                          formik.setFieldValue('CVV', digits);
                        },
                        keyboardType: 'number-pad',
                        maxLength: 4,
                        autoCapitalize: 'none',
                        secureTextEntry: true,
                      }}
                    />
                  </View>
                </View>
              </View>
              <View style={styles.formContainer}>
                <Text style={styles.label}>{getString('ADD_CARD_HOLDER_LABEL')}</Text>
                <View style={styles.inputContainer}>
                  <InputField
                    error={
                      formik.touched.CardHolder && formik.errors.CardHolder
                        ? formik.errors.CardHolder
                        : undefined
                    }
                    fieldProps={{
                      placeholder: getString('ADD_CARD_HOLDER_PLACEHOLDER'),
                      value: formik.values.CardHolder,
                      onChangeText: (value: string) => {
                        formik.setFieldValue('CardHolder', value);
                      },
                      autoCapitalize: 'words',
                    }}
                  />
                </View>
              </View>
            </>
          )}
        </Formik>
      </View>
      <CustomFooter>
        <CustomButton title={getString('ADD_CARD_BUTTON')} onPress={() => {}} />
      </CustomFooter>
    </ParentView>
  );
};

export default AddCart;

const styles = StyleSheet.create({});
