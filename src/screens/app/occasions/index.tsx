import React, { useState } from 'react';
import { View, StatusBar, FlatList, TouchableOpacity } from 'react-native';
import useStyles from './style.ts';
import { useNavigation } from '@react-navigation/native';
import { Text } from '../../../utils/elements';
import { useLocaleStore } from '../../../store/reducer/locale';
import HomeHeader from '../../../components/global/HomeHeader.tsx';
import TabItem from '../../../components/global/TabItem.tsx';
import CustomButton from '../../../components/global/Custombutton.tsx';
import {
  SvgAddGroup,
  SvgAddOccasion,
  SvgCrownIcon,
  SvgDateIcon,
} from '../../../assets/icons';
import InputField from '../../../components/global/InputField.tsx';
import { Formik } from 'formik';
import * as Yup from 'yup';
import DatePicker from 'react-native-date-picker';

const OccasionsScreen: React.FC = () => {
  const { styles, theme } = useStyles();
  const { getString } = useLocaleStore();
  const navigation = useNavigation();
  const [step, setStep] = useState(1);
  const [viewDetails, setViewDetails] = useState({
    occasionName: '',
    occasionDate: '',
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const validationSchema = Yup.object().shape({
    occasionName: Yup.string().required('required'),
    occasionDate: Yup.date().required('required'),
  });
  const [date, setDate] = useState(
    viewDetails.occasionDate ? new Date(viewDetails.occasionDate) : new Date(),
  );
  const handleSubmit = (values: any) => {
    console.log(values);
  };

  const mockOccasions = [
    {
      id: 1,
      title: getString('OCC_BIRTHDAY'),
      image: require('../../../assets/images/birthday.png'),
      date: '2025-01-01',
    },
    {
      id: 2,
      title: getString('OCC_ANNIVERSARY'),
      image: require('../../../assets/images/anniversary.png'),
      date: '2025-01-01',
    },
  ];
  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor={theme.colors.BACKGROUND}
        barStyle="dark-content"
      />
      <HomeHeader
        title={
          step === 1
            ? getString('OCC_OCCASIONS')
            : getString('OCC_CREATE_OCCASION')
        }
        showBackButton={true}
        onBackPress={() => {
          if (step === 1) {
            navigation.goBack();
          } else {
            setStep(1);
            setViewDetails({
              occasionName: '',
              occasionDate: '',
            });
          }
        }}
      />
      {step === 1 && (
        <>
          <FlatList
            data={mockOccasions}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.content}
            renderItem={({ item }: { item: (typeof mockOccasions)[0] }) => (
              <TabItem
                isGroupImage={item.image}
                title={item.title}
                onPress={() => {
                  setStep(2);
                  setViewDetails({
                    occasionName: item.title,
                    occasionDate: item.date,
                  });
                }}
                TabItemStyles={styles.TabItem}
              />
            )}
          />
          <View style={styles.buttonContainer}>
            <CustomButton
              title={getString('OCC_CREATE_OCCASION')}
              type="primary"
              icon={<SvgAddOccasion />}
              onPress={() => {
                setStep(2);
              }}
            />
          </View>
        </>
      )}
      {step === 2 && (
        <>
          <View style={styles.content}>
            <Formik
              initialValues={{
                occasionName: viewDetails.occasionName,
                occasionDate: viewDetails.occasionDate,
              }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {formik => (
                <>
                  <View style={styles.inputContainer}>
                    <InputField
                      error={formik.errors.occasionName}
                      icon={<SvgCrownIcon />}
                      fieldProps={{
                        placeholder: 'Event',
                        value: formik.values.occasionName,
                        onChangeText: (text: string) => {
                          formik.setFieldValue('occasionName', text);
                        },
                        autoCapitalize: 'words',
                      }}
                    />
                  </View>
                  <View style={styles.inputContainer}>
                    <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                      <InputField
                        error={formik.errors.occasionDate}
                        icon={<SvgDateIcon />}
                        fieldProps={{
                          placeholder: 'Date',
                          value: formik.values.occasionDate,
                          onChangeText: (text: string) => {
                            formik.setFieldValue('occasionDate', text);
                          },
                          editable: false,
                          pointerEvents: 'none',
                        }}
                      />
                    </TouchableOpacity>
                  </View>
                  <CustomButton
                    title={'Create'}
                    type="primary"
                    buttonStyle={styles.button}
                    onPress={() => {
                      formik.handleSubmit();
                      setStep(1);
                      setViewDetails({
                        occasionName: '',
                        occasionDate: '',
                      });
                    }}
                  />
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
                          'occasionDate',
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
          </View>
        </>
      )}
    </View>
  );
};
export default OccasionsScreen;
