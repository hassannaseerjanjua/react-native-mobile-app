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
const AddCart: React.FC = () => {
  const initialValues = {
    CardNumber: '',
    ExpiryDate: '',
    CVV: '',
    CardHolder: '',
  };
  const validationSchema = Yup.object().shape({
    CardNumber: Yup.string().required('Card number is required'),

    // Dob: birthdayValidation(getString),
  });
  const [date, setDate] = useState(() => {
    if (false) {
      return new Date('');
    }
    return new Date();
  });
  const { styles, theme } = useStyles();
  const [showDatePicker, setShowDatePicker] = useState(false);
  return (
    <ParentView>
      <HomeHeader title="Add Card" showBackButton />
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
                <Text style={styles.label}>Card Number</Text>
                <View style={styles.inputContainer}>
                  <InputField
                    error={
                      formik.touched.CardNumber && formik.errors.CardNumber
                        ? formik.errors.CardNumber
                        : undefined
                    }
                    fieldProps={{
                      placeholder: 'Card number',
                      value: formik.values.CardNumber,
                      onChangeText: (value: string) => {
                        formik.setFieldValue('CardNumber', value);
                      },
                      autoCapitalize: 'words',
                    }}
                  />
                </View>
              </View>
              <View
                style={{
                  ...styles.formContainer,
                  flexDirection: 'row',
                  gap: theme.sizes.WIDTH * 0.04,
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Expiry Date </Text>
                  <View style={styles.inputContainer}>
                    <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                      <InputField
                        error={
                          formik.touched.ExpiryDate && formik.errors.ExpiryDate
                            ? formik.errors.ExpiryDate
                            : undefined
                        }
                        fieldProps={{
                          placeholder: '8/27',
                          value: formik.values.ExpiryDate,
                          // onChangeText: (value: string) => {
                          //   formik.setFieldValue('CardNumber', value);
                          // },
                          editable: false,
                          autoCapitalize: 'words',
                        }}
                      />
                    </TouchableOpacity>
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
                            'ExpiryDate',
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
                  </View>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>CVV</Text>
                  <View style={styles.inputContainer}>
                    <InputField
                      error={
                        formik.touched.CardNumber && formik.errors.CardNumber
                          ? formik.errors.CardNumber
                          : undefined
                      }
                      fieldProps={{
                        placeholder: 'Card number',
                        value: formik.values.CardNumber,
                        onChangeText: (value: string) => {
                          formik.setFieldValue('CardNumber', value);
                        },
                        autoCapitalize: 'words',
                      }}
                    />
                  </View>
                </View>
              </View>
              <View style={styles.formContainer}>
                <Text style={styles.label}>Card Holder</Text>
                <View style={styles.inputContainer}>
                  <InputField
                    error={
                      formik.touched.CardHolder && formik.errors.CardHolder
                        ? formik.errors.CardHolder
                        : undefined
                    }
                    fieldProps={{
                      placeholder: 'Card holder',
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
        <CustomButton title="Add New Card" onPress={() => {}} />
      </CustomFooter>
    </ParentView>
  );
};

export default AddCart;

const styles = StyleSheet.create({});
