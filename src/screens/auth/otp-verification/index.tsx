import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StatusBar,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { AuthStackScreen } from '../../../types/navigation.types';
import CustomButton from '../../../components/global/Custombutton';
import useStyles from './style.ts';
import Header from '../../../components/global/Header';
import { login } from '../../../store/reducer/auth';
import { SvgLogoBlue } from '../../../assets/icons/index.ts';
import { SafeAreaView } from 'react-native-safe-area-context';
import AuthLayout from '../../../components/app/AuthLayout.tsx';
import api from '../../../utils/api.ts';
import apiEndpoints from '../../../constants/api-endpoints.ts';

interface OtpVerificationProps extends AuthStackScreen<'OtpVerification'> {}

const OtpVerification: React.FC<OtpVerificationProps> = ({
  navigation,
  route,
}) => {
  const { styles, theme } = useStyles();
  const dispatch = useDispatch();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [isTimerActive, setIsTimerActive] = useState(true);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [showError, setShowError] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Get email and phone from route parameters
  const { email, phone, fullName, username, city, signIn } = route.params;

  console.log('params received', route.params);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isTimerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer(timer - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timer, isTimerActive]);

  // Auto-focus first input to open keyboard
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleOtpChange = (value: string, index: number) => {
    // Handle only single digit or empty string
    const sanitizedValue = value.replace(/[^0-9]/g, '').slice(0, 1);

    const newOtp = [...otp];
    newOtp[index] = sanitizedValue;
    setOtp(newOtp);

    // Auto-focus next input when digit is entered
    if (sanitizedValue && index < 5) {
      // Use setTimeout to prevent race conditions when typing fast
      setTimeout(() => {
        inputRefs.current[index + 1]?.focus();
      }, 10);
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    // Handle backspace - move to previous input if current is empty
    if (key === 'Backspace' && !otp[index] && index > 0) {
      setTimeout(() => {
        inputRefs.current[index - 1]?.focus();
      }, 10);
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join('');

    const endpoint = signIn
      ? apiEndpoints.VERIFY_OTP_SIGNIN
      : apiEndpoints.VERIFY_OTP;
    if (otpString.length === 6) {
      console.log('Verifying OTP:', otpString);
      try {
        const response = await api.post(endpoint, {
          OTP: otpString,
          Email: email,
          PhoneNo: phone,
        });
        console.log('OTP verification response:', response);
        if (response.success) {
          dispatch(
            login({
              email: email,
              phone: phone,
            }),
          );
        } else {
          // Show error button for 3 seconds
          setShowError(true);
          setTimeout(() => {
            setShowError(false);
          }, 3000);
        }
      } catch (error) {
        console.log('OTP verification error:', error);
        // Show error button for 3 seconds
        setShowError(true);
        setTimeout(() => {
          setShowError(false);
        }, 3000);
      }
    }
  };

  const handleResendCode = async () => {
    setTimer(60);
    setIsTimerActive(true);
    const endpoint = signIn ? apiEndpoints.SIGNIN : apiEndpoints.SIGNUP;
    console.log('Resending OTP...');
    // Handle resend OTP logic here
    const response = await api
      .post(endpoint, {
        FullName: fullName,
        UserName: username,
        CityId: city,
        Phone: phone,
        Email: email,
      })
      .then(res => {
        console.log('Sign up response:', res);
      })
      .catch(err => {
        console.log('Sign up error:', err);
      });
    console.log('resend OTP response', response);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isOtpComplete = otp.every(digit => digit !== '');

  return (
    <>
      <AuthLayout onBackPress={() => navigation.goBack()} title="">
        <View style={styles.mainContent}>
          <View style={styles.headerContainer}>
            <Text style={styles.title}>
              Enter the 6-digit code which is sent to your email and phone
              number{' '}
            </Text>
          </View>

          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={ref => {
                  inputRefs.current[index] = ref;
                }}
                style={[
                  styles.otpInput,
                  styles.otpBox,
                  {
                    borderColor: digit ? theme.colors.PRIMARY : '#EEEEEE',
                    borderWidth: digit ? 1.5 : 1,
                  },
                ]}
                value={digit}
                onChangeText={value => handleOtpChange(value, index)}
                onKeyPress={({ nativeEvent }) =>
                  handleKeyPress(nativeEvent.key, index)
                }
                onFocus={() => setFocusedIndex(index)}
                keyboardType="number-pad"
                maxLength={1}
                textAlign="center"
                selectTextOnFocus
                autoFocus={index === 0}
                returnKeyType="next"
              />
            ))}
          </View>

          <View style={styles.subtitleContainer}>
            <Text style={styles.subtitle}>
              Haven't received code yet?{' '}
              {isTimerActive ? (
                <Text>Wait for {formatTimer(timer)}</Text>
              ) : (
                <Text onPress={handleResendCode} style={styles.resendText}>
                  Resend Code
                </Text>
              )}
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <CustomButton
              title="Verify"
              type="primary"
              onPress={handleVerify}
              disabled={!isOtpComplete}
            />
          </View>
        </View>
        {showError && (
          <CustomButton
            title="Invalid or Expired OTP"
            type="error"
            onPress={() => {}}
          />
        )}
      </AuthLayout>
    </>
  );
};

export default OtpVerification;
