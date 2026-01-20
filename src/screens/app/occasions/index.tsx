import React, { useState } from 'react';
import { View, StatusBar, FlatList, TouchableOpacity } from 'react-native';
import useStyles from './style.ts';
import { useNavigation } from '@react-navigation/native';
import { useLocaleStore } from '../../../store/reducer/locale';
import { useAuthStore } from '../../../store/reducer/auth';
import HomeHeader from '../../../components/global/HomeHeader.tsx';
import TabItem from '../../../components/global/TabItem.tsx';
import CustomButton from '../../../components/global/Custombutton.tsx';
import { Image } from 'react-native';
import {
  SvgAddOccasion,
  SvgCrownIcon,
  SvgDateIcon,
  SvgEditGroup,
  SvgGalleryIcon,
  SvgBirthdayIcon,
  SvgOccasionIcon,
} from '../../../assets/icons';
import InputField from '../../../components/global/InputField.tsx';
import { Formik } from 'formik';
import * as Yup from 'yup';
import DatePicker from 'react-native-date-picker';
import { Occasion } from '../../../types/index.ts';
import SkeletonLoader from '../../../components/SkeletonLoader/index.tsx';
import { useOccasions, OccasionFormValues } from './actions';
import { Text } from '../../../utils/elements.tsx';
import { scaleWithMax } from '../../../utils';
import ConfirmationPopup from '../../../components/global/ConfirmationPopup';

const OccasionsScreen: React.FC = () => {
  const { styles, theme } = useStyles();
  const { getString } = useLocaleStore();
  const { user } = useAuthStore();
  const navigation = useNavigation();
  const [occasionToDelete, setOccasionToDelete] = useState<Occasion | null>(
    null,
  );
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [expandedOccasionId, setExpandedOccasionId] = useState<number | null>(
    null,
  );
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
    if (!occasionToDelete) return;

    const occasion = occasionToDelete;
    setShowDeleteModal(false);
    handleDeleteOccasion(occasion.OccassionId);
    setOccasionToDelete(null);
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
            : getString('OCC_EDIT_OCCASION')
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
          if (expandedOccasionId !== null) {
            setExpandedOccasionId(null);
          } else {
            handleBackPress(navigation);
          }
        }}
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
                const isExpanded = expandedOccasionId === item.OccassionId;
                const formattedDate =
                  isDefaultBirthday && user?.DateOfBirth
                    ? formatDateForDisplay(user.DateOfBirth)
                    : item.OccasionDate && item.OccasionDate !== 'null'
                    ? formatDateForDisplay(item.OccasionDate)
                    : null;

                // For default birthday, show icon outside and make viewable
                if (isDefaultBirthday) {
                  return (
                    <TabItem
                      isGroupImage={require('../../../assets/images/birthday.png')}
                      title={item.NameEn}
                      subtitle={
                        isExpanded ? formattedDate || undefined : undefined
                      }
                      isEditGroup={false} // Default birthday is not editable/deletable
                      hideRightIcon={isExpanded}
                      onPress={() => {
                        if (isExpanded) {
                          setExpandedOccasionId(null);
                        } else {
                          setExpandedOccasionId(item.OccassionId);
                        }
                      }}
                      TabItemStyles={styles.TabItem}
                      TabTextStyles={styles.TabText}
                    />
                  );
                }

                // Regular occasions
                const imageSource = item.ImageUrl
                  ? { uri: item.ImageUrl }
                  : require('../../../assets/images/img-placeholder.png');
                return (
                  <TabItem
                    isGroupImage={imageSource}
                    title={item.NameEn}
                    subtitle={
                      isExpanded ? formattedDate || undefined : undefined
                    }
                    isEditGroup={isEditGroupOpen}
                    hideRightIcon={isExpanded}
                    onEditPress={() => handleEditPress(item)}
                    onDeletePress={() => {
                      setOccasionToDelete(item);
                      setShowDeleteModal(true);
                    }}
                    onPress={() => {
                      if (!isEditGroupOpen) {
                        if (isExpanded) {
                          setExpandedOccasionId(null);
                        } else {
                          setExpandedOccasionId(item.OccassionId);
                        }
                      }
                    }}
                    TabTextStyles={styles.TabText}
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
      {selectedOccasion.occasionType !== 'none' &&
        selectedOccasion.occasionType !== 'view' && (
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
                          icon={
                            <TouchableOpacity
                              onPress={() => handleImageSelect(formik)}
                              activeOpacity={0.7}
                              style={{
                                marginLeft: -scaleWithMax(5, 6),
                                marginRight: -scaleWithMax(2, 3),
                              }}
                            >
                              {formik.values.image &&
                              typeof formik.values.image === 'object' &&
                              formik.values.image.uri ? (
                                <Image
                                  source={{ uri: formik.values.image.uri }}
                                  style={{
                                    width: scaleWithMax(30, 34),
                                    height: scaleWithMax(30, 34),
                                    borderRadius: scaleWithMax(14, 16),
                                  }}
                                  resizeMode="cover"
                                />
                              ) : formik.values.image &&
                                typeof formik.values.image === 'string' &&
                                formik.values.image ? (
                                <Image
                                  source={{ uri: formik.values.image }}
                                  style={{
                                    width: scaleWithMax(30, 34),
                                    height: scaleWithMax(30, 34),
                                    borderRadius: scaleWithMax(14, 16),
                                  }}
                                  resizeMode="cover"
                                />
                              ) : (
                                <SvgOccasionIcon
                                  width={scaleWithMax(30, 34)}
                                  height={scaleWithMax(30, 34)}
                                />
                              )}
                            </TouchableOpacity>
                          }
                          fieldProps={{
                            placeholder: 'Event Name',
                            value: formik.values.occasionName,
                            editable: true,
                            onChangeText: (text: string) => {
                              formik.setFieldValue('occasionName', text, false);
                              formik.setFieldTouched(
                                'occasionName',
                                true,
                                false,
                              );
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
                            setShowDatePicker(true);
                          }}
                        >
                          <InputField
                            error={
                              formik.touched.occasionDate &&
                              formik.errors.occasionDate
                                ? formik.errors.occasionDate
                                : undefined
                            }
                            icon={
                              <SvgDateIcon
                                width={scaleWithMax(24, 26)}
                                height={scaleWithMax(24, 26)}
                              />
                            }
                            fieldProps={{
                              placeholder: getString('OCC_DATE'),
                              value:
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
                      <CustomButton
                        title={
                          selectedOccasion.occasionType === 'edit'
                            ? getString('OCC_SAVE')
                            : getString('OCC_CREATE')
                        }
                        type="primary"
                        buttonStyle={styles.button}
                        onPress={() => formik.handleSubmit()}
                        loading={loading}
                        disabled={loading}
                      />
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
        visible={showDeleteModal}
        title="Delete Occasion"
        message={`Are you sure you want to delete "${occasionToDelete?.NameEn}"?`}
        confirmText="Delete"
        cancelText={getString('NG_CANCEL') || 'Cancel'}
        onConfirm={confirmDeleteOccasion}
        onCancel={() => {
          setShowDeleteModal(false);
          setOccasionToDelete(null);
        }}
      />
    </View>
  );
};
export default OccasionsScreen;
