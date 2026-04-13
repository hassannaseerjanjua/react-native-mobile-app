import { useState } from 'react';
import { useDispatch } from 'react-redux';
import api from '../../../utils/api';
import apiEndpoints from '../../../constants/api-endpoints';
import notify from '../../../utils/notify';
import {
  Occasion,
  OccasionsApiResponse,
  UpdateProfileApiResponse,
} from '../../../types/index.ts';
import { useLocaleStore } from '../../../store/reducer/locale';
import { login, useAuthStore } from '../../../store/reducer/auth';
import { selectAndCropImage } from '../../../utils/imageCropper';
import { useListingApi } from '../../../hooks/useListingApi';

export interface ImageFile {
  uri: string;
  type: string;
  name: string;
}

export type ImageValue = string | ImageFile | null;

export interface OccasionFormValues {
  occasionName: string;
  occasionDate: string;
  image: ImageValue;
}

export interface OccasionDetailResponse {
  occasionName: string;
  occasionDate: string;
  image: ImageValue;
  date?: Date;
}

export interface SelectedOccasion {
  id: number | null;
  occasionType: 'view' | 'edit' | 'none' | 'create';
}

export interface FormInitialValues {
  occasionName: string;
  occasionDate: string;
  image: ImageValue;
}

export const getOccasionDetail = async (
  id: number,
  errorMessage: string,
): Promise<OccasionDetailResponse | null> => {
  if (!id) return null;
  try {
    const response = await api.get(apiEndpoints.GET_OCCASION_DETAIL(id));
    if (!response.success || !response.data) return null;
    const occasionData = (response.data as any)?.Data;
    if (!occasionData) {
      notify.error(response.error || errorMessage);
      return null;
    }
    const result: OccasionDetailResponse = {
      occasionName: occasionData.NameEn || '',
      occasionDate: occasionData.OccasionDate || '',
      image: occasionData.ImageUrl || null,
    };
    if (occasionData.OccasionDate) {
      result.date = new Date(occasionData.OccasionDate);
    }
    return result;
  } catch (error: any) {
    notify.error(error?.error || errorMessage);
    return null;
  }
};

