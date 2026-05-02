// src/screens/auth/EmailVerifyForResetPass.jsx
// ─────────────────────────────────────────────────────────────
//  Forgot Password — Step 1: Enter Email
//  HelthNest App  ·  React Native CLI
//  Theme: matches ForgotPasswordOTPScreen exactly
//    - COLORS, SPACING, TYPOGRAPHY, scale from ../../theme
//    - GradientButton from ../../components/common/GradientButton
// ─────────────────────────────────────────────────────────────

import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Keyboard,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import GradientButton from '../../components/common/GradientButton';
import { COLORS, SPACING, TYPOGRAPHY, scale } from '../../theme';

// ─────────────────────────────────────────────────────────────
//  EmailVerifyForResetPass
// ─────────────────────────────────────────────────────────────
const EmailVerifyForResetPass = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Shake animation ref — used on validation failure
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // ── Shake the input row ─────────────────────────────────
  const triggerShake = useCallback(() => {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 8,
        duration: 55,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -8,
        duration: 55,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 5,
        duration: 45,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -5,
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

  // ── Validate email format ───────────────────────────────
  const isValidEmail = val => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());

  // ── Submit handler ──────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    Keyboard.dismiss();

    if (!email.trim()) {
      setError('Please enter your email address');
      triggerShake();
      return;
    }
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      triggerShake();
      return;
    }

    setError('');
    setLoading(true);

    // ── Replace with your actual API call ─────────────────
    // e.g. await authService.sendPasswordResetOTP(email.trim())
    await new Promise(resolve => setTimeout(resolve, 1400));
    // ─────────────────────────────────────────────────────

    setLoading(false);
    navigation.navigate('SendResetCode', { email: email.trim() });
  }, [email, navigation, triggerShake]);

  const handleEmailChange = text => {
    setEmail(text);
    if (error) setError('');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.background}
        translucent={false}
      />

      {/* ── Back button ─────────────────────────────────── */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        activeOpacity={0.7}
      >
        <Icon name="chevron-left" size={scale(22)} color={COLORS.textPrimary} />
      </TouchableOpacity>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          {/* ── Icon circle — same pattern as OTP screen ── */}
          <View style={styles.iconCircle}>
            <Icon name="lock-reset" size={scale(36)} color={COLORS.primary} />
          </View>

          {/* ── Heading ───────────────────────────────────── */}
          <Text style={styles.headline}>Forgot Password?</Text>
          <Text style={styles.subtitle}>
            Enter your registered email address.{'\n'}
            We'll send you a verification code.
          </Text>

          {/* ── Email input ───────────────────────────────── */}
          <Animated.View
            style={[
              styles.inputWrap,
              isFocused && styles.inputWrapFocused,
              !!error && styles.inputWrapError,
              { transform: [{ translateX: shakeAnim }] },
            ]}
          >
            <Icon
              name="email-outline"
              size={scale(18)}
              color={
                error
                  ? COLORS.error ?? '#EF4444'
                  : isFocused
                  ? COLORS.primary
                  : COLORS.textSecondary
              }
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor={COLORS.textSecondary}
              value={email}
              onChangeText={handleEmailChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
            />
          </Animated.View>

          {/* ── Inline validation error ───────────────────── */}
          {!!error && (
            <View style={styles.errorRow}>
              <Icon
                name="alert-circle-outline"
                size={scale(13)}
                color={COLORS.error ?? '#EF4444'}
              />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* ── Submit — reuses GradientButton like OTP screen */}
          <View style={styles.btnWrapper}>
            <GradientButton
              title={loading ? 'Sending...' : 'Submit'}
              onPress={handleSubmit}
              disabled={loading || !email.trim()}
            />
          </View>

          {/* ── Back to login ─────────────────────────────── */}
          <View style={styles.backToLoginRow}>
            <Text style={styles.backToLoginText}>Remember your password? </Text>
            <Text
              style={styles.backToLoginLink}
              onPress={() => navigation.navigate('Login')}
            >
              Log In
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default EmailVerifyForResetPass;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },

  // ── Back button ─────────────────────────────────────────
  backBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? scale(56) : scale(35),
    left: SPACING.screenPadding,
    width: scale(38),
    height: scale(38),
    borderRadius: scale(10),
    backgroundColor: COLORS.tealTint,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },

  // ── Main content — centred vertically like OTP screen ───
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.screenPadding,
  },

  // ── Icon circle — identical pattern to OTP screen ───────
  iconCircle: {
    width: scale(80),
    height: scale(80),
    borderRadius: scale(40),
    backgroundColor: COLORS.tealTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xxl,
  },

  // ── Typography ───────────────────────────────────────────
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
    textAlign: 'center',
    lineHeight: scale(22),
    marginBottom: SPACING.xxl,
  },

  // ── Input ────────────────────────────────────────────────
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: scale(52),
    borderRadius: scale(12),
    borderWidth: 1.5,
    borderColor: COLORS.border ?? '#E2E8F0',
    backgroundColor: COLORS.inputBackground ?? COLORS.surface ?? '#F8FAFC',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xs,
  },
  inputWrapFocused: {
    borderColor: COLORS.primary,
  },
  inputWrapError: {
    borderColor: COLORS.error ?? '#EF4444',
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.textPrimary,
    paddingVertical: 0,
  },

  // ── Error row ────────────────────────────────────────────
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: SPACING.gapSm,
    marginBottom: SPACING.md ?? SPACING.lg,
    marginTop: SPACING.xs,
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.error ?? '#EF4444',
  },

  // ── Button wrapper ───────────────────────────────────────
  btnWrapper: {
    width: '100%',
    marginTop: SPACING.lg,
  },

  // ── Back to login ────────────────────────────────────────
  backToLoginRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  backToLoginText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.textSecondary,
  },
  backToLoginLink: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.primary,
  },
});
