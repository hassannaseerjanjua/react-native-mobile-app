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

const signInSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().required('Password is required'),
});

interface SignInProps extends AuthStackScreen<'SignIn'> {}

const SignIn: React.FC<SignInProps> = ({ navigation }) => {
  const theme = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (values: any) => {
    setLoading(true);
    try {
      const response = await api.post(apiEndpoints.SIGNIN, {
        Email: values.email,
        Password: values.password,
      });

      if (response.success) {
        notify.success('Logged in successfully');
        navigation.replace('App' as any);
      } else {
        notify.error(response.error || 'Invalid credentials');
      }
    } catch (error) {
      notify.error('Network error, please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="SIGN IN" 
      subtitle="Welcome! Let's get you started."
    >
      <Formik
        initialValues={{ email: '', password: '' }}
        validationSchema={signInSchema}
        onSubmit={handleSignIn}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
          <View style={styles.form}>
            <InputField
              label="Email"
              fieldProps={{
                placeholder: 'email',
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
                placeholder: 'password',
                onChangeText: handleChange('password'),
                onBlur: handleBlur('password'),
                value: values.password,
              }}
              icon={<Text style={{ color: theme.colors.GRAY }}>{showPassword ? 'Hide' : 'Show'}</Text>}
              onIconPress={() => setShowPassword(!showPassword)}
              error={touched.password && errors.password}
            />

            <TouchableOpacity 
              onPress={() => {}} 
              style={styles.forgetPassword}
            >
              <Text style={styles.forgetPasswordText}>Forget Password?</Text>
            </TouchableOpacity>

            <CustomButton
              title="SIGN IN"
              onPress={handleSubmit as any}
              loading={loading}
              buttonStyle={styles.button}
            />

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                <Text style={styles.footerLink}>Signup</Text>
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
  forgetPassword: {
    alignSelf: 'flex-end',
    marginBottom: 30,
  },
  forgetPasswordText: {
    color: '#1A1A1A',
    fontSize: 14,
    fontWeight: '500',
  },
  button: {
    height: 55,
    borderRadius: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
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

export default SignIn;