export const createOccasion = async (
  values: OccasionFormValues,
  errorMessage: string,
): Promise<boolean> => {
  try {
    const formData = new FormData();
    formData.append('NameEn', values.occasionName);
    formData.append('NameAr', values.occasionName);
    formData.append('OccasionDate', values.occasionDate);
    if (values.image && typeof values.image === 'object' && values.image.uri) {
      const img = values.image as {
        uri: string;
        type?: string;
        name?: string;
        fileName?: string;
      };
      formData.append('ImageUrl', {
        uri: img.uri,
        type: img.type || 'image/jpeg',
        name: img.name || img.fileName || `occasion_image_${Date.now()}.jpg`,
      } as any);
    }
    const response = await api.post(apiEndpoints.CREATE_OCCASION, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    if (response.success) return true;
    if (response.failed) notify.error(response.error || errorMessage);
    return false;
  } catch (error: any) {
    notify.error(error?.error || errorMessage);
    return false;
  }
};

export const updateOccasion = async (
  id: number,
  values: OccasionFormValues,
  errorMessage: string,
): Promise<boolean> => {
  try {
    const formData = new FormData();
    formData.append('OccassionId', id.toString());
    formData.append('NameEn', values.occasionName);
    formData.append('OccasionDate', values.occasionDate);
    if (values.image && typeof values.image === 'object' && values.image.uri) {
      const img = values.image as {
        uri: string;
        type?: string;
        name?: string;
        fileName?: string;
      };
      formData.append('ImageUrl', {
        uri: img.uri,
        type: img.type || 'image/jpeg',
        name: img.name || img.fileName || `occasion_image_${Date.now()}.jpg`,
      } as any);
    }
    const response = await api.put(apiEndpoints.UPDATE_OCCASION(id), formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    if (response.success) return true;
    if (response.failed) notify.error(response.error || errorMessage);
    return false;
  } catch (error: any) {
    notify.error(error?.error || errorMessage);
    return false;
  }
};

export const deleteOccasion = async (
  occasionId: number,
  errorMessage: string,
): Promise<boolean> => {
  try {
    const response = await api.delete(apiEndpoints.DELETE_OCCASION(occasionId));
    if (response.success) return true;
    notify.error(response.error || errorMessage);
    return false;
  } catch (error: any) {
    notify.error(error?.error || errorMessage);
    return false;
  }
};

export const useOccasions = () => {
  const { getString, langCode } = useLocaleStore();
  const { user, token } = useAuthStore();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedOccasion, setSelectedOccasion] = useState<SelectedOccasion>({
    id: null,
    occasionType: 'none',
  });
  const [formInitialValues, setFormInitialValues] = useState<FormInitialValues>(
    {
      occasionName: '',
      occasionDate: '',
      image: null,
    },
  );
  const [date, setDate] = useState(new Date());
  const [isEditGroupOpen, setIsEditGroupOpen] = useState(false);
  const [readonlyIcon, setReadonlyIcon] = useState<any>(null);

  const occasionsListing = useListingApi<Occasion>(
    apiEndpoints.GET_OCCASIONS,
    token,
    {
      pageSize: 15,
      idExtractor: (item: Occasion) => item.OccassionId,
      transformData: (res: OccasionsApiResponse | any) => ({
        data: res?.Data?.Items ?? [],
        totalCount: res?.Data?.TotalCount ?? 0,
      }),
    },
  );

  const occasions = occasionsListing.data ?? [];
  const occasionsLoading = occasionsListing.loading;
  const occasionsInitialLoad = occasionsListing.isInitialLoad;
  const loadingMore = occasionsListing.loadingMore;
  const hasMore = occasionsListing.hasMore;
  const fetchOccasions = () => occasionsListing.recall();
  const loadMore = () => occasionsListing.loadMore();

  const handleImageSelect = async (formik: any) => {
    try {
      // Use WhatsApp-like cropper with circular overlay for square crop
      const croppedImage = await selectAndCropImage({
        cropSize: 400,
        circularOverlay: true, // Round overlay like WhatsApp
        fileNamePrefix: 'occasion_image',
        compress: true,
        compressionQuality: 0.2, // High compression for occasions
        maxWidth: 800,
        maxHeight: 800,
      });

      if (croppedImage) {
        const imageFile: ImageFile = {
          uri: croppedImage.uri,
          type: croppedImage.type,
          name: croppedImage.name,
        };
        formik.setFieldValue('image', imageFile, false);
        formik.setFieldTouched('image', true, false);
      }
    } catch (error) {
      console.error('Error selecting/cropping image:', error);
    }
  };

  const getImageDisplayValue = (image: ImageValue): string => {
    if (!image) return '';
    if (typeof image === 'string') {
      if (image.startsWith('http') || image.length > 50) {
        return getString('OCC_CURRENT_IMAGE');
      }
      return image;
    }
    return image.name || getString('OCC_IMAGE_SELECTED');
  };

  const formatDateForDisplay = (dateString: string): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      const locale = langCode === 'ar' ? 'ar-SA' : 'en-US';
      const day = date.getDate();
      const month = date.toLocaleDateString(locale, { month: 'long' });
      const year = date.getFullYear();
      return `${day} ${month} ${year}`;
    } catch {
      return dateString;
    }
  };

  const handleSubmit = async (values: OccasionFormValues) => {
    if (loading) return;
    setLoading(true);
    const errorMsg = getString('AU_ERROR_OCCURRED');
    let success = false;
    try {
      if (selectedOccasion.occasionType === 'create') {
        success = await createOccasion(values, errorMsg);
      } else if (selectedOccasion.id === -1) {
        // Birthday: call settings API
        if (!user || !token) return;
        const formData = new FormData();
        formData.append('Fullname', user.FullNameEn || '');
        formData.append('CityId', String(user.CityId || ''));
        formData.append('Dob', values.occasionDate);
        formData.append('GenderId', String(user.GenderId || ''));
        const response = await api.put<UpdateProfileApiResponse>(
          apiEndpoints.UPDATE_PROFILE,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } },
        );
        if (response.success && response.data?.Data && token) {
          dispatch(login({ user: { ...user, ...response.data.Data }, token }));
          notify.success(getString('PROFILE_UPDATED_SUCCESSFULLY'));
          success = true;
        } else if (response.failed) {
          notify.error(response.error || errorMsg);
        }
      } else if (selectedOccasion.id) {
        success = await updateOccasion(selectedOccasion.id, values, errorMsg);
      }
      if (success) {
        await fetchOccasions();
        setSelectedOccasion({ id: null, occasionType: 'none' });
        setReadonlyIcon(null);
        setIsEditGroupOpen(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOccasion = async (occasionId: number) => {
    if (loading) return;
    setLoading(true);
    const success = await deleteOccasion(
      occasionId,
      getString('AU_ERROR_OCCURRED'),
    );
    if (success) await fetchOccasions();
    setLoading(false);
  };

  const handleGetOccasionDetail = async (id: number) => {
    if (!id || id === -1) return; // Skip API call for birthday
    setLoading(true);
    const result = await getOccasionDetail(id, getString('AU_ERROR_OCCURRED'));
    if (result) {
      setFormInitialValues({
        occasionName: result.occasionName,
        occasionDate: result.occasionDate,
        image: result.image,
      });
      if (result.date) setDate(result.date);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setFormInitialValues({ occasionName: '', occasionDate: '', image: null });
  };

  const handleEditPress = async (item: Occasion) => {
    setSelectedOccasion({ occasionType: 'edit', id: item.OccassionId });
    if (item.OccassionId === -1) {
      const birthdayDate = user?.DateOfBirth || '';
      setFormInitialValues({
        occasionName: getString('OCCASSIONS_MY_BIRTHDAY'),
        occasionDate: birthdayDate,
        image: null,
      });
      setDate(birthdayDate ? new Date(birthdayDate) : new Date());
      setReadonlyIcon('birthday');
    } else {
      setReadonlyIcon(null);
      await handleGetOccasionDetail(item.OccassionId);
    }
  };

  const handleViewPress = async (item: Occasion) => {
    if (!isEditGroupOpen) {
      // Handle birthday special case
      if (item.OccassionId === -1) {
        setSelectedOccasion({ occasionType: 'view', id: -1 });
        // Set birthday form values
        const birthdayDate = user?.DateOfBirth || '';
        setFormInitialValues({
          occasionName: 'My Birthday',
          occasionDate: birthdayDate,
          image: null, // No image for birthday
        });
        if (birthdayDate) {
          setDate(new Date(birthdayDate));
        }
      } else {
        setSelectedOccasion({ occasionType: 'view', id: item.OccassionId });
        await handleGetOccasionDetail(item.OccassionId);
      }
    }
  };

  const handleCreatePress = () => {
    setSelectedOccasion({ id: null, occasionType: 'create' });
    setReadonlyIcon(null);
    resetForm();
  };

  const handleBackPress = (navigation: any) => {
    if (isEditGroupOpen) {
      setIsEditGroupOpen(false);
    } else if (selectedOccasion.occasionType === 'none') {
      navigation.goBack();
    } else {
      setSelectedOccasion({ id: null, occasionType: 'none' });
      setReadonlyIcon(null);
      resetForm();
    }
  };

  const handleDatePickerConfirm = (selectedDate: Date, formik: any) => {
    setShowDatePicker(false);
    setDate(selectedDate);
    const dateString = selectedDate.toISOString().split('T')[0];
    formik.setFieldValue('occasionDate', dateString, true);
    formik.setFieldTouched('occasionDate', true, false);
  };

  return {
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
  };
};
