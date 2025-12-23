import React, { useState } from 'react';
import { View, StatusBar, FlatList, TouchableOpacity } from 'react-native';
import useStyles from './style.ts';
import { useNavigation } from '@react-navigation/native';
import { useLocaleStore } from '../../../store/reducer/locale';
import { useAuthStore } from '../../../store/reducer/auth';
import HomeHeader from '../../../components/global/HomeHeader.tsx';
import TabItem from '../../../components/global/TabItem.tsx';
import CustomButton from '../../../components/global/Custombutton.tsx';
import {
  SvgAddOccasion,
  SvgCrownIcon,
  SvgDateIcon,
  SvgEditGroup,
  SvgGalleryIcon,
  SvgBirthdayIcon,
} from '../../../assets/icons';
import InputField from '../../../components/global/InputField.tsx';
import { Formik } from 'formik';
import * as Yup from 'yup';
import DatePicker from 'react-native-date-picker';
import { Occasion } from '../../../types/index.ts';
import SkeletonLoader from '../../../components/SkeletonLoader/index.tsx';
import { useOccasions, OccasionFormValues } from './actions';
import { Text } from '../../../utils/elements.tsx';
import ConfirmationPopup from '../../../components/global/ConfirmationPopup';

const OccasionsScreen: React.FC = () => {
  const { styles, theme } = useStyles();
  const { getString } = useLocaleStore();
  const { user } = useAuthStore();
  const navigation = useNavigation();
  const [occasionToDelete, setOccasionToDelete] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const {
    loading,
    occasionsLoading,
    occasions,
    showDatePicker,
    setShowDatePicker,
    selectedOccasion,
    formInitialValues,
    date,
    isEditGroupOpen,
    setIsEditGroupOpen,
    handleImageSelect,
    getImageDisplayValue,
    formatDateForDisplay,
    handleSubmit,
    handleDeleteOccasion,
    handleEditPress,
    handleViewPress,
    handleCreatePress,
    handleBackPress,
    handleDatePickerConfirm,
  } = useOccasions();

  const confirmDeleteOccasion = () => {
    if (occasionToDelete) {
      handleDeleteOccasion(occasionToDelete.id);
      setOccasionToDelete(null);
    }
  };

  const validationSchema = Yup.object().shape({
    occasionName: Yup.string().required('required'),
    occasionDate: Yup.date().required('required'),
  });

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
        onBackPress={() => handleBackPress(navigation)}
      />
      {selectedOccasion.occasionType === 'none' && (
        <>
          {occasionsLoading ? (
            <View style={styles.content}>
              <SkeletonLoader screenType="occasionList" />
            </View>
          ) : (
            <FlatList
              data={[
                // Default Birthday entry - always at the top
                {
                  OccassionId: -1, // Special ID for default birthday
                  NameEn: 'My Birthday',
                  NameAr: 'عيد الميلاد',
                  OccasionDate: null,
                  Type: null,
                  ImageUrl: '',
                  Status: 1,
                  CreatedOn: '',
                  CreatedBy: 0,
                } as Occasion,
                ...(occasions || []),
              ]}
              keyExtractor={item => item.OccassionId.toString()}
              contentContainerStyle={styles.content}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }: { item: Occasion }) => {
                const isDefaultBirthday = item.OccassionId === -1;

                // For default birthday, show icon outside and make viewable
                if (isDefaultBirthday) {
                  return (
                    <TabItem
                      isGroupImage={require('../../../assets/images/birthday.png')}
                      title={item.NameEn}
                      isEditGroup={false} // Default birthday is not editable/deletable
                      onPress={() => handleViewPress(item)}
                      TabItemStyles={styles.TabItem}
                    />
                  );
                }

                // Regular occasions
                const imageSource = item.ImageUrl ? { uri: item.ImageUrl } : '';
                return (
                  <TabItem
                    isGroupImage={imageSource}
                    title={item.NameEn}
                    isEditGroup={isEditGroupOpen}
                    onEditPress={() => handleEditPress(item)}
                    onDeletePress={() =>
                      setOccasionToDelete({
                        id: item.OccassionId,
                        name: item.NameEn,
                      })
                    }
                    onPress={() => handleViewPress(item)}
                    TabItemStyles={styles.TabItem}
                  />
                );
              }}
            />
          )}
          {!occasionsLoading && (
            <View style={styles.buttonContainer}>
              <CustomButton
                title={getString('OCC_CREATE_OCCASION')}
                type="primary"
                icon={<SvgAddOccasion />}
                onPress={handleCreatePress}
              />
            </View>
          )}
        </>
      )}
      {selectedOccasion.occasionType !== 'none' && (
        <>
          <View style={styles.content}>
            {loading ? (
              <SkeletonLoader screenType="occasionView" />
            ) : (
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
                          placeholder: 'Event Name',
                          value: formik.values.occasionName,
                          onChangeText: (text: string) => {
                            formik.setFieldValue('occasionName', text, false);
                            formik.setFieldTouched('occasionName', true, false);
                          },
                          onBlur: () =>
                            formik.setFieldTouched('occasionName', true),
                          autoCapitalize: 'words',
                        }}
                      />
                    </View>
                    <View style={styles.inputContainer}>
                      <TouchableOpacity
                        onPress={() => {
                          if (selectedOccasion.occasionType !== 'view') {
                            setShowDatePicker(true);
                          }
                        }}
                      >
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
                            value:
                              selectedOccasion.occasionType === 'view' ||
                              selectedOccasion.occasionType === 'edit'
                                ? formatDateForDisplay(
                                    formik.values.occasionDate,
                                  )
                                : formik.values.occasionDate,
                            onChangeText: () => {},
                            onFocus: () =>
                              formik.setFieldTouched(
                                'occasionDate',
                                true,
                                false,
                              ),
                            editable: false,
                            pointerEvents: 'none',
                          }}
                        />
                      </TouchableOpacity>
                    </View>
                    {/* Hide image section for birthday */}
                    {selectedOccasion.id !== -1 && (
                      <View style={styles.inputContainer}>
                        {selectedOccasion.occasionType !== 'view' ? (
                          <TouchableOpacity
                            onPress={() => handleImageSelect(formik)}
                            activeOpacity={0.8}
                          >
                            <View style={styles.uploadImageContainer}>
                              <SvgGalleryIcon />
                              <Text style={styles.uploadButtonText}>
                                {getImageDisplayValue(formik.values.image) ||
                                  getString('OCC_IMAGE')}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        ) : (
                          <View style={styles.uploadImageContainer}>
                            <SvgGalleryIcon />
                            <Text style={styles.uploadButtonText}>
                              {getImageDisplayValue(formik.values.image) ||
                                getString('OCC_IMAGE')}
                            </Text>
                          </View>
                        )}
                      </View>
                    )}
                    {selectedOccasion.occasionType !== 'view' && (
                      <CustomButton
                        title={
                          selectedOccasion.occasionType === 'edit'
                            ? getString('OCC_SAVE')
                            : getString('OCC_CREATE')
                        }
                        type="primary"
                        buttonStyle={styles.button}
                        onPress={() => formik.handleSubmit()}
                      />
                    )}
                    <DatePicker
                      modal
                      open={showDatePicker}
                      date={
                        selectedOccasion.occasionType === 'edit' && date
                          ? date
                          : formik.values.occasionDate
                          ? new Date(formik.values.occasionDate)
                          : date
                      }
                      mode="date"
                      onConfirm={selectedDate =>
                        handleDatePickerConfirm(selectedDate, formik)
                      }
                      onCancel={() => setShowDatePicker(false)}
                      theme="light"
                    />
                  </>
                )}
              </Formik>
            )}
          </View>
        </>
      )}

      <ConfirmationPopup
        visible={!!occasionToDelete}
        title="Delete Occasion"
        message={`Are you sure you want to delete "${occasionToDelete?.name}"?`}
        confirmText="Delete"
        cancelText={getString('NG_CANCEL') || 'Cancel'}
        onConfirm={confirmDeleteOccasion}
        onCancel={() => setOccasionToDelete(null)}
      />
    </View>
  );
};
export default OccasionsScreen;
