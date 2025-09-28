import * as Yup from 'yup';

// Common validation patterns
export const phoneValidation = Yup.string()
  .trim()
  .required('Phone number is required')
  .matches(/^5/, 'Phone number must start with 5x-xxx-xxxx')
  .matches(/^[0-9]+$/, 'Phone number must contain only digits')
  .length(9, 'Phone number must be 9 digits');

export const emailValidation = Yup.string()
  .trim()
  .email('Invalid email address')
  .matches(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, 'Enter a valid email address')
  .required('Email address is required');

export const usernameValidation = Yup.string()
  .trim()
  .required('Username is required')
  .min(3, 'Username must be at least 3 characters')
  .max(50, 'Username must be less than 50 characters');

export const fullNameValidation = Yup.string()
  .trim()
  .required('Full name is required')
  .min(3, 'Full name must be at least 3 characters')
  .max(50, 'Full name must be less than 50 characters');

export const cityValidation = Yup.string().required('City is required');

// Reusable schema builders
export const createSignInSchema = (activeTab: 'Phone' | 'Email') => {
  return Yup.object().shape({
    phone: activeTab === 'Phone' ? phoneValidation : Yup.string().optional(),
    email: activeTab === 'Email' ? emailValidation : Yup.string().optional(),
  });
};

export const createSignUpSchema = (currentStep: number) => {
  return Yup.object().shape({
    fullName: currentStep === 1 ? fullNameValidation : Yup.string().optional(),
    username: currentStep === 1 ? usernameValidation : Yup.string().optional(),
    city: currentStep === 2 ? cityValidation : Yup.string().optional(),
    phoneNumber: currentStep === 3 ? phoneValidation : Yup.string().optional(),
    email: currentStep === 3 ? emailValidation : Yup.string().optional(),
  });
};
