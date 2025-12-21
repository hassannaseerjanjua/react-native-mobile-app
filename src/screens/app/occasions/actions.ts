import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import api from '../../../utils/api';
import apiEndpoints from '../../../constants/api-endpoints';
import notify from '../../../utils/notify';
import { Occasion, OccasionsApiResponse } from '../../../types/index.ts';
import { getAuthHeader } from '../../../utils/api';
import { useLocaleStore } from '../../../store/reducer/locale';

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

export const getOccasions = async (): Promise<Occasion[]> => {
  try {
    const response = await api.get<OccasionsApiResponse>(
      apiEndpoints.GET_OCCASIONS,
      getAuthHeader('Token'),
    );
    return response.success && response.data?.Data?.Items
      ? response.data.Data.Items
      : [];
  } catch (error: any) {
    return [];
  }
};

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
    if (values.image && typeof values.image === 'object') {
      formData.append('ImageUrl', {
        uri: values.image.uri,
        type: values.image.type,
        name: values.image.name,
      } as any);
    }
    const response = await api.post(apiEndpoints.CREATE_OCCASION, formData, {});
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
    if (values.image && typeof values.image === 'object') {
      formData.append('ImageUrl', {
        uri: values.image.uri,
        type: values.image.type,
        name: values.image.name,
      } as any);
    }
    const response = await api.put(
      apiEndpoints.UPDATE_OCCASION(id),
      formData,
      {},
    );
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
  const [loading, setLoading] = useState(false);
  const [occasionsLoading, setOccasionsLoading] = useState(false);
  const [occasions, setOccasions] = useState<Occasion[]>([]);
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

  const fetchOccasions = async () => {
    setOccasionsLoading(true);
    const data = await getOccasions();
    setOccasions(data);
    setOccasionsLoading(false);
  };

  useEffect(() => {
    fetchOccasions();
  }, []);

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
        if (response.assets?.[0]) {
          const asset = response.assets[0];
          const imageFile: ImageFile = {
            uri:
              Platform.OS === 'ios'
                ? asset.uri?.replace('file://', '') || ''
                : asset.uri || '',
            type: asset.type || 'image/jpeg',
            name: asset.fileName || `occasion_image_${Date.now()}.jpg`,
          };
          formik.setFieldValue('image', imageFile, false);
          formik.setFieldTouched('image', true, false);
        }
      },
    );
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
    const errorMsg = getString('AU_ERROR_OCCURRED');
    let success = false;
    if (selectedOccasion.occasionType === 'create') {
      success = await createOccasion(values, errorMsg);
    } else if (selectedOccasion.id) {
      success = await updateOccasion(selectedOccasion.id, values, errorMsg);
    }
    if (success) {
      await fetchOccasions();
      setSelectedOccasion({ id: null, occasionType: 'none' });
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
    if (!id) return;
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
    await handleGetOccasionDetail(item.OccassionId);
  };

  const handleViewPress = async (item: Occasion) => {
    if (!isEditGroupOpen) {
      setSelectedOccasion({ occasionType: 'view', id: item.OccassionId });
      await handleGetOccasionDetail(item.OccassionId);
    }
  };

  const handleCreatePress = () => {
    setSelectedOccasion({ id: null, occasionType: 'create' });
    resetForm();
  };

  const handleBackPress = (navigation: any) => {
    if (isEditGroupOpen) {
      setIsEditGroupOpen(false);
    } else if (selectedOccasion.occasionType === 'none') {
      navigation.goBack();
    } else {
      setSelectedOccasion({ id: null, occasionType: 'none' });
      resetForm();
    }
  };

  const handleDatePickerConfirm = (selectedDate: Date, formik: any) => {
    const today = new Date();
    // Set today's time to 00:00:00 for accurate comparison
    today.setHours(0, 0, 0, 0);
    const selected = new Date(selectedDate);
    selected.setHours(0, 0, 0, 0);

    // Only accept future dates (dates after today)

    setShowDatePicker(false);
    setDate(selectedDate);
    const dateString = selectedDate.toISOString().split('T')[0];
    formik.setFieldValue('occasionDate', dateString, false);
    formik.setFieldTouched('occasionDate', true, false);
  };

  return {
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
    handleGetOccasionDetail,
    handleEditPress,
    handleViewPress,
    handleCreatePress,
    handleBackPress,
    handleDatePickerConfirm,
  };
};
