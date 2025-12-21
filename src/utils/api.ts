import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import apiEndpoints from '../constants/api-endpoints';
import { store } from '../store/store';
import { logout } from '../store/reducer/auth';

const axiosInter = axios.create({
  baseURL: apiEndpoints.BASE_URL,
  responseType: 'json',
  headers: { 'Content-Type': 'application/json' },
});

axiosInter.interceptors.request.use(
  config => {
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

interface ResponseObject<T> {
  success: boolean;
  failed: boolean;
  data: T | null;
  error: string;
}

const caller = async <T>(
  area: 'public' | 'private',
  type: 'post' | 'get' | 'put' | 'delete',
  url: string,
  data?: any,
  config?: AxiosRequestConfig<any>,
) => {
  const responseObject: ResponseObject<T> = {
    success: false,
    failed: false,
    data: null,
    error: '',
  };

  const langId = store.getState().locale.localeData.langId;
  const userId = store.getState().auth.user?.UserId;
  const token = store.getState().auth.token;
  config = {
    ...config,
    headers: {
      ...config?.headers,
      LangID: langId,
      UserId: userId,
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };

  try {
    let response;
    if (type === 'get' || type === 'delete') {
      response = await axiosInter[type](url, config);
    } else {
      response = await axiosInter[type](url, data, config);
    }

    responseObject.success = true;
    responseObject.failed = false;
    responseObject.data = response.data;
    responseObject.error = '';
  } catch (err: any) {
    console.log('error ->', err);
    const response = err?.response?.data;
    let errorMessage =
      response?.error?.message ||
      response?.message ||
      response?.ResponseMessage ||
      err?.message ||
      'Something went wrong';

    if (err?.response?.status === 401) {
      errorMessage = 'Session expired. Please login again.';
      store.dispatch(logout());
    }
    if (err?.response?.status === 413) {
      errorMessage = 'File size is too large. Please use a smaller image.';
    }

    responseObject.error = errorMessage;
    responseObject.data = response?.data || null;
    responseObject.failed = true;
    responseObject.success = false;
  }

  if (true) {
    console.log('\n\n');
    console.log('Api Call --> ', `[${type?.toUpperCase()}]`, url);
    if (data) {
      console.log('\tdata ->', data);
    }
    if (config) {
      console.log('\tconfig ->', config);
    }
    console.log('\tresponse ->', responseObject);
    console.log('\n');
  }

  return responseObject as ResponseObject<T>;
};

const api = {
  get: async <T>(url: string, config?: AxiosRequestConfig<any>) =>
    caller<T>('public', 'get', url, undefined, config),
  delete: async <T>(url: string, config?: AxiosRequestConfig<any>) =>
    caller<T>('public', 'delete', url, undefined, config),
  post: async <T>(url: string, data: any, config?: AxiosRequestConfig<any>) =>
    caller<T>('public', 'post', url, data, config),
  put: async <T>(url: string, data?: any, config?: AxiosRequestConfig<any>) =>
    caller<T>('public', 'put', url, data, config),
};

export default api;

export const getAuthHeader = (token: string) => {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
};

export const getAuthHeaderWithFormData = (token: string) => {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  };
};
