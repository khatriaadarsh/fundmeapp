// src/screens/auth/SendResetCode.jsx
// ─────────────────────────────────────────────────────────────
//  Forgot Password — Step 2: Verify OTP
//  Validation matches EmailVerifyForResetPass pattern exactly:
//    • Shake animation on failure
//    • Inline error message below OTP row
//    • Expired code blocks submission
//    • Resend disabled while timer is running
//    • OTP clears + refocuses on resend
// ─────────────────────────────────────────────────────────────

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Animated,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// ─────────────────────────────────────────────────────────────
//  Colors — unchanged from original
// ─────────────────────────────────────────────────────────────
const COLORS = {
  bg: '#F9FAFB',
  white: '#FFFFFF',
  teal: '#00B4CC',
  tealDark: '#0097AA',
  tealLight: 'rgba(0,180,204,0.12)',
  amber: '#F59E0B',
  amberLight: '#FEF3C7',
  error: '#EF4444',
  errorLight: '#FEF2F2',
  textDark: '#111827',
  textGray: '#6B7280',
  textLight: '#9CA3AF',
  border: '#E5E7EB',
  boxBorder: '#D1D5DB',
  boxFill: '#FFFFFF',
};

// ─────────────────────────────────────────────────────────────
//  Constants
//  FIX: OTP_LENGTH = 6 to match subtitle "6-digit code"
//       (was 5 in original — inconsistency fixed)
// ─────────────────────────────────────────────────────────────
const OTP_LENGTH = 6;
const TIMER_DURATION = 272; // seconds

// ─────────────────────────────────────────────────────────────
//  OTPBox — single digit input cell
// ─────────────────────────────────────────────────────────────
const OTPBox = ({
  value,
  isFocused,
  hasError,
  inputRef,
  onChangeText,
  onKeyPress,
}) => (
  <TextInput
    ref={inputRef}
    style={[
      styles.otpBox,
      value && styles.otpBoxFilled,
      isFocused && styles.otpBoxFocused,
      hasError && styles.otpBoxError, // red border on validation failure
    ]}
    value={value}
    onChangeText={onChangeText}
    onKeyPress={onKeyPress}
    keyboardType="number-pad"
    maxLength={1}
    textAlign="center"
    caretHidden
    selectTextOnFocus
  />
);

