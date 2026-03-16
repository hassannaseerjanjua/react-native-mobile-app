import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  StatusBar,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import useStyles from './style.ts';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useLocaleStore } from '../../../store/reducer/locale';
import { useAuthStore } from '../../../store/reducer/auth';
import HomeHeader from '../../../components/global/HomeHeader.tsx';
import TabItem from '../../../components/global/TabItem.tsx';
import CustomButton from '../../../components/global/Custombutton.tsx';
import { Image } from '../../../utils/elements';
import {
  SvgAddOccasion,
  SvgCrownIcon,
  SvgDateIcon,
  SvgEditGroup,
  SvgGalleryIcon,
  SvgBirthdayIcon,
  SvgOccasionIcon,
  SvgPencilIcon,
  SvgCancelIcon,
  PlusIcon,
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
import PlaceholderLogoText from '../../../components/global/PlaceholderLogoText.tsx';

const BIRTHDAY_IMAGE = require('../../../assets/images/birthday.png');

const COLLAPSED_HEIGHT = scaleWithMax(52, 56);
const ANIM_DURATION = 220;

const AnimatedOccasionItem: React.FC<{
  children: React.ReactNode;
  isExpanded: boolean;
  expandedHeight: number;
}> = ({ children, isExpanded, expandedHeight }) => {
  const expandProgress = useSharedValue(isExpanded ? 1 : 0);

  useEffect(() => {
    expandProgress.value = withTiming(isExpanded ? 1 : 0, {
      duration: ANIM_DURATION,
    });
  }, [isExpanded, expandProgress]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: interpolate(
      expandProgress.value,
      [0, 1],
      [COLLAPSED_HEIGHT, expandedHeight],
    ),
  }));

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
};

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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const {
    loading,
    occasionsLoading,
    occasionsInitialLoad,
    occasions,
    loadingMore,
    hasMore,
    loadMore,
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
    handleGetOccasionDetail,
    handleEditPress,
    handleViewPress,
    handleCreatePress,
    handleBackPress,
    handleDatePickerConfirm,
    fetchOccasions,
    readonlyIcon,
  } = useOccasions();

  // Refetch occasions when screen comes into focus (e.g., after returning from image viewer)
  useFocusEffect(
    useCallback(() => {
      if (selectedOccasion.occasionType === 'none') {
        // Refetch occasions list when in main list view
        fetchOccasions();
      } else if (
        selectedOccasion.occasionType === 'edit' &&
        selectedOccasion.id
      ) {
        // Refetch occasion detail when in edit mode to update the image
        handleGetOccasionDetail(selectedOccasion.id);
      }
    }, [selectedOccasion.occasionType, selectedOccasion.id]),
  );

  useEffect(() => {
    if (isRefreshing && !occasionsLoading) {
      setIsRefreshing(false);
    }
  }, [isRefreshing, occasionsLoading]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchOccasions();
  };

  const confirmDeleteOccasion = () => {
    if (!occasionToDelete) return;

    const occasion = occasionToDelete;
    setShowDeleteModal(false);
    handleDeleteOccasion(occasion.OccassionId);
    setTimeout(() => setOccasionToDelete(null), 300);
  };

  const validationSchema = useMemo(
    () =>
      Yup.object().shape({
        occasionName: Yup.string()
          .required(getString('OCCASIONS_REQUIRED'))
          .test(
            'not-whitespace',
            getString('OCCASIONS_REQUIRED'),
            val => !val || val.trim().length > 0,
          ),
        occasionDate: Yup.date().required(getString('OCCASIONS_REQUIRED')),
      }),
    [getString],
  );

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
        rightSideTitlePress={() => setIsEditGroupOpen(!isEditGroupOpen)}
        rightSideIcon={
          selectedOccasion.occasionType === 'none' ? (
            !isEditGroupOpen ? (
              <SvgEditGroup
                width={scaleWithMax(18, 18)}
                height={scaleWithMax(18, 18)}
              />
            ) : (
              <SvgCancelIcon
                width={scaleWithMax(18, 18)}
                height={scaleWithMax(18, 18)}
              />
            )
          ) : undefined
        }
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
          {occasionsLoading && !isRefreshing ? (
            <View style={styles.content}>
              <SkeletonLoader screenType="occasionList" />
            </View>
          ) : (
            <FlatList
              data={[
                {
                  OccassionId: -1,
                  NameEn: getString('OCCASSIONS_MY_BIRTHDAY'),
                  NameAr: getString('OCCASSIONS_MY_BIRTHDAY'),
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
              // ItemSeparatorComponent={() => (
              //   <View style={styles.occasionItemSpacing} />
              // )}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={handleRefresh}
                  tintColor={theme.colors.PRIMARY}
                  colors={[theme.colors.PRIMARY]}
                />
              }
              onEndReached={() => {
                if (hasMore && !loadingMore) loadMore();
              }}
              onEndReachedThreshold={0.5}
              ListFooterComponent={
                loadingMore ? (
                  <View
                    style={{
                      paddingVertical: theme.sizes.PADDING,
                      alignItems: 'center',
                    }}
                  >
                    <ActivityIndicator
                      size="small"
                      color={theme.colors.PRIMARY}
                    />
                  </View>
                ) : null
              }
              ListEmptyComponent={() => {
                if (!occasionsInitialLoad) return null;
                return (
                  <View style={{ height: theme.sizes.HEIGHT * 0.68 }}>
                    <PlaceholderLogoText
                      text={getString('OCCASIONS_NO_OCCASIONS_FOUND')}
                    />
                  </View>
                );
              }}
              renderItem={({ item }: { item: Occasion }) => {
                const isDefaultBirthday = item.OccassionId === -1;
                const isExpanded = expandedOccasionId === item.OccassionId;
                const formattedDate =
                  isDefaultBirthday && user?.DateOfBirth
                    ? formatDateForDisplay(user.DateOfBirth)
                    : item.OccasionDate && item.OccasionDate !== 'null'
                      ? formatDateForDisplay(item.OccasionDate)
                      : null;

                // For default birthday, same flow as other occasions
                if (isDefaultBirthday) {
                  const canEditBirthday = !user?.IsBirthdayUpdated;
                  return (
                    <AnimatedOccasionItem
                      isExpanded={isExpanded}
                      expandedHeight={theme.sizes.HEIGHT * 0.075}
                    >
                      <TabItem
                        isGroupImage={BIRTHDAY_IMAGE}
                        title={item.NameEn}
                        subtitle={
                          isExpanded
                            ? formattedDate ||
                            (!user?.DateOfBirth
                              ? getString('OCC_BIRTHDAY_NOT_SET')
                              : undefined)
                            : undefined
                        }
                        isEditGroup={isEditGroupOpen && canEditBirthday}
                        editOnly={true}
                        hideRightIcon={false}
                        rightIconRotated={isExpanded}
                        onEditPress={() =>
                          handleEditPress(item, BIRTHDAY_IMAGE)
                        }
                        onDeletePress={() => { }}
                        onPress={() => {
                          if (!isEditGroupOpen) {
                            if (isExpanded) {
                              setExpandedOccasionId(null);
                            } else {
                              setExpandedOccasionId(item.OccassionId);
                            }
                          }
                        }}
                        TabItemStyles={styles.TabItem}
                        TabTextStyles={styles.TabText}
                      />
                    </AnimatedOccasionItem>
                  );
                }

                // Regular occasions
                const imageSource = item.ImageUrl
                  ? { uri: item.ImageUrl }
                  : require('../../../assets/images/img-placeholder.png');
                const imageUri = item.ImageUrl || null;
                return (
                  <AnimatedOccasionItem
                    isExpanded={isExpanded}
                    expandedHeight={theme.sizes.HEIGHT * 0.075}
                  >
                    <TabItem
                      isGroupImage={imageSource}
                      title={item.NameEn}
                      subtitle={
                        isExpanded ? formattedDate || undefined : undefined
                      }
                      isEditGroup={isEditGroupOpen}
                      hideRightIcon={false}
                      rightIconRotated={isExpanded}
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
                  </AnimatedOccasionItem>
                );
              }}
            />
          )}
          {!occasionsLoading && (
            <View style={styles.buttonContainer}>
              <CustomButton
                title={getString('OCC_CREATE_OCCASION')}
                type="primary"
                icon={<SvgAddOccasion style={{ marginBottom: theme.sizes.PADDING * 0.18 }} />}
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
                            readonlyIcon ? (
                              <View
                                style={{
                                  marginLeft: -scaleWithMax(5, 6),
                                  marginRight: -scaleWithMax(2, 3),
                                }}
                              >
                                <Image
                                  source={readonlyIcon}
                                  style={{
                                    width: scaleWithMax(30, 34),
                                    height: scaleWithMax(30, 34),
                                    borderRadius: scaleWithMax(14, 16),
                                  }}
                                  resizeMode="cover"
                                />
                              </View>
                            ) : (
                              <TouchableOpacity
                                onPress={() => {
                                  const imageUri =
                                    formik.values.image &&
                                      typeof formik.values.image === 'object' &&
                                      formik.values.image.uri
                                      ? formik.values.image.uri
                                      : formik.values.image &&
                                        typeof formik.values.image ===
                                        'string' &&
                                        formik.values.image
                                        ? formik.values.image
                                        : null;

                                  if (imageUri) {
                                    const isLocalOnly =
                                      selectedOccasion.occasionType ===
                                      'create' || !selectedOccasion.id;
                                    (navigation as any).navigate(
                                      'ProfileImageViewer',
                                      {
                                        imageUri: imageUri,
                                        placeholderImage: require('../../../assets/images/img-placeholder.png'),
                                        title:
                                          formik.values.occasionName ||
                                          getString('OCC_EDIT_OCCASION'),
                                        occasionId: selectedOccasion.id,
                                        occasionName:
                                          formik.values.occasionName,
                                        occasionDate:
                                          formik.values.occasionDate,
                                        isLocalOnly,
                                        onImageUpdate: isLocalOnly
                                          ? (result: {
                                            type: 'update' | 'delete';
                                            asset?: {
                                              uri: string;
                                              type?: string;
                                              name?: string;
                                            };
                                          }) => {
                                            if (
                                              result.type === 'update' &&
                                              result.asset
                                            ) {
                                              formik.setFieldValue('image', {
                                                uri: result.asset.uri,
                                                type:
                                                  result.asset.type ||
                                                  'image/jpeg',
                                                name:
                                                  result.asset.name ||
                                                  `occasion_image_${Date.now()}.jpg`,
                                              });
                                            } else if (
                                              result.type === 'delete'
                                            ) {
                                              formik.setFieldValue(
                                                'image',
                                                null,
                                              );
                                            }
                                          }
                                          : undefined,
                                      },
                                    );
                                  } else {
                                    handleImageSelect(formik);
                                  }
                                }}
                                activeOpacity={0.7}
                                style={{
                                  marginLeft: -scaleWithMax(5, 6),
                                  marginRight: -scaleWithMax(2, 3),
                                }}
                              >
                                <View style={{ position: 'relative' }}>
                                  {formik.values.image &&
                                    typeof formik.values.image === 'object' &&
                                    formik.values.image.uri ? (
                                    <Image
                                      source={{
                                        uri: formik.values.image.uri,
                                      }}
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
                                  <View style={styles.pencilIconContainer}>
                                    <SvgPencilIcon
                                      width={scaleWithMax(8, 10)}
                                      height={scaleWithMax(8, 10)}
                                    />
                                  </View>
                                </View>
                              </TouchableOpacity>
                            )
                          }
                          fieldProps={{
                            placeholder: getString('OCC_EVENT_NAME'),
                            value: formik.values.occasionName,
                            editable: !readonlyIcon,
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
                            ...(readonlyIcon && {
                              style: { color: theme.colors.SECONDARY_TEXT },
                              pointerEvents: 'none' as const,
                            }),
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
                              onChangeText: () => { },
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
                        maximumDate={
                          selectedOccasion.id === -1 ? new Date() : undefined
                        }
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
        title={getString('OCCASIONS_DELETE_OCCASION')}
        message={getString('OCCASIONS_DELETE_CONFIRM_MESSAGE').replace(
          '{value}',
          occasionToDelete?.NameEn || '',
        )}
        confirmText={getString('OCCASIONS_DELETE')}
        cancelText={getString('NG_CANCEL')}
        onConfirm={confirmDeleteOccasion}
        onCancel={() => {
          setShowDeleteModal(false);
          setTimeout(() => setOccasionToDelete(null), 300);
        }}
      />
    </View>
  );
};
export default OccasionsScreen;
