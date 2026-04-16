import * as Yup from 'yup';
import { EMOJI_CHAR_REGEX } from './emoji';

export const phoneValidation = () => {
  return Yup.string()
    .trim()
    .required('Phone number is required.')
    .matches(
      /^5\d{8}$/,
      'Phone number must contain 9 digits and start with 5.',
    );
};
export const emailValidation = () =>
  Yup.string()
    .trim()
    .email('Please enter a valid email address.')
    .matches(
      /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
      'Please enter a valid email address.',
    )
    .required('Email is required.');

// Unicode letter (\p{L}) and number (\p{N}) for Arabic + Latin support
export const usernameValidation = () =>
  Yup.string()
    .trim()
    .required('Username is required.')
    .min(3, 'Username must be at least 3 characters.')
    .max(50, 'Username must be less than 50 characters.')
    .test('has-letter', 'Username is invalid.', value => {
      if (!value) return true;
      return /\p{L}/u.test(value);
    })
    .test('not-only-numbers', 'Username cannot be only numbers', value => {
      if (!value) return true;
      return !/^\p{N}+$/u.test(value);
    })
    .test(
      'not-more-special-chars',
      'Username cannot have more special characters than letters and numbers',
      value => {
        if (!value) return true;
        const alphanumericCount = (value.match(/[\p{L}\p{N}]/gu) || []).length;
        const specialCharsCount = value.length - alphanumericCount;
        return alphanumericCount >= specialCharsCount;
      },
    )
    .test(
      'not-more-numbers',
      'Username cannot have more numbers than letters',
      value => {
        if (!value) return true;
        const lettersCount = (value.match(/\p{L}/gu) || []).length;
        const numbersCount = (value.match(/\p{N}/gu) || []).length;
        return lettersCount >= numbersCount;
      },
    )
    .test(
      'no-emoji',
      'Username cannot contain emojis or special characters',
      value => {
        if (!value) return true;
        const re = new RegExp(EMOJI_CHAR_REGEX.source, EMOJI_CHAR_REGEX.flags);
        return !re.test(value);
      },
    );

// \p{L} = any Unicode letter (Latin, Arabic, etc.)
export const fullNameValidation = () =>
  Yup.string()
    .trim()
    .required('Full name is required.')
    .min(3, 'Full name must be at least 3 characters.')
    .max(50, 'Full name must be less than 50 characters.')
    .matches(
      /^[\p{L}\s'-]+$/u,
      'Name can only contain letters, spaces, hyphens, and apostrophes',
    )
    .test(
      'no-emoji',
      'Name cannot contain emojis, numbers, or special characters',
      value => {
        if (!value) return true;
        const re = new RegExp(EMOJI_CHAR_REGEX.source, EMOJI_CHAR_REGEX.flags);
        const numberRegex = /\p{N}/u;
        return !re.test(value) && !numberRegex.test(value);
      },
    );

export const cityValidation = () => Yup.string().required('City is required.');

export const birthdayValidation = () =>
  Yup.string()
    .trim()
    .required('Date of birth is required.')
    .matches(
      /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/(\d{4})$/,
      'Date of birth must be in DD/MM/YYYY format.',
    );

export const createSignInSchema = (activeTab: 'Phone' | 'Email') => {
  const baseSchema = {
    phone: activeTab === 'Phone' ? phoneValidation() : Yup.string(),
    email: activeTab === 'Email' ? emailValidation() : Yup.string(),
  };

  return Yup.object().shape(baseSchema);
};

export const createSignUpSchema = (currentStep: number) => {
  const schema = {
    fullName: fullNameValidation(),
    username: usernameValidation(),
    city: cityValidation(),
    dateOfBirth: birthdayValidation(),
    phoneNumber: phoneValidation(),
    email: emailValidation(),
  };

  if (currentStep === 1) {
    return Yup.object().shape({
      fullName: schema.fullName,
      username: schema.username,
    });
  }

  if (currentStep === 2) {
    return Yup.object().shape({
      city: schema.city,
      dateOfBirth: schema.dateOfBirth,
    });
  }

  return Yup.object().shape({
    ...schema,
  });
};
