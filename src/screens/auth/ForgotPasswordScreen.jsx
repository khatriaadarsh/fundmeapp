import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import OTPBox from '../../components/auth/OTPBox';
import GradientButton from '../../components/common/GradientButton';
import { COLORS, SPACING, TYPOGRAPHY, scale } from '../../theme';

const OTP_LENGTH = 5;
const TIMER_DURATION = 300; // 5 minutes

const ForgotPasswordOTPScreen = ({ navigation, route }) => {
  const email = route?.params?.email ?? 'user@example.com';

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [focused, setFocused] = useState(0);
  const [seconds, setSeconds] = useState(TIMER_DURATION);

  const inputRefs = useRef(
    Array(OTP_LENGTH).fill(null).map(() => React.createRef())
  );

  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Timer
  useEffect(() => {
    if (seconds <= 0) return;
    const timer = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [seconds]);

  // Animation
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    setTimeout(() => inputRefs.current[0]?.current?.focus(), 400);
  }, [fadeAnim]);

  const formatTime = useCallback((totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const handleChange = useCallback(
    (text, index) => {
      const newOtp = [...otp];
      newOtp[index] = text;
      setOtp(newOtp);

      if (text && index < OTP_LENGTH - 1) {
        inputRefs.current[index + 1]?.current?.focus();
        setFocused(index + 1);
      }
    },
    [otp]
  );

  const handleKeyPress = useCallback(
    ({ nativeEvent: { key } }, index) => {
      if (key === 'Backspace' && !otp[index] && index > 0) {
        inputRefs.current[index - 1]?.current?.focus();
        setFocused(index - 1);
      }
    },
    [otp]
  );

  const handleResend = useCallback(() => {
    setSeconds(TIMER_DURATION);
    setOtp(Array(OTP_LENGTH).fill(''));
    inputRefs.current[0]?.current?.focus();
    setFocused(0);
  }, []);

  const handleVerify = useCallback(() => {
    navigation.navigate('NewPasswordScreen');
  }, [navigation]);

  const isOTPComplete = useMemo(() => {
    return otp.every((digit) => digit !== '');
  }, [otp]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.background}
        translucent={false}
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Icon */}
          <View style={styles.iconCircle}>
            <Icon name="email-outline" size={scale(36)} color={COLORS.primary} />
          </View>

          {/* Text */}
          <Text style={styles.headline}>Verify Your Email</Text>
          <Text style={styles.subtitle}>We sent a 5-digit code to</Text>
          <Text style={styles.email}>{email}</Text>

          {/* OTP Boxes */}
          <View style={styles.otpContainer}>
            {otp.map((value, index) => (
              <OTPBox
                key={index}
                value={value}
                isFocused={focused === index}
                inputRef={inputRefs.current[index]}
                onChangeText={(text) => handleChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
              />
            ))}
          </View>

          {/* Timer */}
          <View style={styles.timerBadge}>
            <Icon name="clock-outline" size={SPACING.iconSize} color={COLORS.warning} />
            <Text style={styles.timerText}>
              {seconds > 0 ? `Expires in ${formatTime(seconds)}` : 'Code expired'}
            </Text>
          </View>

          {/* Verify Button */}
          <GradientButton
            title="Verify"
            onPress={handleVerify}
            disabled={!isOTPComplete}
          />

          {/* Resend */}
          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn't get the code? </Text>
            <Text
              style={[styles.resendLink, seconds > 0 && styles.resendDisabled]}
              onPress={seconds === 0 ? handleResend : null}
            >
              Resend
            </Text>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.screenPadding,
  },
  iconCircle: {
    width: scale(80),
    height: scale(80),
    borderRadius: scale(40),
    backgroundColor: COLORS.tealTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xxl,
  },
  headline: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontFamily: TYPOGRAPHY.fontFamily.extraBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  email: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.primary,
    marginBottom: SPACING.xxl,
    textAlign: 'center',
  },
  otpContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.amberTint,
    borderRadius: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.gapSm,
    marginBottom: SPACING.xxl,
    gap: SPACING.gapSm,
  },
  timerText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.warning,
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  resendText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.textSecondary,
  },
  resendLink: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.primary,
  },
  resendDisabled: {
    color: COLORS.textTertiary,
  },
});

export default ForgotPasswordOTPScreen;