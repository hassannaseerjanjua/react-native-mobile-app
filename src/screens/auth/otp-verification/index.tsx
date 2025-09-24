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
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Get email and phone from route parameters
  const { email, phone } = route.params;

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

  const handleVerify = () => {
    const otpString = otp.join('');
    if (otpString.length === 6) {
      console.log('Verifying OTP:', otpString);
      // Handle OTP verification logic here
      // For now, we'll simulate successful verification
      // In a real app, you would make an API call to verify the OTP

      // Dispatch login action to update authentication state
      dispatch(
        login({
          email: email,
          phone: phone,
        }),
      );

      // The navigation will happen automatically due to the authentication state change
      // The RootNavigator will detect the authentication change and switch to the App stack
    }
  };

  const handleResendCode = () => {
    setTimer(60);
    setIsTimerActive(true);
    console.log('Resending OTP...');
    // Handle resend OTP logic here
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isOtpComplete = otp.every(digit => digit !== '');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      <Header />
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.logoContainer}>
          <SvgLogoBlue width={theme.sizes.APP_LOGO} />
        </View>

        <View style={styles.mainContent}>
          <View style={styles.headerContainer}>
            <Text style={styles.title}>
              Enter the 6-digit code which is sent to your{' '}
              {email ? 'email' : 'phone number'}
            </Text>
            {(email || phone) && (
              <Text style={styles.subtitle}>{email || phone}</Text>
            )}
          </View>

          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={ref => {
                  inputRefs.current[index] = ref;
                }}
                style={[styles.otpInput, styles.otpBox]}
                value={digit}
                onChangeText={value => handleOtpChange(value, index)}
                onKeyPress={({ nativeEvent }) =>
                  handleKeyPress(nativeEvent.key, index)
                }
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
            <Text style={styles.subtitle}>Haven't received code yet?</Text>
            {isTimerActive ? (
              <Text style={styles.timerText}>
                Resend in {formatTimer(timer)}
              </Text>
            ) : (
              <TouchableOpacity onPress={handleResendCode}>
                <Text style={styles.resendText}>Resend Code</Text>
              </TouchableOpacity>
            )}
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
      </ScrollView>
    </SafeAreaView>
  );
};

export default OtpVerification;
