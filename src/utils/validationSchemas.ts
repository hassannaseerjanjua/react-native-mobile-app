import * as Yup from 'yup';

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

export const signInSchema = Yup.object().shape({
  email: emailValidation(),
  password: Yup.string().required('Password is required'),
});

export const signUpSchema = Yup.object().shape({
  fullName: fullNameValidation(),
  email: emailValidation(),
  password: Yup.string().required('Password is required').min(6, 'Password too short'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
});
