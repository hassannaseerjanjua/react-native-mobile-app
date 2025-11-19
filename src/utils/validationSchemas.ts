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
    .max(50, getString('AU_SU_USERNAME_LESS_THAN'))
    .test(
      'has-letter',
      getString('AU_SU_USERNAME_INVALID') ||
        'Username must contain at least one letter',
      value => {
        if (!value) return true;
        return /[a-zA-Z]/.test(value);
      },
    )
    .test(
      'not-only-numbers',
      getString('AU_SU_USERNAME_INVALID') || 'Username cannot be only numbers',
      value => {
        if (!value) return true;
        return !/^[0-9]+$/.test(value);
      },
    )
    .test(
      'not-more-special-chars',
      getString('AU_SU_USERNAME_INVALID') ||
        'Username cannot have more special characters than letters and numbers',
      value => {
        if (!value) return true;
        const alphanumericCount = (value.match(/[a-zA-Z0-9]/g) || []).length;
        const specialCharsCount = value.length - alphanumericCount;
        return alphanumericCount >= specialCharsCount;
      },
    )
    .test(
      'not-more-numbers',
      getString('AU_SU_USERNAME_INVALID') ||
        'Username cannot have more numbers than letters',
      value => {
        if (!value) return true;
        const lettersCount = (value.match(/[a-zA-Z]/g) || []).length;
        const numbersCount = (value.match(/[0-9]/g) || []).length;
        return lettersCount >= numbersCount;
      },
    )
    .test(
      'no-emoji',
      getString('AU_SU_USERNAME_NO_EMOJI') ||
        'Username cannot contain emojis or special characters',
      value => {
        if (!value) return true;
        const emojiRegex =
          /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu;
        return !emojiRegex.test(value);
      },
    );

export const fullNameValidation = (getString: GetString) =>
  Yup.string()
    .trim()
    .required(getString('AU_SU_FULLNAME_REQUIRE'))
    .min(3, getString('AU_SU_FULLNAME_ATLEAST'))
    .max(50, getString('AU_SU_FULLNAME_LESS_THAN'))
    .matches(
      /^[a-zA-Z\s'-]+$/,
      getString('AU_SU_FULLNAME_INVALID') ||
        'Name can only contain letters, spaces, hyphens, and apostrophes',
    )
    .test(
      'no-emoji',
      getString('AU_SU_FULLNAME_NO_EMOJI') ||
        'Name cannot contain emojis, numbers, or special characters',
      value => {
        if (!value) return true;
        // Check for emojis
        const emojiRegex =
          /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu;
        // Check for numbers
        const numberRegex = /\d/;
        return !emojiRegex.test(value) && !numberRegex.test(value);
      },
    );

export const cityValidation = (getString: GetString) =>
  Yup.string().required(getString('AU_SU_CITY_REQUIRED'));

export const birthdayValidation = (getString: GetString) =>
  Yup.string()
    .trim()
    .required(getString('ST_BIRTHDAY_REQUIRED'))
    .matches(
      /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/,
      getString('ST_BIRTHDAY_INVALID_FORMAT'),
    );

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

export const createSettingsSchema = (getString: GetString) => {
  return Yup.object().shape({
    Fullname: fullNameValidation(getString),
    username: usernameValidation(getString),
    CityId: cityValidation(getString),
    email: emailValidation(getString),
    phoneNumber: phoneValidation(getString),
    // Dob: birthdayValidation(getString),
  });
};

export const subjectValidation = (getString: GetString) =>
  Yup.string()
    .trim()
    .required(getString('CU_SUBJECT_REQUIRED') || 'Subject is required')
    .min(
      3,
      getString('CU_SUBJECT_MIN_LENGTH') ||
        'Subject must be at least 3 characters',
    )
    .max(
      100,
      getString('CU_SUBJECT_MAX_LENGTH') ||
        'Subject must be less than 100 characters',
    );

export const messageValidation = (getString: GetString) =>
  Yup.string()
    .trim()
    .required(getString('CU_MESSAGE_REQUIRED') || 'Message is required')
    .min(
      5,
      getString('CU_MESSAGE_MIN_LENGTH') ||
        'Message must be at least 5 characters',
    )
    .max(
      1000,
      getString('CU_MESSAGE_MAX_LENGTH') ||
        'Message must be less than 1000 characters',
    );

export const createContactUsSchema = (getString: GetString) => {
  return Yup.object().shape({
    subject: subjectValidation(getString),
    message: messageValidation(getString),
  });
};
