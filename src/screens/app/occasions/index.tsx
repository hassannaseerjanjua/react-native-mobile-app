import React from 'react';
import { View, StatusBar, FlatList, TouchableOpacity } from 'react-native';
import useStyles from './style.ts';
import { useNavigation } from '@react-navigation/native';
import { useLocaleStore } from '../../../store/reducer/locale';
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

const OccasionsScreen: React.FC = () => {
  const { styles, theme } = useStyles();
  const { getString } = useLocaleStore();
  const navigation = useNavigation();
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
                  NameEn: 'Birthday',
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

                // For default birthday, use birthday.png image
                if (isDefaultBirthday) {
                  return (
                    <TabItem
                      isGroupImage={require('../../../assets/images/birthday.png')}
                      title={item.NameEn}
                      isEditGroup={false} // Default birthday is not editable/deletable
                      onPress={() => {
                        // Default birthday is not clickable for view/edit
                        // Can add custom behavior here if needed
                      }}
                      TabItemStyles={styles.TabItem}
                    />
                  );
                }

                // Regular occasions
                const imageSource = item.ImageUrl
                  ? { uri: item.ImageUrl }
                  : require('../../../assets/images/birthday.png');
                return (
                  <TabItem
                    isGroupImage={imageSource}
                    title={item.NameEn}
                    isEditGroup={isEditGroupOpen}
                    onEditPress={() => handleEditPress(item)}
                    onDeletePress={() => handleDeleteOccasion(item.OccassionId)}
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
                          placeholder: getString('OCC_EVENT'),
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
                              selectedOccasion.occasionType === 'view'
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
                        onPress={() => formik.handleSubmit()}
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
                      onConfirm={selectedDate =>
                        handleDatePickerConfirm(selectedDate, formik)
                      }
                      onCancel={() => setShowDatePicker(false)}
                      theme="light"
                      style={{ backgroundColor: theme.colors.BACKGROUND }}
                    />
                  </>
                )}
              </Formik>
            )}
          </View>
        </>
      )}
    </View>
  );
};
export default OccasionsScreen;
