import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { AuthStackScreen } from '../../../types/navigation.types';
import CustomButton from '../../../components/global/Custombutton';
import InputField from '../../../components/global/InputField';
import AuthLayout from '../../../components/app/AuthLayout';
import { Text } from '../../../utils/elements';
import useTheme from '../../../styles/theme';
import api from '../../../utils/api';
import apiEndpoints from '../../../constants/api-endpoints';
import notify from '../../../utils/notify';

const signUpSchema = Yup.object().shape({
  fullName: Yup.string().required('Full name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().required('Password is required').min(6, 'Password too short'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
});

interface SignUpProps extends AuthStackScreen<'SignUp'> {}

const SignUp: React.FC<SignUpProps> = ({ navigation }) => {
  const theme = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (values: any) => {
    setLoading(true);
    try {
      const response = await api.post(apiEndpoints.SIGNUP, {
        FullName: values.fullName,
        Email: values.email,
        Password: values.password,
      });

      if (response.success) {
        notify.success('Account created successfully');
        navigation.navigate('SignIn');
      } else {
        notify.error(response.error || 'Registration failed');
      }
    } catch (error) {
      notify.error('Network error, please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="SIGN UP" 
      subtitle="Welcome! Let's get you started."
    >
      <Formik
        initialValues={{ fullName: '', email: '', password: '', confirmPassword: '' }}
        validationSchema={signUpSchema}
        onSubmit={handleSignUp}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
          <View style={styles.form}>
            <InputField
              label="Full Name"
              fieldProps={{
                placeholder: 'Enter your name',
                onChangeText: handleChange('fullName'),
                onBlur: handleBlur('fullName'),
                value: values.fullName,
              }}
              error={touched.fullName && errors.fullName}
            />

            <InputField
              label="Email"
              fieldProps={{
                placeholder: 'Enter your email',
                onChangeText: handleChange('email'),
                onBlur: handleBlur('email'),
                value: values.email,
                keyboardType: 'email-address',
                autoCapitalize: 'none',
              }}
              error={touched.email && errors.email}
            />

            <InputField
              label="Password"
              secureTextEntry={!showPassword}
              fieldProps={{
                placeholder: 'Enter your password',
                onChangeText: handleChange('password'),
                onBlur: handleBlur('password'),
                value: values.password,
              }}
              icon={<Text style={{ color: theme.colors.GRAY }}>{showPassword ? 'Hide' : 'Show'}</Text>}
              onIconPress={() => setShowPassword(!showPassword)}
              error={touched.password && errors.password}
            />

            <InputField
              label="Confirm Password"
              secureTextEntry={!showConfirmPassword}
              fieldProps={{
                placeholder: 'Re-enter your password',
                onChangeText: handleChange('confirmPassword'),
                onBlur: handleBlur('confirmPassword'),
                value: values.confirmPassword,
              }}
              icon={<Text style={{ color: theme.colors.GRAY }}>{showConfirmPassword ? 'Hide' : 'Show'}</Text>}
              onIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
              error={touched.confirmPassword && errors.confirmPassword}
            />

            <CustomButton
              title="SIGN UP"
              onPress={handleSubmit as any}
              loading={loading}
              buttonStyle={styles.button}
            />

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
                <Text style={styles.footerLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Formik>
    </AuthLayout>
  );
};

const styles = StyleSheet.create({
  form: {
    paddingTop: 10,
  },
  button: {
    height: 55,
    borderRadius: 10,
    marginTop: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  footerText: {
    color: '#718096',
    fontSize: 14,
  },
  footerLink: {
    color: '#2E7CF6',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default SignUp;
