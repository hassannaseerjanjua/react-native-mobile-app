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
  SvgEditGroup,
} from '../../../assets/icons';
import InputField from '../../../components/global/InputField.tsx';
import { Formik } from 'formik';
import * as Yup from 'yup';
import DatePicker from 'react-native-date-picker';
import api from '../../../utils/api.ts';
import apiEndpoints from '../../../constants/api-endpoints.ts';
import useGetApi from '../../../hooks/useGetApi.ts';
import { Occasion, OccasionsApiResponse } from '../../../types/index.ts';
import SkeletonLoader from '../../../components/SkeletonLoader/index.tsx';

const OccasionsScreen: React.FC = () => {
  const { styles, theme } = useStyles();
  const { getString, isRtl } = useLocaleStore();
  const navigation = useNavigation();
  const [step, setStep] = useState(1);
  const [viewDetails, setViewDetails] = useState({
    occasionName: '',
    occasionDate: '',
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedOccasion, setSelectedOccasion] = useState<{
    id: number | null;
    occasionType: 'view' | 'edit' | 'none' | 'create';
  }>({
    id: null,
    occasionType: 'none',
  });
  const validationSchema = Yup.object().shape({
    occasionName: Yup.string().required('required'),
    occasionDate: Yup.date().required('required'),
  });
  const [isEditGroupOpen, setIsEditGroupOpen] = useState(false);
  const [date, setDate] = useState(
    viewDetails.occasionDate ? new Date(viewDetails.occasionDate) : new Date(),
  );
  const handleSubmit = (values: any) => {
    console.log(values);
  };
  const {
    data: occasions,
    loading: occasionsLoading,
    error: occasionsError,
    refetch: getOccasions,
  } = useGetApi<Occasion[]>(apiEndpoints.GET_OCCASIONS, {
    transformData: (data: OccasionsApiResponse) => data.Data.Items || [],
    withAuth: true,
  });
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
  const _deleteOccasion = async (OccasionID: number) => {
    const response = await api.put(apiEndpoints.DELETE_OCCASION(OccasionID));
    if (response.success) {
      // do something
    }
  };
  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor={theme.colors.BACKGROUND}
        barStyle="dark-content"
      />
      <HomeHeader
        title={
          selectedOccasion.occasionType === 'none'
            ? getString('OCC_OCCASIONS')
            : selectedOccasion.occasionType === 'create'
            ? getString('OCC_CREATE_OCCASION')
            : selectedOccasion.occasionType === 'edit'
            ? 'Edit Occasion'
            : 'View Occasion'
        }
        rightSideTitle={
          isEditGroupOpen
            ? getString('STG_EDIT_GROUP')
            : [1]?.length !== 0
            ? getString('STG_EDIT_GROUP')
            : ''
        }
        rightSideTitlePress={() => setIsEditGroupOpen(!isEditGroupOpen)}
        rightSideIcon={<SvgEditGroup />}
        showBackButton={true}
        onBackPress={() => {
          if (selectedOccasion.occasionType === 'none') {
            navigation.goBack();
          } else {
            setSelectedOccasion({
              id: null,
              occasionType: 'none',
            });
            setViewDetails({
              occasionName: '',
              occasionDate: '',
            });
          }
        }}
      />
      {selectedOccasion.occasionType === 'none' && (
        <>
          <FlatList
            data={occasions || []}
            keyExtractor={item => item.OccassionId.toString()}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }: { item: Occasion }) => {
              const imageSource = item.ImageUrl
                ? { uri: item.ImageUrl }
                : require('../../../assets/images/birthday.png');
              return (
                <TabItem
                  isGroupImage={imageSource}
                  title={item.NameEn}
                  isEditGroup={isEditGroupOpen}
                  onEditPress={() =>
                    setSelectedOccasion({
                      occasionType: 'edit',
                      id: item.OccassionId,
                    })
                  }
                  onDeletePress={() =>
                    setSelectedOccasion({
                      occasionType: 'none',
                      id: item.OccassionId,
                    })
                  }
                  onPress={() => {
                    setStep(2);
                    !isEditGroupOpen &&
                      setSelectedOccasion({
                        occasionType: 'view',
                        id: item.OccassionId,
                      });
                    setViewDetails({
                      occasionName: item.NameEn,
                      occasionDate: item.OccasionDate || '',
                    });
                  }}
                  TabItemStyles={styles.TabItem}
                />
              );
            }}
          />
          <View style={styles.buttonContainer}>
            <CustomButton
              title={getString('OCC_CREATE_OCCASION')}
              type="primary"
              icon={<SvgAddOccasion />}
              onPress={() => {
                if (selectedOccasion.occasionType === 'none')
                  setSelectedOccasion({
                    id: null,
                    occasionType: 'create',
                  });
                else
                  setSelectedOccasion({
                    id: null,
                    occasionType: 'none',
                  });
              }}
            />
          </View>
        </>
      )}
      {selectedOccasion.occasionType !== 'none' &&
        (occasionsLoading ? (
          <SkeletonLoader screenType="orderListing" />
        ) : (
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
                    {selectedOccasion.occasionType !== 'view' && (
                      <CustomButton
                        title={
                          selectedOccasion.occasionType === 'edit'
                            ? 'Save'
                            : 'Create'
                        }
                        type="primary"
                        buttonStyle={styles.button}
                        onPress={() => {
                          formik.handleSubmit();
                          if (selectedOccasion === null)
                            setSelectedOccasion({
                              id: null,
                              occasionType: 'none',
                            });
                          else
                            setSelectedOccasion({
                              id: null,
                              occasionType: 'none',
                            });

                          // setViewDetails({
                          //   occasionName: '',
                          //   occasionDate: '',
                          // });
                        }}
                      />
                    )}
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
        ))}
    </View>
  );
};
export default OccasionsScreen;
