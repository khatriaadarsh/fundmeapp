// src/screens/auth/SendResetCode.jsx
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

import OTPBox               from '../../components/auth/OTPBox';
import GradientButton       from '../../components/common/GradientButton';
import { FullScreenLoader } from '../../components/common/Loader';
import { useToast }         from '../../components/common/Toast';
import { useVerifyOtp, useResendOtp } from '../../hooks/useAuth';

import { COLORS, SPACING, TYPOGRAPHY, scale } from '../../theme';

const OTP_LENGTH    = 5;
const TIMER_SECONDS = 300; // 5 minutes

const ForgotPasswordOTPScreen = ({ navigation, route }) => {
  const toast = useToast();
  const email = route?.params?.email || '';

  // Debug: confirm email arrived
  useEffect(() => {
    console.log('🟡 SendResetCode mounted. email from route =', email);
  }, [email]);

  const { mutate: verifyOtp, isPending: isVerifying } = useVerifyOtp();
  const { mutate: resendOtp, isPending: isResending } = useResendOtp();

  const [otp,     setOtp]     = useState(Array(OTP_LENGTH).fill(''));
  const [focused, setFocused] = useState(0);
  const [seconds, setSeconds] = useState(TIMER_SECONDS);

  const inputRefs = useRef(
    Array(OTP_LENGTH).fill(null).map(() => React.createRef()),
  );
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Timer
  useEffect(() => {
    if (seconds <= 0) return;
    const timer = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [seconds]);

  // Mount animation
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

  const handleChange = useCallback((text, index) => {
    // Paste support
    if (text.length > 1) {
      const digits = text.replace(/\D/g, '').slice(0, OTP_LENGTH).split('');
      const next = Array(OTP_LENGTH).fill('');
      digits.forEach((d, i) => { next[i] = d; });
      setOtp(next);
      const last = Math.min(digits.length, OTP_LENGTH) - 1;
      inputRefs.current[last]?.current?.focus();
      setFocused(last);
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.current?.focus();
      setFocused(index + 1);
    }
  }, [otp]);

  const handleKeyPress = useCallback(({ nativeEvent: { key } }, index) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.current?.focus();
      setFocused(index - 1);
    }
  }, [otp]);

  // ─── Resend OTP ──────────────────────────────────────────
  const handleResend = useCallback(() => {
    if (!email) {
      toast.error('Missing email. Please go back and try again.');
      return;
    }
    if (seconds > 0) return;

    console.log('🔵 Calling resendOtp with email:', email);

    resendOtp(email, {
      onSuccess: (body) => {
        console.log('🟢 resendOtp success:', body);
        toast.success(body?.responseMessage || 'A new OTP has been sent.');
        setOtp(Array(OTP_LENGTH).fill(''));
        setSeconds(TIMER_SECONDS);
        inputRefs.current[0]?.current?.focus();
        setFocused(0);
      },
      onError: (err) => {
        console.log('🔴 resendOtp error:', err);
        toast.error(err?.message || 'Failed to resend OTP.');
      },
    });
  }, [email, seconds, resendOtp, toast]);

  // ─── Verify OTP ──────────────────────────────────────────
  const handleVerify = useCallback(() => {
    const otpValue = otp.join('');

    console.log('🟡 handleVerify called. email=', email, 'otp=', otpValue);

    if (otpValue.length !== OTP_LENGTH) {
      toast.error(`Please enter the ${OTP_LENGTH}-digit OTP.`);
      return;
    }
    if (!email) {
      toast.error('Missing email. Please go back and try again.');
      return;
    }

    verifyOtp(
      { email, otp: otpValue },
      {
        onSuccess: (body) => {
          console.log('🟢 verifyOtp onSuccess body:', body);
          toast.success(body?.responseMessage || 'OTP verified successfully.');

          // Navigate ONLY on success — pass email explicitly
          navigation.navigate('NewPasswordScreen', { email });
        },
        onError: (err) => {
          console.log('🔴 verifyOtp onError err:', err);
          toast.error(err?.message || 'Invalid OTP. Please try again.');
          setOtp(Array(OTP_LENGTH).fill(''));
          inputRefs.current[0]?.current?.focus();
          setFocused(0);
        },
      },
    );
  }, [otp, email, verifyOtp, navigation, toast]);

  const isOTPComplete = useMemo(() => otp.every((d) => d !== ''), [otp]);
  const isBusy        = isVerifying || isResending;
  const canResend     = seconds <= 0 && !isBusy;

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
          <View style={styles.iconCircle}>
            <Icon name="email-outline" size={scale(36)} color={COLORS.primary} />
          </View>

          <Text style={styles.headline}>Verify OTP Now</Text>
          <Text style={styles.subtitle}>We sent a {OTP_LENGTH}-digit code to</Text>
          <Text style={styles.email}>{email || 'unknown'}</Text>

          <View style={styles.otpContainer}>
            {otp.map((value, index) => (
              <OTPBox
                key={index}
                value={value}
                isFocused={focused === index}
                inputRef={inputRefs.current[index]}
                onChangeText={(text) => handleChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                editable={!isBusy}
              />
            ))}
          </View>

          <View style={styles.timerBadge}>
            <Icon name="clock-outline" size={SPACING.iconSize} color={COLORS.warning} />
            <Text style={styles.timerText}>
              {seconds > 0 ? `Expires in ${formatTime(seconds)}` : 'Code expired'}
            </Text>
          </View>

          <GradientButton
            title={isVerifying ? 'Verifying…' : 'Verify'}
            onPress={handleVerify}
            disabled={!isOTPComplete || isBusy}
          />

          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn't get the code? </Text>
            <Text
              style={[styles.resendLink, !canResend && styles.resendDisabled]}
              onPress={canResend ? handleResend : null}
            >
              {isResending ? 'Sending…' : 'Resend'}
            </Text>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>

      <FullScreenLoader
        visible={isBusy}
        message={isResending ? 'Sending new OTP…' : 'Verifying OTP…'}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: COLORS.background },
  keyboardView: { flex: 1 },
  content:      { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: SPACING.screenPadding },
  iconCircle: {
    width: scale(80), height: scale(80), borderRadius: scale(40),
    backgroundColor: COLORS.tealTint,
    alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.xxl,
  },
  headline: {
    fontSize: TYPOGRAPHY.fontSize.xxxl, fontFamily: TYPOGRAPHY.fontFamily.extraBold,
    color: COLORS.textPrimary, marginBottom: SPACING.sm, textAlign: 'center',
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.base, fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.textSecondary, marginBottom: SPACING.xs, textAlign: 'center',
  },
  email: {
    fontSize: TYPOGRAPHY.fontSize.base, fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.primary, marginBottom: SPACING.xxl, textAlign: 'center',
  },
  otpContainer: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.xl },
  timerBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.amberTint,
    borderRadius: SPACING.xl,
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.gapSm,
    marginBottom: SPACING.xxl, gap: SPACING.gapSm,
  },
  timerText: {
    fontSize: TYPOGRAPHY.fontSize.sm, fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.warning,
  },
  resendContainer: { flexDirection: 'row', alignItems: 'center', marginTop: SPACING.xl },
  resendText: {
    fontSize: TYPOGRAPHY.fontSize.sm, fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.textSecondary,
  },
  resendLink: {
    fontSize: TYPOGRAPHY.fontSize.sm, fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.primary,
  },
  resendDisabled: { color: COLORS.textTertiary },
});

export default ForgotPasswordOTPScreen;