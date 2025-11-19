import React, { useState, useEffect } from 'react';
import {
  View,
  StatusBar,
  FlatList,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
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
  SvgGalleryIcon,
  SvgImageIcon,
} from '../../../assets/icons';
import InputField from '../../../components/global/InputField.tsx';
import { Formik } from 'formik';
import * as Yup from 'yup';
import DatePicker from 'react-native-date-picker';
import api from '../../../utils/api.ts';
import apiEndpoints from '../../../constants/api-endpoints.ts';
import notify from '../../../utils/notify';
import useGetApi from '../../../hooks/useGetApi.ts';
import { Occasion, OccasionsApiResponse } from '../../../types/index.ts';
import SkeletonLoader from '../../../components/SkeletonLoader/index.tsx';

interface ImageFile {
  uri: string;
  type: string;
  name: string;
}

type ImageValue = string | ImageFile | null;

const OccasionsScreen: React.FC = () => {
  const { styles, theme } = useStyles();
  const { getString, isRtl } = useLocaleStore();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedOccasion, setSelectedOccasion] = useState<{
    id: number | null;
    occasionType: 'view' | 'edit' | 'none' | 'create';
  }>({
    id: null,
    occasionType: 'none',
  });
  const [formInitialValues, setFormInitialValues] = useState<{
    occasionName: string;
    occasionDate: string;
    image: ImageValue;
  }>({
    occasionName: '',
    occasionDate: '',
    image: null,
  });
  const [date, setDate] = useState(new Date());
  const [isEditGroupOpen, setIsEditGroupOpen] = useState(false);

  const validationSchema = Yup.object().shape({
    occasionName: Yup.string().required('required'),
    occasionDate: Yup.date().required('required'),
  });
  const handleImageSelect = (formik: any) => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.4,
        selectionLimit: 1,
        maxWidth: 800,
        maxHeight: 800,
        includeBase64: false,
      },
      response => {
        if (response.assets && response.assets[0]) {
          const asset = response.assets[0];

          if (asset.fileSize && asset.fileSize > 2 * 1024 * 1024) {
          }

          const imageFile: ImageFile = {
            uri:
              Platform.OS === 'ios'
                ? asset.uri?.replace('file://', '') || ''
                : asset.uri || '',
            type: asset.type || 'image/jpeg',
            name: asset.fileName || `occasion_image_${Date.now()}.jpg`,
          };
          // Update formik without triggering validation
          formik.setFieldValue('image', imageFile, false);
          formik.setFieldTouched('image', true, false);
        }
      },
    );
  };

  const getImageDisplayValue = (image: ImageValue): string => {
    if (!image) return '';
    if (typeof image === 'string') {
      // If it's a URL string (existing image), show a friendly message
      if (image.startsWith('http') || image.length > 50) {
        return getString('OCC_CURRENT_IMAGE');
      }
      return image;
    }
    // For file objects, show the file name
    return image.name || getString('OCC_IMAGE_SELECTED');
  };

  const handleSubmit = (values: {
    occasionName: string;
    occasionDate: string;
    image: ImageValue;
  }) => {
    if (selectedOccasion.occasionType === 'create') {
      _createOccasion(values);
    } else {
      _updateOccasion(values);
    }
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

  const _deleteOccasion = async (OccasionID: number) => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await api.delete(
        apiEndpoints.DELETE_OCCASION(OccasionID),
      );
      if (response.success) {
        getOccasions();
      } else {
        notify.error(response.error || getString('AU_ERROR_OCCURRED'));
      }
    } catch (error: any) {
      notify.error(error?.error || getString('AU_ERROR_OCCURRED'));
    } finally {
      setLoading(false);
    }
  };

  const _createOccasion = async (values: {
    occasionName: string;
    occasionDate: string;
    image: ImageValue;
  }) => {
    if (loading) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('NameEn', values.occasionName);
      formData.append('NameAr', values.occasionName);
      formData.append('OccasionDate', values.occasionDate);

      if (values.image && typeof values.image === 'object') {
        formData.append('ImageUrl', {
          uri: values.image.uri,
          type: values.image.type,
          name: values.image.name,
        } as any);
      }

      // Don't set Content-Type header - the axios interceptor handles it for FormData
      const response = await api.post(
        apiEndpoints.CREATE_OCCASION,
        formData,
        {},
      );

      if (response.success) {
        getOccasions();
        setSelectedOccasion({
          id: null,
          occasionType: 'none',
        });
      } else if (response.failed) {
        notify.error(response.error || getString('AU_ERROR_OCCURRED'));
      }
    } catch (error: any) {
      notify.error(error?.error || getString('AU_ERROR_OCCURRED'));
    } finally {
      setLoading(false);
    }
  };

  const _updateOccasion = async (values: {
    occasionName: string;
    occasionDate: string;
    image: ImageValue;
  }) => {
    if (loading) return;
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('OccassionId', selectedOccasion.id?.toString() || '');
      formData.append('NameEn', values.occasionName);

      if (values.image && typeof values.image === 'object') {
        formData.append('ImageUrl', {
          uri: values.image.uri,
          type: values.image.type,
          name: values.image.name,
        } as any);
      }

      // Don't set Content-Type header - the axios interceptor handles it for FormData
      const response = await api.put(
        apiEndpoints.UPDATE_OCCASION(selectedOccasion.id),
        formData,
        {},
      );

      if (response.success) {
        getOccasions();
        setSelectedOccasion({
          id: null,
          occasionType: 'none',
        });
      } else if (response.failed) {
        notify.error(response.error || getString('AU_ERROR_OCCURRED'));
      }
    } catch (error: any) {
      notify.error(error?.error || getString('AU_ERROR_OCCURRED'));
    } finally {
      setLoading(false);
    }
  };

  const _getOccasionDetail = async (id: number) => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await api.get(apiEndpoints.GET_OCCASION_DETAIL(id));
      if (response.success && response.data) {
        const occasionData = (response.data as any)?.Data;
        if (occasionData) {
          setFormInitialValues({
            occasionName: occasionData.NameEn || '',
            occasionDate: occasionData.OccasionDate || '',
            image: occasionData.ImageUrl || null,
          });
          if (occasionData.OccasionDate) {
            setDate(new Date(occasionData.OccasionDate));
          }
        } else {
          notify.error(response.error || getString('AU_ERROR_OCCURRED'));
        }
      }
    } catch (error: any) {
      notify.error(error?.error || getString('AU_ERROR_OCCURRED'));
    } finally {
      setLoading(false);
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
            ? getString('OCC_EDIT_OCCASION')
            : getString('OCC_VIEW_OCCASION')
        }
        rightSideTitle={
          isEditGroupOpen || selectedOccasion.occasionType !== 'none'
            ? ''
            : occasions?.length !== 0
            ? getString('OCC_EDIT_OCCASION')
            : ''
        }
        rightSideTitlePress={() => setIsEditGroupOpen(!isEditGroupOpen)}
        rightSideIcon={<SvgEditGroup />}
        showBackButton={true}
        onBackPress={() => {
          if (isEditGroupOpen) {
            setIsEditGroupOpen(false);
          } else if (selectedOccasion.occasionType === 'none') {
            navigation.goBack();
          } else {
            setSelectedOccasion({
              id: null,
              occasionType: 'none',
            });
            setFormInitialValues({
              occasionName: '',
              occasionDate: '',
              image: null,
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
                  onEditPress={async () => {
                    setSelectedOccasion({
                      occasionType: 'edit',
                      id: item.OccassionId,
                    });
                    await _getOccasionDetail(item.OccassionId);
                  }}
                  onDeletePress={() => _deleteOccasion(item.OccassionId)}
                  onPress={async () => {
                    if (!isEditGroupOpen) {
                      setSelectedOccasion({
                        occasionType: 'view',
                        id: item.OccassionId,
                      });
                      await _getOccasionDetail(item.OccassionId);
                    }
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
                setSelectedOccasion({
                  id: null,
                  occasionType: 'create',
                });
                setFormInitialValues({
                  occasionName: '',
                  occasionDate: '',
                  image: null,
                });
              }}
            />
          </View>
        </>
      )}
      {selectedOccasion.occasionType !== 'none' && (
        <>
          <View style={styles.content}>
            <Formik
              initialValues={formInitialValues}
              enableReinitialize={true}
              validationSchema={validationSchema}
              validateOnChange={false}
              validateOnBlur={true}
              onSubmit={handleSubmit}
            >
              {formik => (
                <>
                  <View style={styles.inputContainer}>
                    <InputField
                      error={
                        formik.touched.occasionName &&
                        formik.errors.occasionName
                          ? formik.errors.occasionName
                          : undefined
                      }
                      icon={<SvgCrownIcon />}
                      fieldProps={{
                        placeholder: getString('OCC_EVENT'),
                        value: formik.values.occasionName,
                        onChangeText: (text: string) => {
                          formik.setFieldValue('occasionName', text, false);
                          formik.setFieldTouched('occasionName', true, false);
                        },
                        onBlur: () => {
                          formik.setFieldTouched('occasionName', true);
                        },
                        autoCapitalize: 'words',
                      }}
                    />
                  </View>
                  <View style={styles.inputContainer}>
                    <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                      <InputField
                        error={
                          formik.touched.occasionDate &&
                          formik.errors.occasionDate
                            ? formik.errors.occasionDate
                            : undefined
                        }
                        icon={<SvgDateIcon />}
                        fieldProps={{
                          placeholder: getString('OCC_DATE'),
                          value: formik.values.occasionDate,
                          onChangeText: (text: string) => {
                            formik.setFieldValue('occasionDate', text, false);
                          },
                          onFocus: () => {
                            formik.setFieldTouched('occasionDate', true, false);
                          },
                          editable: false,
                          pointerEvents: 'none',
                        }}
                      />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.inputContainer}>
                    {selectedOccasion.occasionType !== 'view' ? (
                      <TouchableOpacity
                        onPress={() => handleImageSelect(formik)}
                      >
                        <InputField
                          isOccasion={true}
                          error={
                            formik.touched.image && formik.errors.image
                              ? formik.errors.image
                              : undefined
                          }
                          icon={<SvgGalleryIcon />}
                          fieldProps={{
                            placeholder: getString('OCC_IMAGE'),
                            value: getImageDisplayValue(formik.values.image),
                            onChangeText: () => {},
                            editable: false,
                            pointerEvents: 'none',
                          }}
                        />
                      </TouchableOpacity>
                    ) : (
                      <InputField
                        error={
                          formik.touched.image && formik.errors.image
                            ? formik.errors.image
                            : undefined
                        }
                        icon={<SvgGalleryIcon />}
                        fieldProps={{
                          placeholder: getString('OCC_IMAGE'),
                          value: getImageDisplayValue(formik.values.image),
                          onChangeText: () => {},
                          editable: false,
                          pointerEvents: 'none',
                        }}
                      />
                    )}
                  </View>
                  {selectedOccasion.occasionType !== 'view' && (
                    <CustomButton
                      title={
                        selectedOccasion.occasionType === 'edit'
                          ? getString('OCC_SAVE')
                          : getString('OCC_CREATE')
                      }
                      type="primary"
                      buttonStyle={styles.button}
                      onPress={() => {
                        formik.handleSubmit();
                      }}
                    />
                  )}
                  <DatePicker
                    modal
                    open={showDatePicker}
                    date={
                      formik.values.occasionDate
                        ? new Date(formik.values.occasionDate)
                        : date
                    }
                    mode="date"
                    maximumDate={new Date()}
                    onConfirm={selectedDate => {
                      const today = new Date();
                      if (selectedDate <= today) {
                        setShowDatePicker(false);
                        setDate(selectedDate);
                        const dateString = selectedDate
                          .toISOString()
                          .split('T')[0];
                        formik.setFieldValue('occasionDate', dateString, false);
                        formik.setFieldTouched('occasionDate', true, false);
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
