import * as Yup from 'yup';

// Type for getString function
type GetString = (key: any) => string;

// Common validation patterns
export const phoneValidation = (getString: GetString) =>
  Yup.string()
    .trim()
    .required(getString('AU_SI_PN_REQUIRED'))
    .matches(/^5/, getString('AU_SI_PN_MUST_START'))
    .matches(/^[0-9]+$/, getString('AU_SI_PN_MUST_CONTAIN'))
    .length(9, getString('AU_SI_PN_MUST_DIGIT'));

export const emailValidation = (getString: GetString) =>
  Yup.string()
    .trim()
    .email(getString('AU_SI_INVALID_EMAIL_ADDRESS'))
    .matches(
      /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
      getString('AU_SI_INVALID_EMAIL_ADDRESS'),
    )
    .required(getString('AU_SI_EMAIL_REQUIRED'));

export const usernameValidation = (getString: GetString) =>
  Yup.string()
    .trim()
    .required(getString('AU_SU_USERNAME_IS_REQUIRED'))
    .min(3, getString('AU_SU_USERNAME_ATLEAST'))
    .max(50, getString('AU_SU_USERNAME_LESS_THAN'));

export const fullNameValidation = (getString: GetString) =>
  Yup.string()
    .trim()
    .required(getString('AU_SU_FULLNAME_REQUIRE'))
    .min(3, getString('AU_SU_FULLNAME_ATLEAST'))
    .max(50, getString('AU_SU_FULLNAME_LESS_THAN'));

export const cityValidation = (getString: GetString) =>
  Yup.string().required(getString('AU_SU_CITY_REQUIRED'));

// Reusable schema builders
export const createSignInSchema = (
  activeTab: 'Phone' | 'Email',
  getString: GetString,
) => {
  return Yup.object().shape({
    phone:
      activeTab === 'Phone'
        ? phoneValidation(getString)
        : Yup.string().optional(),
    email:
      activeTab === 'Email'
        ? emailValidation(getString)
        : Yup.string().optional(),
  });
};

export const createSignUpSchema = (
  currentStep: number,
  getString: GetString,
) => {
  return Yup.object().shape({
    fullName:
      currentStep === 1
        ? fullNameValidation(getString)
        : Yup.string().optional(),
    username:
      currentStep === 1
        ? usernameValidation(getString)
        : Yup.string().optional(),
    city:
      currentStep === 2 ? cityValidation(getString) : Yup.string().optional(),
    phoneNumber:
      currentStep === 3 ? phoneValidation(getString) : Yup.string().optional(),
    email:
      currentStep === 3 ? emailValidation(getString) : Yup.string().optional(),
  });
};