// ─────────────────────────────────────────────────────────────
//  SendResetCode — main screen
// ─────────────────────────────────────────────────────────────
const SendResetCode = ({ navigation, route }) => {
  const email = route?.params?.email ?? 'ahmed@gmail.com';

  // ── State ────────────────────────────────────────────────
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [seconds, setSeconds] = useState(TIMER_DURATION);
  const [focused, setFocused] = useState(0);
  const [error, setError] = useState(''); // inline validation error

  // ── Refs ─────────────────────────────────────────────────
  const inputRefs = useRef(
    Array(OTP_LENGTH)
      .fill(null)
      .map(() => React.createRef()),
  );

  // ── Animation refs ───────────────────────────────────────
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const iconScale = useRef(new Animated.Value(0.6)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current; // shake on error

  // ── Timer ────────────────────────────────────────────────
  useEffect(() => {
    if (seconds <= 0) return;
    const timer = setInterval(() => setSeconds(s => s - 1), 1000);
    return () => clearInterval(timer);
  }, [seconds]);

  // ── Mount animation ──────────────────────────────────────
  useEffect(() => {
    Animated.spring(iconScale, {
      toValue: 1,
      tension: 55,
      friction: 6,
      delay: 100,
      useNativeDriver: true,
    }).start();

    Animated.sequence([
      Animated.delay(200),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    setTimeout(() => inputRefs.current[0]?.current?.focus(), 500);
  }, [fadeAnim, slideAnim, iconScale]);

  // ── Helpers ──────────────────────────────────────────────
  const formatTime = useCallback(s => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  }, []);

  // ── Shake the OTP row ────────────────────────────────────
  const triggerShake = useCallback(() => {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 55,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 55,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 7,
        duration: 45,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -7,
        duration: 45,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 35,
        useNativeDriver: true,
      }),
    ]).start();
  }, [shakeAnim]);

  // ── OTP input: advance / stay ────────────────────────────
  const handleChange = useCallback(
    (text, idx) => {
      const newOtp = [...otp];
      newOtp[idx] = text;
      setOtp(newOtp);
      // Clear error as user types
      if (error) setError('');

      if (text && idx < OTP_LENGTH - 1) {
        inputRefs.current[idx + 1]?.current?.focus();
        setFocused(idx + 1);
      }
    },
    [otp, error],
  );

  // ── Backspace: move to previous box ─────────────────────
  const handleKeyPress = useCallback(
    ({ nativeEvent: { key } }, idx) => {
      if (key === 'Backspace' && !otp[idx] && idx > 0) {
        inputRefs.current[idx - 1]?.current?.focus();
        setFocused(idx - 1);
      }
    },
    [otp],
  );

  // ── Resend
  //    FIX: disabled while timer > 0; clears OTP + refocuses
  const handleResend = useCallback(() => {
    if (seconds > 0) return; // guard — button disabled, but safety check
    setSeconds(TIMER_DURATION);
    setOtp(Array(OTP_LENGTH).fill(''));
    setError('');
    setFocused(0);
    setTimeout(() => inputRefs.current[0]?.current?.focus(), 100);
  }, [seconds]);

  // ── Validate + navigate ──────────────────────────────────
  const handleVerify = useCallback(() => {
    const filled = otp.filter(d => d !== '').length;

    // 1. Expired code
    if (seconds <= 0) {
      setError('Your code has expired. Please request a new one.');
      triggerShake();
      return;
    }

    // 2. Incomplete OTP
    if (filled < OTP_LENGTH) {
      setError(
        filled === 0
          ? 'Please enter the verification code'
          : `Please enter all ${OTP_LENGTH} digits (${
              OTP_LENGTH - filled
            } remaining)`,
      );
      triggerShake();
      return;
    }

    // 3. All good — navigate
    setError('');
    navigation.navigate('NewPasswordScreen', { email });
  }, [otp, seconds, navigation, email, triggerShake]);

  // ── Derived ──────────────────────────────────────────────
  const isComplete = otp.every(d => d !== '');
  const isExpired = seconds <= 0;
  const canResend = isExpired;
  const hasError = error.length > 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.centreWrap}>
          {/* ── Icon circle ─────────────────────────────── */}
          <Animated.View
            style={[styles.iconCircle, { transform: [{ scale: iconScale }] }]}
          >
            <Icon name="email-outline" size={38} color={COLORS.teal} />
          </Animated.View>

          {/* ── Heading ─────────────────────────────────── */}
          <Animated.View
            style={[
              styles.textBlock,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <Text style={styles.headline}>Verify Your OTP</Text>
            <Text style={styles.subtitle}>
              We sent a {OTP_LENGTH}-digit code to
            </Text>
            <Text style={styles.emailText}>{email}</Text>
          </Animated.View>

          {/* ── OTP boxes — wrapped in shake animation ───── */}
          <Animated.View
            style={[
              styles.otpRow,
              {
                opacity: fadeAnim,
                transform: [
                  { translateY: slideAnim },
                  { translateX: shakeAnim }, // ← shake on validation failure
                ],
              },
            ]}
          >
            {otp.map((val, idx) => (
              <OTPBox
                key={idx}
                value={val}
                isFocused={focused === idx}
                hasError={hasError} // ← all boxes turn red on error
                inputRef={inputRefs.current[idx]}
                onChangeText={text => handleChange(text, idx)}
                onKeyPress={e => handleKeyPress(e, idx)}
              />
            ))}
          </Animated.View>

          {/* ── Inline error message ─────────────────────── */}
          {hasError && (
            <Animated.View style={[styles.errorRow, { opacity: fadeAnim }]}>
              <Icon
                name="alert-circle-outline"
                size={13}
                color={COLORS.error}
                style={{ marginRight: 4 }}
              />
              <Text style={styles.errorText}>{error}</Text>
            </Animated.View>
          )}

          {/* ── Expiry badge ─────────────────────────────── */}
          <Animated.View
            style={[
              styles.expiryBadge,
              { opacity: fadeAnim },
              isExpired && styles.expiryBadgeExpired,
            ]}
          >
            <Icon
              name="clock-outline"
              size={16}
              color={isExpired ? COLORS.error : COLORS.amber}
            />
            <Text
              style={[styles.expiryText, isExpired && styles.expiryTextExpired]}
            >
              {isExpired
                ? 'Code expired — request a new one'
                : `Expires in ${formatTime(seconds)}`}
            </Text>
          </Animated.View>

          {/* ── Verify button ────────────────────────────── */}
          <Animated.View style={[styles.btnWrap, { opacity: fadeAnim }]}>
            <TouchableOpacity
              onPress={handleVerify}
              activeOpacity={0.85}
              disabled={isExpired} // block tap when expired
            >
              <LinearGradient
                colors={
                  isExpired
                    ? ['#9CA3AF', '#9CA3AF'] // grey when expired
                    : [COLORS.teal, COLORS.tealDark] // teal when active
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                  styles.verifyBtn,
                  isExpired && styles.verifyBtnDisabled,
                ]}
              >
                <Text style={styles.verifyBtnText}>
                  {isExpired ? 'Code Expired' : 'Verify'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* ── Resend row ───────────────────────────────── */}
          {/*  FIX: disabled + greyed out while timer runs   */}
          <Animated.View style={[styles.resendRow, { opacity: fadeAnim }]}>
            <Text style={styles.resendLabel}>{"Didn't get the code? "}</Text>
            <TouchableOpacity
              onPress={handleResend}
              activeOpacity={canResend ? 0.7 : 1}
              disabled={!canResend}
            >
              <Text
                style={[
                  styles.resendLink,
                  !canResend && styles.resendLinkDisabled,
                ]}
              >
                {canResend ? 'Resend' : `Resend in ${formatTime(seconds)}`}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ─────────────────────────────────────────────────────────────
//  Styles
// ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  keyboardView: { flex: 1 },
  centreWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,
    paddingHorizontal: 28,
    paddingVertical: 24,
  },

  // ── Icon ──────────────────────────────────────────────────
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.tealLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },

  // ── Text ──────────────────────────────────────────────────
  textBlock: { alignItems: 'center', marginBottom: 28 },
  headline: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textGray,
    marginBottom: 3,
    textAlign: 'center',
  },
  emailText: {
    fontSize: 14,
    color: COLORS.teal,
    fontWeight: '700',
    textAlign: 'center',
  },

  // ── OTP boxes ─────────────────────────────────────────────
  otpRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8, // reduced — error msg sits below
  },
  otpBox: {
    width: 48,
    height: 54,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.boxBorder,
    backgroundColor: COLORS.boxFill,
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textDark,
    textAlign: 'center',
  },
  otpBoxFilled: {
    borderColor: COLORS.teal,
    backgroundColor: 'rgba(0,180,204,0.06)',
  },
  otpBoxFocused: { borderColor: COLORS.teal, borderWidth: 2 },
  otpBoxError: {
    borderColor: COLORS.error,
    backgroundColor: COLORS.errorLight,
  }, // ← red state

  // ── Error row ─────────────────────────────────────────────
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 6,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    textAlign: 'center',
    flexShrink: 1,
  },

  // ── Expiry badge ──────────────────────────────────────────
  expiryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.amberLight,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 28,
    gap: 6,
  },
  expiryBadgeExpired: {
    backgroundColor: COLORS.errorLight, // red tint when expired
  },
  expiryText: {
    fontSize: 13,
    color: COLORS.amber,
    fontWeight: '700',
  },
  expiryTextExpired: {
    color: COLORS.error,
  },

  // ── Verify button ─────────────────────────────────────────
  btnWrap: { width: '100%', marginBottom: 20 },
  verifyBtn: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 3,
    shadowColor: COLORS.teal,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  verifyBtnDisabled: {
    elevation: 0,
    shadowOpacity: 0,
  },
  verifyBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  // ── Resend ────────────────────────────────────────────────
  resendRow: { flexDirection: 'row', alignItems: 'center' },
  resendLabel: { fontSize: 13, color: COLORS.textGray },
  resendLink: { fontSize: 13, color: COLORS.teal, fontWeight: '700' },
  resendLinkDisabled: { color: COLORS.textLight }, // greyed when timer running
});

export default SendResetCode;
